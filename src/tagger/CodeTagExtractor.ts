import { ITagExtractor, IContentPath, Source } from './common';
import { getLanguage } from './lang-utils';
import { AST } from './AST';
import { Tagger } from './Tagger';

export class CodeTagExtractor implements ITagExtractor {
  constructor(public readonly workspacePath: string, readonly contentPath: IContentPath) {}

  async extractTags(source: Source) {
    const language = getLanguage(source.relPath);
    if (!language) return [];
    const wasmPath = this.contentPath.getWasmURL(language);
    const ast = await AST.createFromCode(source, wasmPath, language);
    const tagger = Tagger.create(ast, this.contentPath.getQuery(language));
    return tagger.read();
  }
}
