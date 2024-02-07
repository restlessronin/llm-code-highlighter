export { Tag } from './common';
export { AST } from './AST';
export { getLanguage } from './lang-utils';

import { IContentPath, Source } from './common';
import { CodeTagExtractor } from './CodeTagExtractor';
import { DefRef } from './DefRef';
import { DefRefs } from './DefRefs';

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

export { Source, IContentPath, SourceSet, DefRef };
