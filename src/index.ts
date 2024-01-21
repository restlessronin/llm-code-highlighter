import assert from 'assert';
import _ from 'lodash';
import { Tag, DefRefs, CodeTagExtractor, getLinguistLanguage, IContentPath } from './ranker/';
import { generateFileHighlights } from './highlighter/';

async function createRankedTags(
  sources: { relPath: string; code: string }[],
  contentPath: IContentPath
) {
  const extractor = new CodeTagExtractor('', contentPath);
  const defRefs = await DefRefs.create(extractor, sources);
  return defRefs.createTagranker().pagerank();
}

async function generateFileHighlights(tags: Tag[], code: string, contentPath: IContentPath) {
  const relPath = tags[0].relPath;
  const language = getLinguistLanguage(relPath)!;
  const loi = tags.map(tag => tag.start.ln - 1);
  return `\n${relPath}\n${generateFileHighlights(relPath, code, loi, contentPath)}`;
}

export async function generateHighlights(
  topPercentile: number,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[],
  contentPath: IContentPath
) {
  assert(0 < topPercentile && topPercentile <= 1);
  const allSources = [...chatSources, ...otherSources];
  const rankedTags = await createRankedTags(allSources, contentPath);
  const chatRelPaths = chatSources.map(source => source.relPath);
  const topTags = rankedTags.without(chatRelPaths).toTags();
  const maxTags = _.round(topPercentile * topTags.length);
  const mapTags = topTags.slice(0, maxTags);
  const sortedTags = _.orderBy(mapTags, ['relPath', 'start.ln'], ['asc', 'asc']);
  const groupedTags = _.groupBy(sortedTags, tag => tag.relPath);
  const fileHighlights = Object.values(groupedTags).map(tags => {
    const code = allSources.find(source => source.relPath === tags[0].relPath)!.code;
    return generateFileHighlights(tags, code, contentPath);
  });
  return _.join(fileHighlights, '');
}
