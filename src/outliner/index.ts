import { Outliner } from './Outliner';
import { Tag, SourceSet, DefRef, IContentPath, Source } from '../tagger';
import { CodeTagExtractor } from '../tagger/CodeTagExtractor';
import { LineOfInterest } from '../highlighter/common';

export async function createOutlines(sourceSet: SourceSet) {
  const extractor = new CodeTagExtractor('', sourceSet.contentPath);
  const defs = await Promise.all(
    sourceSet.sources.map(async source => {
      return DefRef.create(extractor, source);
    })
  );
  return defs.map(defRef => defRef.defs);
}

export async function generateFileOutlineFromTags(
  fileTags: Tag[],
  code: string,
  contentPath: IContentPath
) {
  const highlighter = await Outliner.create(fileTags, code, contentPath);
  if (!highlighter) return;
  return highlighter.toHighlights();
}

export async function generateFileOutline(
  source: Source,
  linesOfInterest: LineOfInterest[],
  contentPath: IContentPath
) {
  const highlighter = await Outliner.createFromLOI(linesOfInterest, source, contentPath);
  if (!highlighter) return;
  return highlighter.toHighlights();
}
