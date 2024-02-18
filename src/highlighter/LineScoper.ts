import { CodeHighlighter } from './CodeHighlighter';
import { ScopeStarts } from './common';

export class LineScoper {
  constructor(readonly codeLines: string[], readonly scopeStarts: ScopeStarts[]) {}

  parentScopes(lineNumbers: number[]) {
    return Array.from(lineNumbers)
      .map(lineOfInterest => this.scopeStarts[lineOfInterest])
      .filter(scopeStarts => scopeStarts.size > 0)
      .reduce((acc, scopeStarts) => {
        return new Set([...acc, ...scopeStarts]);
      }, new Set());
  }

  toCodeHighlighter(lineNumbers: number[]) {
    if (lineNumbers.length === 0) return;
    const parentScopes = this.parentScopes(lineNumbers);
    const allLines = Array.from(new Set([...parentScopes, ...new Set(lineNumbers)]));
    const linesOfInterest = [...lineNumbers].sort((a, b) => a - b);
    const showLines = [...allLines].sort((a, b) => a - b);
    return new CodeHighlighter(this.codeLines, linesOfInterest, showLines);
  }
}
