import assert from 'assert';
import _ from 'lodash';
import { Tag, DefRefs, CodeTagExtractor, getLinguistLanguage } from './ranker/';
import { NodeTagQuery } from './ranker/TagQuery.node';
import { generateHighlightedSourceCode } from './highlighter/';

async function createRankedTags(sources: { relPath: string; code: string }[]) {
  const extractor = new CodeTagExtractor('', new NodeTagQuery());
  const defRefs = await DefRefs.create(extractor, sources);
  return defRefs.createTagranker().pagerank();
}

async function createFileHighlights(tags: Tag[], code: string) {
  const relPath = tags[0].relPath;
  const language = getLinguistLanguage(relPath)!;
  return `\n${relPath}\n${generateHighlightedSourceCode(
    relPath,
    language,
    code,
    tags.map(tag => tag.start.ln - 1)
  )}`;
}

export async function fileHighlights(
  topPercentile: number,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  assert(0 < topPercentile && topPercentile <= 1);
  const allSources = [...chatSources, ...otherSources];
  const rankedTags = await createRankedTags(allSources);
  const chatRelPaths = chatSources.map(source => source.relPath);
  const topTags = rankedTags.without(chatRelPaths).toTags();
  const maxTags = _.round(topPercentile * topTags.length);
  const mapTags = topTags.slice(0, maxTags);
  const sortedTags = _.orderBy(mapTags, ['relPath', 'start.ln'], ['asc', 'asc']);
  const groupedTags = _.groupBy(sortedTags, tag => tag.relPath);
  const fileHighlights = Object.values(groupedTags).map(tags => {
    return createFileHighlights(
      tags,
      allSources.find(source => source.relPath === tags[0].relPath)!.code
    );
  });
  return _.join(fileHighlights, '');
}
