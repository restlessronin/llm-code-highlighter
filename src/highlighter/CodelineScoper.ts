import { Parser } from '../parser/TreeSitter';
import { LineScoper } from './LineScoper';
import { LineRange, ScopeStarts, Scopes } from './common';

export class CodelineScoper {
  static create(numLines: number) {
    const scopes: [number, number, number][][] = new Array<[number, number, number][]>(numLines)
      .fill([])
      .map(() => []);
    return new CodelineScoper(numLines, scopes);
  }

  constructor(readonly numLines: number, readonly scopes: Scopes[]) {}

  withScopeDataInitialized(node: Parser.SyntaxNode, depth: number = 0) {
    const startLine = node.startPosition.row;
    const endLine = node.endPosition.row;
    const size = endLine - startLine;
    if (size) {
      this.scopes[startLine].push([size, startLine, endLine]);
    }
    node.children.forEach(child => this.withScopeDataInitialized(child, depth + 1));
    return this;
  }

  toDominantScopes(codeLines: string[]) {
    const scopes = new Array<LineRange>(this.numLines);
    for (let i = 0; i < this.numLines; i++) {
      const scopesI = this.scopes[i].sort((a, b) => {
        for (let i = 0; i < 3; i++) {
          if (a[i] < b[i]) return -1;
          else if (a[i] > b[i]) return 1;
        }
        return 0;
      });
      scopes[i] = scopesI.length > 1 ? (scopesI[0].slice(1) as LineRange) : [0, -1];
    }
    const scopeStarts: ScopeStarts[] = new Array(this.numLines).fill(new Set<number>());
    scopes.forEach(([startLine, endLine]) => {
      for (let i = startLine; i <= endLine; i++) {
        scopeStarts[i].add(startLine);
      }
    });
    return new LineScoper(codeLines, scopeStarts);
  }
}
