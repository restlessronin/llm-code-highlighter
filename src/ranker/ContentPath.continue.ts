import * as fs from 'fs';
import { getQueryFileName, getWasmPath } from './lang-utils';
import { IContentPath } from './common';

export class ContinueContentPath implements IContentPath {
  getQuery(language: string): string {
    console.log(__dirname);
    console.log(__filename);
    const queryFileName = `${__dirname}/tag-qry/${getQueryFileName(language)!}`;
    return fs.readFileSync(queryFileName, 'utf8');
  }

  getWasmURL(language: string): string {
    return `${__dirname}/tree-sitter-wasms/${getWasmPath(language)}`;
  }
}
