import { Tag, getLanguage, IContentPath, AST } from '../tagger';
import { HighlightConfiguration, LineOfInterest } from './common';
import { CodeLineScopeTracker } from './CodeLineScopeTracker';
import { ScopeLineIntegrator } from './ScopeLineIntegrator';

const mapOptions = new HighlightConfiguration(10);

export async function generateFileHighlights(
  relPath: string,
  code: string,
  linesOfInterest: LineOfInterest[],
  contentPath: IContentPath
) {
  const language = getLanguage(relPath)!;
  const codeLines = code.split('\n');
  if (!language) return;
  const wasmPath = contentPath.getWasmURL(language);
  const ast = await AST.createFromCode(relPath, code, wasmPath, language);
  const scopeTracker = CodeLineScopeTracker.create(codeLines.length).withScopeDataInitialized(
    ast.tree.rootNode
  );
  const header = scopeTracker.toDominantScopeBlockRepresentation(mapOptions);
  const scopeIntegrator = new ScopeLineIntegrator(codeLines, scopeTracker.scopes, header);
  const codeHighlighter = scopeIntegrator.toCodeHighlighter(linesOfInterest);
  if (!codeHighlighter) return;
  const highlights = codeHighlighter.withSmallGapsClosed().toFormattedString();
  return `\n${relPath}\n${highlights}`;
}

export async function generateFileHighlightsFromTags(
  tags: Tag[],
  code: string,
  contentPath: IContentPath
) {
  const relPath = tags[0].relPath;
  const linesOfInterest = tags.map(tag => tag.start.ln - 1);
  return generateFileHighlights(relPath, code, linesOfInterest, contentPath);
}
