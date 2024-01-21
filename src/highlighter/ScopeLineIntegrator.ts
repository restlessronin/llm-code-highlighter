import _ from 'lodash';
import { Scope } from './common';
import { SourceCodeHighlighter } from './SourceCodeHighlighter';

export class ScopeLineIntegrator {
  constructor(
    readonly codeLines: string[],
    readonly scopes: Scope[],
    readonly header: [number, number, number][]
  ) {}

  toCodeHighlighter(lineNumbers: number[]) {
    const linesOfInterest = new Set<number>(lineNumbers);
    if (linesOfInterest.size === 0) {
      return;
    }
    const showLines = new Set(linesOfInterest);
    this.includeLinesFromParentScopes(linesOfInterest).forEach(lineNum => {
      showLines.add(lineNum);
    });
    return new SourceCodeHighlighter(
      this.codeLines,
      Array.from(linesOfInterest).sort(),
      Array.from(showLines).sort(),
      this.scopes
    );
  }

  private includeLinesFromParentScopes(linesOfInterest: Set<number>) {
    return new Set(
      Array.from(linesOfInterest).reduce((acc, scopeStart) => {
        const header = this.header[scopeStart];
        if (header.length > 0) {
          const [_uu, start, end] = header;
          return _.range(start, end).reduce((accI, i) => {
            return accI.add(i);
          }, acc);
        } else {
          return acc.add(scopeStart);
        }
      }, new Set<number>())
    );
  }
}
