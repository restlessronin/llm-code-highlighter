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
  static create(ast: AST, queryScm: string) {
    return new Tagger(ast, queryScm);
  }

  constructor(readonly ast: AST, readonly queryScm: string) {}

  read(): Tag[] {
    return this.ast
      .captures(this.queryScm)
      .map(({ node, name }: { node: any; name: string }) => {
        const kind = _getKind(name);
        return kind
          ? ({
              relPath: this.ast.relPath,
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
