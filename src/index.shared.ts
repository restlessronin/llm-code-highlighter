import _ from 'lodash';
import { IContentPath, Source, SourceSet } from './parser';
import { createRankedTags } from './ranker';
import { generateFileHighlightsFromTags } from './highlighter';
import { createOutlines, generateFileOutlineFromTags } from './outliner';

export interface ILLMContextSizer {
  fits(content: string): boolean;
}

export class NumCharsSizer implements ILLMContextSizer {
  constructor(readonly sizeInChars: number) {}
  fits(content: string): boolean {
    return content.length <= this.sizeInChars;
  }
}

export async function highlightsThatFit(
  contextSizer: ILLMContextSizer,
  charSourceSet: Source[],
  otherSources: Source[],
  contentPath: IContentPath
) {
  let percentile = 1;
  let prevPercentile = percentile;
  let prevHighlights;
  while (true) {
    const highlights = await generateSourceSetHighlights(
      percentile,
      charSourceSet,
      otherSources,
      contentPath
    );
    if (!highlights) return prevHighlights;
    const nextPercentile =
      (contextSizer.fits(highlights) ? prevPercentile + percentile : percentile) / 2;
    prevHighlights = contextSizer.fits(highlights) ? highlights : prevHighlights;
    prevPercentile = percentile;
    percentile = nextPercentile;
    if (Math.abs(nextPercentile - prevPercentile) < 0.01) return highlights;
  }
}

async function generateSourceSetHighlights(
  topPercentile: number,
  chatSources: Source[],
  otherSources: Source[],
  contentPath: IContentPath
) {
  if (topPercentile <= 0 || 1 < topPercentile)
    throw new Error('topPercentile must be between 0 and 1');
  const allSources = [...chatSources, ...otherSources];
  const rankedTags = await createRankedTags({ sources: allSources, contentPath: contentPath });
  if (!rankedTags) return;
  const chatRelPaths = chatSources.map(source => source.relPath);
  const topTags = rankedTags.without(chatRelPaths).toTags();
  const maxTags = _.round(topPercentile * topTags.length);
  const mapTags = topTags.slice(0, maxTags);
  const sortedTags = _.orderBy(mapTags, ['relPath', 'start.ln'], ['asc', 'asc']);
  const groupedTags = _.groupBy(sortedTags, tag => tag.relPath);
  const fileHighlights = await Promise.all(
    _.values(groupedTags).map(tags => {
      const relPath = tags[0].relPath;
      const code = allSources.find(source => source.relPath === relPath)!.code;
      return generateFileHighlightsFromTags(tags, code, contentPath);
    })
  );
  return _.join(fileHighlights, '');
}

export async function generateFileOutlineHighlights(sourceSet: SourceSet) {
  const outlines = await createOutlines(sourceSet);
  if (!outlines) return;
  const fileOutlines = await Promise.all(
    _.zip(outlines, sourceSet.sources)
      .filter(([tags, _sources]) => {
        return tags;
      })
      .map(([tags, source]) => {
        return generateFileOutlineFromTags(tags!, source!.code);
      })
  );
  return _.join(fileOutlines, '');
}
