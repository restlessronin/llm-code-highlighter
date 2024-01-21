import * as fs from 'fs';
import { getQueryFileName, getWasmPath } from './lang-utils';
import { IContentPath } from './common';

export class NodeContentPath implements IContentPath {
  getQuery(language: string): string {
    const queryFileName = `${__dirname}/../tag-qry/${getQueryFileName(language)!}`;
    return fs.readFileSync(queryFileName, 'utf8');
  }

  getWasmURL(language: string): string {
    return require.resolve(`tree-sitter-wasms/out/${getWasmPath(language)}`);
  }
}
