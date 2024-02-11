import { IContentPath, Source, getLanguage, AST } from '../parser';
import { ITagExtractor } from './common';
import { Tagger } from './Tagger';
import { TagQuery } from './TagQuery';

export class CodeTagExtractor implements ITagExtractor {
  constructor(public readonly workspacePath: string, readonly contentPath: IContentPath) {}

  async extractTags(source: Source) {
    const language = getLanguage(source.relPath);
    if (!language) return [];
    const wasmPath = this.contentPath.getWasmURL(language);
    const ast = await AST.createFromCode(source, wasmPath, language);
    const tagQuery = new TagQuery(this.contentPath);
    const tagger = Tagger.create(ast, tagQuery.getQuery(language));
    return tagger.read();
  }
}
