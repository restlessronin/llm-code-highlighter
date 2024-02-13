import { ILLMContextSizer, generateFileOutlineHighlights, highlightsThatFit } from './index.shared';
import { Source } from './parser';
import { BrowserContentPath } from './parser/ContentPath.browser';

export async function getHighlightsThatFit(
  contextSizer: ILLMContextSizer,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  return highlightsThatFit(contextSizer, chatSources, otherSources, new BrowserContentPath());
}

export async function getFileOutlineHighlights(sources: Source[]) {
  return generateFileOutlineHighlights({
    sources: sources,
    contentPath: new BrowserContentPath(),
  });
}

export { ILLMContextSizer };
