import { CodeTagExtractor, DefRefs, IContentPath } from '../tagger';
import { TagRanker } from './TagRanker';

export async function createRankedTags(
  sources: { relPath: string; code: string }[],
  contentPath: IContentPath
) {
  const extractor = new CodeTagExtractor('', contentPath);
  const defRefs = await DefRefs.create(extractor, sources);
  if (!defRefs) return;
  const tags = defRefs.createTags();
  if (!tags) return;
  const tagRanker = new TagRanker(tags);
  return tagRanker.pagerank();
}
