import { SourceSet, DefRef } from './tagger';
import { CodeTagExtractor } from './tagger/CodeTagExtractor';

export async function createOutlines(sourceSet: SourceSet) {
  const extractor = new CodeTagExtractor('', sourceSet.contentPath);
  const defs = await Promise.all(
    sourceSet.sources.map(async source => {
      return await DefRef.create(extractor, source);
    })
  );
  return defs.map(defRef => defRef.defs);
}
