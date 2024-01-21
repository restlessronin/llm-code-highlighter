import * as fs from 'fs';
import { getQueryFileName } from './lang-utils';
import { IContentPath } from './common';

export class NodeContentPath implements IContentPath {
  getQuery(language: string): string {
    const queryFileName = `${__dirname}/../tag-qry/${getQueryFileName(language)!}`;
    return fs.readFileSync(queryFileName, 'utf8');
  }
  getWasmURL(language: string): string {
    throw new Error('Method not implemented.');
  }
}
