import { IContentPath } from './common';
import { Language } from './lang-utils';

export class TagQuery {
  constructor(readonly contentPath: IContentPath) {}
  getQuery(language: Language) {
    if (language === 'TypeScript') {
      return this.contentPath.getQuery('JavaScript') + this.contentPath.getQuery('TypeScript');
    } else {
      return this.contentPath.getQuery(language);
    }
  }
}
