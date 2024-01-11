import * as fs from 'fs';
import * as langmaps from './langmaps';
import Parser from 'web-tree-sitter';

const parserInitPromise = Parser.init();

class TreeSitter {
  static async create(language: string) {
    const moduleName = langmaps.getWasmPath(language);
    if (!moduleName) return;
    const wasmPath = require.resolve('tree-sitter-wasms/out/' + moduleName);
    await parserInitPromise;
    const languageWasm = await Parser.Language.load(wasmPath);
    const parser = new Parser();
    if (!languageWasm) return;
    parser.setLanguage(languageWasm);
    return new TreeSitter(parser, language);
  }

  constructor(readonly parser: Parser, readonly language: any) {}

  parse(code: string): Parser.Tree {
    return this.parser.parse(code);
  }
}

export { Parser };

export class AST {
  static async createFromCode([absPath, relPath]: [string, string], lang: string, code: string) {
    const treeSitter = (await TreeSitter.create(lang))!;
    const tree = treeSitter.parse(code);
    return new AST(treeSitter, tree, absPath, relPath);
  }

  constructor(
    readonly treeSitter: TreeSitter,
    public readonly tree: Parser.Tree,
    readonly absPath: string,
    readonly relPath: string
  ) {}

  captures(queryScm: string): Parser.QueryCapture[] {
    const query = this.treeSitter.parser.getLanguage().query(queryScm);
    return query.captures(this.tree.rootNode);
  }
}
