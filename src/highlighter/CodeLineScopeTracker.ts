import { Parser } from '../tagger/TreeSitter';
import { Scope, HighlightConfiguration } from './common';

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
    readonly scopes: Scope[],
    readonly headers: [number, number, number][][]
  ) {}

  withScopeDataInitialized(node: Parser.SyntaxNode, depth: number = 0) {
    const startLine = node.startPosition.row;
    const endLine = node.endPosition.row;
    const size = endLine - startLine;
    this.nodes[startLine].push(node);
    if (size) {
      this.headers[startLine].push([size, startLine, endLine]);
    }
    for (let i = startLine; i <= endLine; i++) {
      this.scopes[i].add(startLine);
    }
    node.children.forEach(child => this.withScopeDataInitialized(child, depth + 1));
    return this;
  }

  toDominantScopeBlockRepresentation(mapOptions: HighlightConfiguration) {
    const headerMax = mapOptions.headerMax;
    const header = new Array<[number, number, number]>(this.numLines).fill([0, 0, 0]);
    for (let i = 0; i < this.numLines; i++) {
      const headers = this.headers[i].sort((a, b) => a[0] - b[0]);
      let [size, headStart, headEnd] = [1, i, i + 1];
      if (headers.length > 1) {
        [size, headStart, headEnd] = headers[0];
        if (size > headerMax) {
          headEnd = headStart + headerMax;
        }
      }
      header[i] = [size, headStart, headEnd];
    }
    return header;
  }
}
