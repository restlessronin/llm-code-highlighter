import * as fs from 'fs';
import * as path from 'path';
import * as langmaps from './langmaps';

import Parser from 'web-tree-sitter';

const parserInitPromise = Parser.init();

function _getKind(tag: string) {
  if (tag.startsWith('name.definition.')) {
    return 'def';
  } else if (tag.startsWith('name.reference.')) {
    return 'ref';
  } else {
    return;
  }
}

export type Tag = {
  relPath: string;
  absPath: string;
  text: string;
  kind: string;
  start: {
    ln: number;
    col: number;
  };
  end: {
    ln: number;
    col: number;
  };
};

export class Tagger {
  readonly absPath: string;
  readonly relPath: string;
  readonly parser: Parser;
  readonly language: any;
  readonly queryScm: string;
  readonly code: string;

  static async create(absPath: string, relPath: string) {
    const lang = langmaps.getLinguistLanguage(absPath);
    if (!lang) return;
    return this.createLang(absPath, relPath, lang);
  }

  static async createLang(absPath: string, relPath: string, lang: string) {
    const code = fs.readFileSync(absPath, 'utf8');
    if (!code) return;
    return await Tagger.createFromCode(absPath, relPath, lang, code);
  }

  static async createFromCode(absPath: string, relPath: string, lang: string, code: string) {
    const qFnName = langmaps.getQueryFileName(lang);
    if (!qFnName) return;
    const scmFname = path.join(__dirname, 'queries', qFnName);
    if (!fs.existsSync(scmFname)) return;
    const queryScm = fs.readFileSync(scmFname, 'utf8');
    const moduleName = langmaps.getWasmPath(lang);
    if (!moduleName) return;
    const wasmPath = path.join(__dirname, '../assets/wasms', 'tree-sitter-javascript.wasm');
    if (!fs.existsSync(wasmPath)) return;
    await parserInitPromise;
    const languageWasm = await Parser.Language.load(wasmPath);
    const parser = new Parser();
    if (!languageWasm) return;
    parser.setLanguage(languageWasm);
    return new Tagger(absPath, relPath, parser, queryScm, code);
  }

  constructor(absPath: string, relPath: string, parser: Parser, queryScm: string, code: string) {
    this.absPath = absPath;
    this.relPath = relPath;
    this.parser = parser;
    this.queryScm = queryScm;
    this.code = code;
  }

  read(): Tag[] {
    const tree = this.parser.parse(this.code);
    const query = this.parser.getLanguage().query(this.queryScm);
    const captures = query.captures(tree.rootNode);
    return captures
      .map(({ node, name }: { node: any; name: string }) => {
        const kind = _getKind(name);
        return kind
          ? ({
              relPath: this.relPath,
              absPath: this.absPath,
              text: node.text,
              kind: kind,
              start: {
                ln: node.startPosition.row,
                col: node.startPosition.column,
              },
              end: {
                ln: node.endPosition.row,
                col: node.endPosition.column,
              },
            } as Tag)
          : undefined;
      })
      .filter((tag: Tag | undefined): tag is Tag => tag !== undefined);
  }
}
