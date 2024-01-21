import * as fs from 'fs';
import { getQueryFileName } from './lang-utils';
import { ITagQuery } from './common';

export class NodeTagQuery implements ITagQuery {
  getQuery(language: string): string {
    const queryFileName = `${__dirname}/../tag-qry/${getQueryFileName(language)!}`;
    return fs.readFileSync(queryFileName, 'utf8');
  }
}
