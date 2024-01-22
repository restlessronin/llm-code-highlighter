import { generateRepoHighlights } from '.';
import { BrowserContentPath } from './ranker/ContentPath.browser';

export async function getRepoHighlights(
  topPercentile: number,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  generateRepoHighlights(topPercentile, chatSources, otherSources, new BrowserContentPath());
}
