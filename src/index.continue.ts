import { ILLMContextSizer, generateFileOutlineHighlights, highlightsThatFit } from './index.shared';
import { Source } from './parser';
import { ContinueContentPath } from './parser/ContentPath.continue';

export async function getHighlightsThatFit(
  contextSizer: ILLMContextSizer,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  return highlightsThatFit(contextSizer, chatSources, otherSources, new ContinueContentPath());
}

export async function getFileOutlineHighlights(sources: Source[]) {
  return generateFileOutlineHighlights({
    sources: sources,
    contentPath: new ContinueContentPath(),
  });
}
