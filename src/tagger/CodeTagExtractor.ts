import { ITagExtractor, IContentPath } from './common';
import { getLanguage } from './lang-utils';
import { AST } from './AST';
import { Tagger } from './Tagger';

export class CodeTagExtractor implements ITagExtractor {
  constructor(public readonly workspacePath: string, readonly contentPath: IContentPath) {}

  async extractTags(relPath: string, code: string) {
    const language = getLanguage(relPath);
    if (!language) return [];
    const wasmPath = this.contentPath.getWasmURL(language);
    const ast = await AST.createFromCode(relPath, code, wasmPath, language);
    const tagger = Tagger.create(ast, this.contentPath.getQuery(language));
    return tagger.read();
  }
}
