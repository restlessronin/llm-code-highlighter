export { Tag } from './common';

import { SourceSet, Source, AST, IContentPath } from '../parser';
import { getLanguage } from '../parser/lang-utils';
import { CodeTagExtractor } from './CodeTagExtractor';
import { DefRef } from './DefRef';
import { DefRefs } from './DefRefs';

export async function createAST(source: Source, contentPath: IContentPath) {
  const language = getLanguage(source.relPath)!;
  if (!language) return;
  const wasmPath = contentPath.getWasmURL(language);
  return AST.createFromCode(source, wasmPath, language);
}

export async function createDefRefs(sourceSet: SourceSet) {
  const extractor = new CodeTagExtractor('', sourceSet.contentPath);
  return await DefRefs.create(extractor, sourceSet.sources);
}

export async function createTags(sourceSet: SourceSet) {
  const defRefs = await createDefRefs(sourceSet);
  if (!defRefs) return;
  return defRefs.createTags();
}

export { DefRef };
