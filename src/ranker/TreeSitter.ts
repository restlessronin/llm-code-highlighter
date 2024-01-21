import Parser from 'web-tree-sitter';

const parserInitPromise = Parser.init();

export class TreeSitter {
  static async create(wasmPath: string, language: string) {
    await parserInitPromise;
    const languageWasm = await Parser.Language.load(wasmPath)!;
    const parser = new Parser();
    parser.setLanguage(languageWasm);
    return new TreeSitter(parser, language);
  }

  constructor(readonly parser: Parser, readonly language: any) {}

  parse(code: string): Parser.Tree {
    return this.parser.parse(code);
  }
}

export { Parser };
