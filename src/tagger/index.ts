export { Tag } from './common';
export { AST } from './AST';
export { getLanguage } from './lang-utils';

import { CodeTagExtractor } from './CodeTagExtractor';
import { Source, DefRefs } from './DefRefs';
import { IContentPath } from './common';

type SourceSet = { contentPath: IContentPath; sources: Source[] };

export async function createDefRefs(sourceSet: SourceSet) {
  const extractor = new CodeTagExtractor('', sourceSet.contentPath);
  return await DefRefs.create(extractor, sourceSet.sources);
}

export async function createTags(sourceSet: SourceSet) {
  const defRefs = await createDefRefs(sourceSet);
  if (!defRefs) return;
  return defRefs.createTags();
}

export { Source, IContentPath, SourceSet };
