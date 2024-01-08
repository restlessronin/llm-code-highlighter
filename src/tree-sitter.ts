import * as fs from 'fs';
import * as path from 'path';
import * as langmaps from './langmaps';

import Parser from 'web-tree-sitter';

const parserInitPromise = Parser.init();

export { Parser };

export class TreeSitter {
  static async create(language: string) {
    const moduleName = langmaps.getWasmPath(language);
    if (!moduleName) return;
    const wasmPath = path.join(__dirname, '../assets/wasms', moduleName);
    if (!fs.existsSync(wasmPath)) return;
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

export class AST {
  static async create(absPath: string, relPath: string) {
    const lang = langmaps.getLinguistLanguage(absPath);
    if (!lang) return;
    return AST.createLang(absPath, relPath, lang);
  }

  static async createLang(absPath: string, relPath: string, lang: string) {
    const code = fs.readFileSync(absPath, 'utf8');
    if (!code) return;
    return await AST.createFromCode(absPath, relPath, lang, code);
  }

  static async createFromCode(absPath: string, relPath: string, lang: string, code: string) {
    const treeSitter = await TreeSitter.create(lang);
    if (!treeSitter) return;
    const tree = treeSitter.parse(code);
    return new AST(treeSitter, absPath, relPath, code, tree);
  }

  constructor(
    readonly treeSitter: TreeSitter,
    readonly absPath: string,
    readonly relPath: string,
    readonly code: string,
    readonly tree: Parser.Tree
  ) {}

  captures(queryScm: string): Parser.QueryCapture[] {
    const query = this.treeSitter.parser.getLanguage().query(queryScm);
    return query.captures(this.tree.rootNode);
  }
}