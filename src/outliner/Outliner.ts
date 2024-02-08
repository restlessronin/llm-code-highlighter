import { Tag, createAST, IContentPath, Source, AST } from '../tagger';
import { HighlightConfiguration, LineOfInterest } from '../highlighter/common';
import { SourceCodeHighlighter } from '../highlighter/SourceCodeHighlighter';

const mapOptions = new HighlightConfiguration(10);

export class Outliner {
  static async create(fileTags: Tag[], code: string, contentPath: IContentPath) {
    const relPath = fileTags[0].relPath;
    const linesOfInterest = fileTags.map(tag => tag.start.ln);
    const source = { relPath: relPath, code: code };
    return Outliner.createFromLOI(linesOfInterest, source, contentPath);
  }

  static async createFromLOI(
    linesOfInterest: LineOfInterest[],
    source: Source,
    contentPath: IContentPath
  ) {
    const ast = await createAST(source, contentPath);
    if (!ast) return;
    return new Outliner(source, linesOfInterest, ast);
  }

  constructor(
    readonly source: Source,
    readonly linesOfInterest: LineOfInterest[],
    readonly ast: AST
  ) {}

  toHighlights() {
    const codeLines = this.source.code.split('\n');
    const highlighter = new SourceCodeHighlighter(
      codeLines,
      Array.from(this.linesOfInterest).sort(),
      Array.from(new Set(this.linesOfInterest)).sort()
    );
    if (!highlighter) return;
    const highlights = highlighter.toFormattedString();
    return `\n${this.source.relPath}\n${highlights}`;
  }
}
