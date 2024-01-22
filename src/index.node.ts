import { generateRepoHighlights } from './index.shared';
import { NodeContentPath } from './ranker/ContentPath.node';

export async function getRepoHighlights(
  topPercentile: number,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  generateRepoHighlights(topPercentile, chatSources, otherSources, new NodeContentPath());
}
