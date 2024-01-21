import * as langmaps from './lang-utils';
import Parser from 'web-tree-sitter';

const parserInitPromise = Parser.init();

export class TreeSitter {
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
