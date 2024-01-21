import { TreeSitter, Parser } from './TreeSitter';

export class AST {
  static async createFromCode(relPath: string, code: string, wasmPath: string, language: string) {
    const treeSitter = await TreeSitter.create(wasmPath, language);
    const tree = treeSitter.parse(code);
    return new AST(treeSitter, tree, relPath);
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
