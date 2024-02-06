import { generateFileSetHighlights } from './index.shared';
import { BrowserContentPath } from './tagger/ContentPath.browser';

export async function getRepoHighlights(
  topPercentile: number,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  return generateFileSetHighlights(
    topPercentile,
    chatSources,
    otherSources,
    new BrowserContentPath()
  );
}
