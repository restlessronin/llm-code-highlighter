import _ from 'lodash';
import { IContentPath, Source, SourceSet } from './parser';
import { Highlights } from './highlighter';
import { Outlines } from './outliner';

export interface ILLMContextSizer {
  fits(content: string): boolean;
}

export async function highlightsThatFit(
  contextSizer: ILLMContextSizer,
  chatSources: Source[],
  otherSources: Source[],
  contentPath: IContentPath
) {
  const highlights = await Highlights.create(chatSources, otherSources, contentPath);
  if (!highlights) return;
  let loPercentile = 0;
  let hiPercentile = 1;
  let percentile = 1;
  let highlightedCode;
  while (0.001 <= Math.abs(hiPercentile - loPercentile)) {
    highlightedCode = await highlights.toCodeHighlights(percentile);
    const fits = !highlightedCode || contextSizer.fits(highlightedCode);
    loPercentile = fits ? percentile : loPercentile;
    hiPercentile = fits ? hiPercentile : percentile;
    percentile = (loPercentile + hiPercentile) / 2;
  }
  return highlightedCode;
}

export async function outlines(sourceSet: SourceSet) {
  const outlines = await Outlines.create(sourceSet);
  if (!outlines) return;
  return outlines.toCodeOutlines();
}
