import * as fs from 'fs';
import * as langmaps from './langmaps';

import { TreeSitter, Parser } from './tree-sitter';

export class AST {
  readonly treeSitter: TreeSitter;
  readonly absPath: string;
  readonly relPath: string;
  readonly code: string;
  readonly tree: Parser.Tree;

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
    treeSitter: TreeSitter,
    absPath: string,
    relPath: string,
    code: string,
    tree: Parser.Tree
  ) {
    this.treeSitter = treeSitter;
    this.absPath = absPath;
    this.relPath = relPath;
    this.code = code;
    this.tree = tree;
  }

  captures(queryScm: string): Parser.QueryCapture[] {
    const query = this.treeSitter.parser.getLanguage().query(queryScm);
    return query.captures(this.tree.rootNode);
  }
}
