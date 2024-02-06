import _ from 'lodash';
import { IContentPath } from './tagger';
import { createRankedTags } from './ranker';
import { generateFileHighlightsFromTags } from './highlighter';

export async function generateFileSetHighlights(
  topPercentile: number,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[],
  contentPath: IContentPath
) {
  if (topPercentile <= 0 || 1 < topPercentile)
    throw new Error('topPercentile must be between 0 and 1');
  const allSources = [...chatSources, ...otherSources];
  const rankedTags = await createRankedTags(allSources, contentPath);
  if (!rankedTags) return;
  const chatRelPaths = chatSources.map(source => source.relPath);
  const topTags = rankedTags.without(chatRelPaths).toTags();
  const maxTags = _.round(topPercentile * topTags.length);
  const mapTags = topTags.slice(0, maxTags);
  const sortedTags = _.orderBy(mapTags, ['relPath', 'start.ln'], ['asc', 'asc']);
  const groupedTags = _.groupBy(sortedTags, tag => tag.relPath);
  const fileHighlights = _.values(groupedTags).map(tags => {
    const relPath = tags[0].relPath;
    const code = allSources.find(source => source.relPath === relPath)!.code;
    return generateFileHighlightsFromTags(tags, code, contentPath);
  });
  return _.join(fileHighlights, '');
}

export async function generateFileOutlineHighlights(
  sources: { relPath: string; code: string }[],
  contentPath: IContentPath
) {}
