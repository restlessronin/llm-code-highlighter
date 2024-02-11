import { generateFileOutlineHighlights, generateSourceSetHighlights } from './index.shared';
import { Source } from './parser';
import { BrowserContentPath } from './parser/ContentPath.browser';

export async function getSourceSetHighlights(
  topPercentile: number,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  return generateSourceSetHighlights(
    topPercentile,
    chatSources,
    otherSources,
    new BrowserContentPath()
  );
}

export async function getFileOutlineHighlights(sources: Source[]) {
  return generateFileOutlineHighlights({
    sources: sources,
    contentPath: new BrowserContentPath(),
  });
}
