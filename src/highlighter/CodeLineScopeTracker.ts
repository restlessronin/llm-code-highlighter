import { Parser } from '../parser/TreeSitter';
import { Scopes } from './common';

export type ScopeStarts = Set<number>;

export class CodeLineScopeTracker {
  static create(numLines: number) {
    const nodes = new Array<Parser.SyntaxNode[]>(numLines).fill([]).map(() => []);
    const scopes = new Array(numLines).fill(new Set<number>());
    const headers: [number, number, number][][] = new Array<[number, number, number][]>(numLines)
      .fill([])
      .map(() => []);
    return new CodeLineScopeTracker(numLines, nodes, scopes, headers);
  }

  constructor(
    readonly numLines: number,
    readonly nodes: Parser.SyntaxNode[][],
    readonly scopeStarts: ScopeStarts[],
    readonly scopes: Scopes[]
  ) {}

  withScopeDataInitialized(node: Parser.SyntaxNode, depth: number = 0) {
    const startLine = node.startPosition.row;
    const endLine = node.endPosition.row;
    const size = endLine - startLine;
    this.nodes[startLine].push(node);
    if (size) {
      this.scopes[startLine].push([size, startLine, endLine]);
    }
    for (let i = startLine; i <= endLine; i++) {
      this.scopeStarts[i].add(startLine);
    }
    node.children.forEach(child => this.withScopeDataInitialized(child, depth + 1));
    return this;
  }

  toDominantScopes() {
    const scopes: Scopes = new Array<[number, number, number]>(this.numLines).fill([0, 0, 0]);
    for (let i = 0; i < this.numLines; i++) {
      const scopesI = this.scopes[i].sort((a, b) => a[0] - b[0]);
      scopes[i] = scopesI.length > 1 ? scopesI[0] : [1, i, i + 1];
    }
    return scopes;
  }
}
