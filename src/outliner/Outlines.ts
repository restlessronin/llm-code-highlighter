import _ from 'lodash';
import { SourceSet } from '../parser';
import { DefRef, Tag } from '../tagger';
import { CodeTagExtractor } from '../tagger/CodeTagExtractor';
import { Outliner } from './Outliner';

export class Outlines {
  static async create(sourceSet: SourceSet) {
    const extractor = new CodeTagExtractor('', sourceSet.contentPath);
    const defs = await Promise.all(
      sourceSet.sources.map(async source => {
        return DefRef.create(extractor, source);
      })
    );
    return new Outlines(
      defs.map(defRef => defRef.defs),
      sourceSet
    );
  }

  constructor(readonly defs: Tag[][], readonly sourceSet: SourceSet) {}

  async toCodeOutlines() {
    const codeOutlines = await Promise.all(
      _.zip(this.defs, this.sourceSet.sources)
        .filter(([tags, _sources]) => {
          return tags;
        })
        .map(async ([tags, source]) => {
          const highlighter = await Outliner.create(tags!, source!.code);
          if (!highlighter) return;
          return highlighter.toHighlights();
        })
    );
    return _.join(codeOutlines, '');
  }
}
