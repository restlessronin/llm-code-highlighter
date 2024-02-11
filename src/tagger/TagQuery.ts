import { IContentPath, Language } from '../parser';

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
