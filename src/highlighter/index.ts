import { Tag, getLanguage, IContentPath, AST, Source } from '../tagger';
import { HighlightConfiguration, LineOfInterest } from './common';
import { CodeLineScopeTracker } from './CodeLineScopeTracker';
import { ScopeLineIntegrator } from './ScopeLineIntegrator';

const mapOptions = new HighlightConfiguration(10);

export async function generateFileHighlights(
  source: Source,
  linesOfInterest: LineOfInterest[],
  contentPath: IContentPath
) {
  const language = getLanguage(source.relPath)!;
  const codeLines = source.code.split('\n');
  if (!language) return;
  const wasmPath = contentPath.getWasmURL(language);
  const ast = await AST.createFromCode(source, wasmPath, language);
  const scopeTracker = CodeLineScopeTracker.create(codeLines.length).withScopeDataInitialized(
    ast.tree.rootNode
  );
  const header = scopeTracker.toDominantScopeBlockRepresentation(mapOptions);
  const scopeIntegrator = new ScopeLineIntegrator(codeLines, scopeTracker.scopes, header);
  const codeHighlighter = scopeIntegrator.toCodeHighlighter(linesOfInterest);
  if (!codeHighlighter) return;
  const highlights = codeHighlighter.withSmallGapsClosed().toFormattedString();
  return `\n${source.relPath}\n${highlights}`;
}

export async function generateFileHighlightsFromTags(
  tags: Tag[],
  code: string,
  contentPath: IContentPath
) {
  const relPath = tags[0].relPath;
  const linesOfInterest = tags.map(tag => tag.start.ln - 1);
  return generateFileHighlights({ relPath: relPath, code: code }, linesOfInterest, contentPath);
}
