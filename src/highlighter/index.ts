import { Tag, createAST, IContentPath, Source } from '../tagger';
import { HighlightConfiguration, LineOfInterest } from './common';
import { CodeLineScopeTracker } from './CodeLineScopeTracker';
import { ScopeLineIntegrator } from './ScopeLineIntegrator';

const mapOptions = new HighlightConfiguration(10);

export async function generateFileHighlights(
  source: Source,
  linesOfInterest: LineOfInterest[],
  contentPath: IContentPath
) {
  const ast = await createAST(source, contentPath);
  if (!ast) return;
  const codeLines = source.code.split('\n');
  const scopeTracker = CodeLineScopeTracker.create(codeLines.length).withScopeDataInitialized(
    ast.tree.rootNode
  );
  const header = scopeTracker.toDominantScopeBlockRepresentation(mapOptions);
  const scopeIntegrator = new ScopeLineIntegrator(codeLines, header);
  const codeHighlighter = scopeIntegrator.toCodeHighlighter(linesOfInterest);
  if (!codeHighlighter) return;
  const highlights = codeHighlighter.withSmallGapsClosed().toFormattedString();
  return `\n${source.relPath}\n${highlights}`;
}

export async function generateFileHighlightsFromTags(
  fileTags: Tag[],
  code: string,
  contentPath: IContentPath
) {
  const relPath = fileTags[0].relPath;
  const linesOfInterest = fileTags.map(tag => tag.start.ln);
  return generateFileHighlights({ relPath: relPath, code: code }, linesOfInterest, contentPath);
}
