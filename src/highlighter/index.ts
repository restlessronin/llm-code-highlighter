import { AST } from '../ranker/AST';
import { HighlightConfiguration } from './common';
import { CodeLineScopeTracker } from './CodeLineScopeTracker';
import { ScopeLineIntegrator } from './ScopeLineIntegrator';

const mapOptions = new HighlightConfiguration(10);

export async function generateHighlightedSourceCode(
  relPath: string,
  language: string,
  code: string,
  linesOfInterest: number[]
) {
  const codeLines = code.split('\n');
  const ast = await AST.createFromCode(relPath, language, code);
  if (!ast) return;
  const scopeTracker = CodeLineScopeTracker.create(codeLines.length).withScopeDataInitialized(
    ast.tree.rootNode
  );
  const header = scopeTracker.toDominantScopeBlockRepresentation(mapOptions);
  const scopeIntegrator = new ScopeLineIntegrator(codeLines, scopeTracker.scopes, header);
  const codeHighlighter = scopeIntegrator.toCodeHighlighter(linesOfInterest);
  if (!codeHighlighter) return;
  return codeHighlighter.withSmallGapsClosed().toFormattedString();
}
