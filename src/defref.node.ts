import * as fs from 'fs';
import * as path from 'path';
import _ from 'lodash';
import { CachedFileTagExtractor } from './cachedtagextractor.node';
import { Tag } from './tagger-ts';
import { DefRef, DefRefs } from './defref';

export async function createDefRefs(tagGetter: CachedFileTagExtractor, absPaths: string[]) {
  const relPaths = absPaths.map(absPath => path.relative(tagGetter.workspacePath, absPath));
  const absRelPaths = _.zip(absPaths, relPaths) as [string, string][];
  const defRefs = await Promise.all(
    absRelPaths.map(async path => {
      const [absPath, relPath] = path;
      const code = fs.readFileSync(absPath, 'utf8');
      const tags = await tagGetter.extractTags(path, code);
      const defs = tags.filter(tag => tag.kind === 'def');
      const refs = tags.filter(tag => tag.kind === 'ref');
      return { path: [absPath, relPath], all: tags, defs: defs, refs: refs } as DefRef;
    })
  );
  return new DefRefs(tagGetter.workspacePath, defRefs);
}
