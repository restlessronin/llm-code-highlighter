import * as fs from 'fs';
import * as path from 'path';
import * as langmaps from './langmaps';

import Parser from 'web-tree-sitter';

const parserInitPromise = Parser.init();

export { Parser };

export class TreeSitter {
  readonly parser: Parser;
  readonly language: string;

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

  constructor(parser: Parser, language: any) {
    this.parser = parser;
    this.language = language;
  }

  parse(code: string): Parser.Tree {
    return this.parser.parse(code);
  }
}
