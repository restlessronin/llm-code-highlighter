import * as fs from 'fs';
import * as path from 'path';
import * as langmaps from './langmaps';
import { AST } from './tree-sitter';

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
  readonly ast: AST;
  readonly queryScm: string;

  static async createFromPath(absPath: string, relPath: string) {
    const language = langmaps.getLinguistLanguage(absPath);
    if (!language) return;
    const code = fs.readFileSync(absPath, 'utf8');
    return Tagger.createFromCode(absPath, relPath, language, code);
  }

  static async createFromCode(absPath: string, relPath: string, language: string, code: string) {
    const ast = await AST.createFromCode(absPath, relPath, language, code);
    if (!ast) return;
    return Tagger.create(ast)!;
  }

  static async create(ast: AST) {
    const qFnName = langmaps.getQueryFileName(ast.treeSitter.language);
    if (!qFnName) return;
    const scmFname = path.join(__dirname, 'queries', qFnName);
    if (!fs.existsSync(scmFname)) return;
    const queryScm = fs.readFileSync(scmFname, 'utf8');
    return new Tagger(ast, queryScm);
  }

  constructor(ast: AST, querySCM: string) {
    this.ast = ast;
    this.queryScm = querySCM;
  }

  read(): Tag[] {
    return this.ast
      .captures(this.queryScm)
      .map(({ node, name }: { node: any; name: string }) => {
        const kind = _getKind(name);
        return kind
          ? ({
              relPath: this.ast.relPath,
              absPath: this.ast.absPath,
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
