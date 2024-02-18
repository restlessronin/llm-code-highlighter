import { Source } from '../parser';
import { Tag } from '../tagger';
import { LineOfInterest } from '../highlighter/common';
import { CodeHighlighter } from '../highlighter/CodeHighlighter';

export class Outliner {
  static async create(fileTags: Tag[], code: string) {
    const relPath = fileTags[0].relPath;
    const linesOfInterest = fileTags.map(tag => tag.start.ln);
    const source = { relPath: relPath, code: code };
    return Outliner.createFromLOI(linesOfInterest, source);
  }

  static async createFromLOI(linesOfInterest: LineOfInterest[], source: Source) {
    return new Outliner(source, linesOfInterest);
  }

  constructor(readonly source: Source, readonly linesOfInterest: LineOfInterest[]) {}

  toHighlights() {
    const codeLines = this.source.code.split('\n');
    const highlighter = new CodeHighlighter(
      codeLines,
      Array.from(this.linesOfInterest).sort((a, b) => a - b),
      Array.from(new Set(this.linesOfInterest)).sort((a, b) => a - b)
    );
    if (!highlighter) return;
    const highlights = highlighter.toFormattedString();
    return `\n${this.source.relPath}\n${highlights}`;
  }
}
