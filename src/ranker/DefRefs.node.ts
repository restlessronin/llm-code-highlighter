import * as fs from 'fs';
import * as path from 'path';
import _ from 'lodash';
import { Source, DefRefs } from './DefRefs';
import { ITagExtractor } from './common';

export async function createDefRefsFromFiles(tagGetter: ITagExtractor, absPaths: string[]) {
  const sources = absPaths.map(
    absPath =>
      ({
        relPath: path.relative(tagGetter.workspacePath, absPath),
        code: fs.readFileSync(absPath, 'utf8'),
      } as Source)
  );
  return DefRefs.create(tagGetter, sources);
}
