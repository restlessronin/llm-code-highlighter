import * as fs from 'fs';
import * as path from 'path';
import _ from 'lodash';
import { Source, createDefRefs } from './defref';
import { ITagExtractor } from './tagextractor';

export async function createDefRefsFromFiles(tagGetter: ITagExtractor, absPaths: string[]) {
  const sources = absPaths.map(
    absPath =>
      ({
        path: [absPath, path.relative(tagGetter.workspacePath, absPath)],
        code: fs.readFileSync(absPath, 'utf8'),
      } as Source)
  );
  return createDefRefs(tagGetter, sources);
}
