import { range } from 'lodash';
import { AST, Parser } from './tree-sitter';

type LineOfInterest = number;
type Scope = Set<number>;

class MapOptions {
  constructor(readonly headerMax: number) {}
}

class CodeHighlighter {
  constructor(
    readonly codeLines: string[],
    readonly linesOfInterest: LineOfInterest[],
    readonly showLines: LineOfInterest[],
    readonly scopes: Scope[]
  ) {}

  withSmallGapsClosed(): CodeHighlighter {
    const closedShow = new Set<number>();
    const sortedShow = Array.from(this.showLines).sort((a, b) => a - b);
    for (let i = 0; i < sortedShow.length - 1; i++) {
      closedShow.add(sortedShow[i]);
      if (sortedShow[i + 1] - sortedShow[i] === 2) {
        closedShow.add(sortedShow[i] + 1);
      }
    }
    if (sortedShow.length > 0) {
      closedShow.add(sortedShow[sortedShow.length - 1]);
    }
    return new CodeHighlighter(
      this.codeLines,
      this.linesOfInterest,
      Array.from(closedShow),
      this.scopes
    );
  }

  format(): string {
    return this.codeLines.reduce((acc, line, i) => {
      return acc + this.formatLine(line, i);
    }, '');
  }

  private formatLine(lineContent: string, i: number) {
    const isLineOfInterest = this.linesOfInterest.includes(i);
    const shouldShowLine = this.showLines.includes(i);
    if (shouldShowLine) {
      const linePrefix = isLineOfInterest ? '█' : '│';
      return `${linePrefix}${lineContent}\n`;
    } else {
      return i === 0 || this.showLines.includes(i - 1) ? '⋮...\n' : '';
    }
  }
}

class FileScopes {
  constructor(
    readonly codeLines: string[],
    readonly scopes: Scope[],
    readonly header: [number, number, number][]
  ) {}

  buildCodeHighlighter(lineNumbers: number[]) {
    const linesOfInterest = new Set<number>(lineNumbers);
    if (linesOfInterest.size === 0) {
      return;
    }
    const showLines = new Set(linesOfInterest);
    this.linesFromParentScopes(linesOfInterest).forEach(lineNum => {
      showLines.add(lineNum);
    });
    return new CodeHighlighter(
      this.codeLines,
      Array.from(linesOfInterest).sort(),
      Array.from(showLines).sort(),
      this.scopes
    );
  }

  private linesFromParentScopes(linesOfInterest: Set<number>) {
    return new Set(
      Array.from(linesOfInterest).reduce((acc, scopeStart) => {
        const header = this.header[scopeStart];
        if (header.length > 0) {
          const [_, start, end] = header;
          return range(start, end).reduce((accI, i) => {
            return accI.add(i);
          }, acc);
        } else {
          return acc.add(scopeStart);
        }
      }, new Set<number>())
    );
  }
}

class LineScopes {
  static create(numLines: number) {
    const nodes = new Array<Parser.SyntaxNode[]>(numLines).fill([]).map(() => []);
    const scopes = new Array(numLines).fill(new Set<number>());
    const headers: [number, number, number][][] = new Array<[number, number, number][]>(numLines)
      .fill([])
      .map(() => []);
    return new LineScopes(numLines, nodes, scopes, headers);
  }

  constructor(
    readonly numLines: number,
    readonly nodes: Parser.SyntaxNode[][],
    readonly scopes: Scope[],
    readonly headers: [number, number, number][][]
  ) {}

  init(node: Parser.SyntaxNode, depth: number = 0) {
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
    node.children.forEach(child => this.init(child, depth + 1));
    return this;
  }

  toDominantBlock(mapOptions: MapOptions) {
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

const mapOptions = new MapOptions(10);

export async function getHighlightedCode(
  relPath: string,
  language: string,
  code: string,
  linesOfInterest: number[]
) {
  const codeLines = code.split('\n');
  const ast = await AST.createFromCode(relPath, language, code);
  if (!ast) return;
  const lineScopes = LineScopes.create(codeLines.length).init(ast.tree.rootNode);
  const header = lineScopes.toDominantBlock(mapOptions);
  const fileScopes = new FileScopes(codeLines, lineScopes.scopes, header);
  const codeHighlighter = fileScopes.buildCodeHighlighter(linesOfInterest);
  if (!codeHighlighter) return;
  return codeHighlighter.withSmallGapsClosed().format();
}
