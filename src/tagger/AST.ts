import { Source } from './common';
import { TreeSitter, Parser } from './TreeSitter';

export class AST {
  static async createFromCode(source: Source, wasmPath: string, language: string) {
    const treeSitter = await TreeSitter.create(wasmPath, language);
    const tree = treeSitter.parse(source.code);
    return new AST(treeSitter, tree, source.relPath);
  }

  constructor(
    readonly treeSitter: TreeSitter,
    public readonly tree: Parser.Tree,
    public readonly relPath: string
  ) {}

  captures(queryScm: string): Parser.QueryCapture[] {
    const query = this.treeSitter.parser.getLanguage().query(queryScm);
    return query.captures(this.tree.rootNode);
  }
}
