import * as fs from 'fs';
import { getQueryFileName } from './langmaps';

export class TagQuery implements ITagQuery {
  getQuery(language: string): string {
    const queryFileName = `${__dirname}/queries/${getQueryFileName(language)!}`;
    return fs.readFileSync(queryFileName, 'utf8');
  }
}
