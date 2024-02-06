import { generateSourceSetHighlights } from './index.shared';
import { ContinueContentPath } from './tagger/ContentPath.continue';

export async function getRepoHighlights(
  topPercentile: number,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  return generateSourceSetHighlights(
    topPercentile,
    chatSources,
    otherSources,
    new ContinueContentPath()
  );
}
