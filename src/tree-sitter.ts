import * as fs from 'fs';
import * as path from 'path';
import * as langmaps from './langmaps';
import Parser from 'web-tree-sitter';

const parserInitPromise = Parser.init();

class TreeSitter {
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

export { Parser };

export class AST {
  static async create([absPath, relPath]: [string, string]) {
    const lang = langmaps.getLinguistLanguage(absPath);
    if (!lang) return;
    return AST.createLang([absPath, relPath], lang);
  }

  static async createLang([absPath, relPath]: [string, string], lang: string) {
    const code = fs.readFileSync(absPath, 'utf8');
    if (!code) return;
    return await AST.createFromCode([absPath, relPath], lang, code);
  }

  static async createFromCode([absPath, relPath]: [string, string], lang: string, code: string) {
    const treeSitter = await TreeSitter.create(lang);
    if (!treeSitter) return;
    const tree = treeSitter.parse(code);
    return new AST(treeSitter, tree, absPath, relPath);
  }

  constructor(
    readonly treeSitter: TreeSitter,
    readonly tree: Parser.Tree,
    readonly absPath: string,
    readonly relPath: string
  ) {}

  captures(queryScm: string): Parser.QueryCapture[] {
    const query = this.treeSitter.parser.getLanguage().query(queryScm);
    return query.captures(this.tree.rootNode);
  }
}