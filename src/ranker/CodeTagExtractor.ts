import { Tag, ITagExtractor, ITagQuery } from './common';
import { getLinguistLanguage } from './lang-utils';
import { AST } from './AST';
import { Tagger } from './Tagger';

export class CodeTagExtractor implements ITagExtractor {
  constructor(public readonly workspacePath: string, readonly tagQuery: ITagQuery) {}

  async extractTags(relPath: string, code: string): Promise<Tag[]> {
    const language = getLinguistLanguage(relPath);
    if (!language) return [];
    const ast = await AST.createFromCode(relPath, language, code);
    if (!ast) return [];
    const tagger = Tagger.create(ast, this.tagQuery.getQuery(language));
    if (!tagger) return [];
    const data = tagger.read();
    return data;
  }
}
