import { IContentPath, Source, Tag } from '../tagger';
import { Highlighter } from './Highlighter';
import { LineOfInterest } from './common';

export async function generateFileHighlightsFromTags(
  fileTags: Tag[],
  code: string,
  contentPath: IContentPath
) {
  const highlighter = await Highlighter.create(fileTags, code, contentPath);
  if (!highlighter) return;
  return highlighter.toHighlights();
}

export async function generateFileHighlights(
  source: Source,
  linesOfInterest: LineOfInterest[],
  contentPath: IContentPath
) {
  const highlighter = await Highlighter.createFromLOI(linesOfInterest, source, contentPath);
  if (!highlighter) return;
  return highlighter.toHighlights();
}

export { Highlighter };
