import * as fs from 'fs';
import * as path from 'path';
import _ from 'lodash';
import { createDefRefs } from './defref';
import { ITagExtractor } from './tagextractor';

export async function createDefRefsFromFiles(tagGetter: ITagExtractor, absPaths: string[]) {
  const relPaths = absPaths.map(absPath => path.relative(tagGetter.workspacePath, absPath));
  const codes = absPaths.map(absPath => fs.readFileSync(absPath, 'utf8'));
  return createDefRefs(tagGetter, absPaths, relPaths, codes);
}
