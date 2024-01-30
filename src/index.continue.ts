import { generateRepoHighlights } from './index.shared';
import { ContinueContentPath } from './ranker/ContentPath.continue';

export async function getRepoHighlights(
  topPercentile: number,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  return generateRepoHighlights(
    topPercentile,
    chatSources,
    otherSources,
    new ContinueContentPath()
  );
}
