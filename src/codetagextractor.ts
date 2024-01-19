import { Tag, ITagExtractor } from './tagextractor';
import { getLinguistLanguage, getQueryFileName } from './langmaps';
import { AST } from './tree-sitter';
import { Tagger } from './tagger-ts';

export class CodeTagExtractor implements ITagExtractor {
  constructor(public readonly workspacePath: string, readonly tagQuery: ITagQuery) {}

  async extractTags([absPath, relPath]: [string, string], code: string): Promise<Tag[]> {
    const language = getLinguistLanguage(absPath);
    if (!language) return [];
    const ast = await AST.createFromCode([absPath, relPath], language, code);
    if (!ast) return [];
    const tagger = Tagger.create(ast, this.tagQuery.getQuery(language));
    if (!tagger) return [];
    const data = tagger.read();
    return data;
  }
}
