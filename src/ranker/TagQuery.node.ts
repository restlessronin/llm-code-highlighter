import * as fs from 'fs';
import { getQueryFileName } from './lang-utils';
import { ITagQuery } from './common';

export class TagQuery implements ITagQuery {
  getQuery(language: string): string {
    const queryFileName = `${__dirname}/../queries/${getQueryFileName(language)!}`;
    return fs.readFileSync(queryFileName, 'utf8');
  }
}
