import { LineOfInterest } from './common';

export class CodeHighlighter {
  constructor(
    readonly codeLines: string[],
    readonly linesOfInterest: LineOfInterest[],
    readonly showLines: LineOfInterest[]
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
    return new CodeHighlighter(this.codeLines, this.linesOfInterest, Array.from(closedShow));
  }

  toFormattedString(): string {
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
