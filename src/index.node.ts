import { generateHighlights } from '.';
import { NodeContentPath } from './ranker/ContentPath.node';

export async function generateRepoHighlights(
  topPercentile: number,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  generateHighlights(topPercentile, chatSources, otherSources, new NodeContentPath());
}
