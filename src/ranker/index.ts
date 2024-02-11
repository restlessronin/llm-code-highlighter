import { SourceSet } from '../parser';
import { createTags } from '../tagger';
import { TagRanker } from './TagRanker';

export async function createRankedTags(sourceSet: SourceSet) {
  const tags = await createTags(sourceSet);
  if (!tags) return;
  const tagRanker = new TagRanker(tags);
  return tagRanker.pagerank();
}
