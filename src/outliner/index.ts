import { Outliner } from './Outliner';
import { Source, SourceSet } from '../parser';
import { Tag, DefRef } from '../tagger';
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

export async function generateFileOutlineFromTags(fileTags: Tag[], code: string) {
  const highlighter = await Outliner.create(fileTags, code);
  if (!highlighter) return;
  return highlighter.toHighlights();
}

export async function generateFileOutline(source: Source, linesOfInterest: LineOfInterest[]) {
  const highlighter = await Outliner.createFromLOI(linesOfInterest, source);
  if (!highlighter) return;
  return highlighter.toHighlights();
}
