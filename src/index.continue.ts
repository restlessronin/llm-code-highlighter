import { generateFileOutlineHighlights, generateSourceSetHighlights } from './index.shared';
import { Source } from './parser';
import { ContinueContentPath } from './parser/ContentPath.continue';

export async function getSourceSetHighlights(
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

export async function getFileOutlineHighlights(sources: Source[]) {
  return generateFileOutlineHighlights({
    sources: sources,
    contentPath: new ContinueContentPath(),
  });
}
