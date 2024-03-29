import { IContentPath, Source, AST } from '../parser';
import { Tag, createAST } from '../tagger';
import { LineOfInterest } from './common';
import { CodelineScoper } from './CodelineScoper';

export class Highlighter {
  static async create(fileTags: Tag[], code: string, contentPath: IContentPath) {
    const relPath = fileTags[0].relPath;
    const linesOfInterest = fileTags.map(tag => tag.start.ln);
    const source = { relPath: relPath, code: code };
    return await Highlighter.createFromLOI(linesOfInterest, source, contentPath);
  }

  static async createFromLOI(
    linesOfInterest: LineOfInterest[],
    source: Source,
    contentPath: IContentPath
  ) {
    const ast = await createAST(source, contentPath);
    if (!ast) return;
    return new Highlighter(source, linesOfInterest, ast);
  }

  constructor(
    readonly source: Source,
    readonly linesOfInterest: LineOfInterest[],
    readonly ast: AST
  ) {}

  toHighlights() {
    const codeLines = this.source.code.split('\n');
    const scopeTracker = CodelineScoper.create(codeLines.length).withScopeDataInitialized(
      this.ast.tree.rootNode
    );
    const scopes = scopeTracker.toDominantScopes(codeLines);
    const highlighter = scopes.toCodeHighlighter(this.linesOfInterest);
    if (!highlighter) return;
    const highlights = highlighter.withSmallGapsClosed().toFormattedString();
    return `\n${this.source.relPath}\n${highlights}`;
  }
}
