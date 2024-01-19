import * as path from 'path';
import { CachedFileTagExtractor } from '../cachedtagextractor.node';
import { TagRanker } from '../tagranker';
import { createDefRefsFromFiles } from '../defref.node';

import { allSources } from './codefixture';
import { CodeTagExtractor } from '../codetagextractor';
import { TagQuery } from '../tagquery.node';
import { createDefRefs } from '../defref';

describe('TagRanker', () => {
  let tagRanker: TagRanker;

  beforeEach(async () => {
    const extractor = new CodeTagExtractor('', new TagQuery());
    const defRefs = await createDefRefs(extractor, allSources);
    tagRanker = defRefs.createTagranker();
  });

  describe('create', () => {
    it('should create a new TagRanker instance', async () => {
      expect(tagRanker).toBeInstanceOf(TagRanker);
    });
  });

  describe('pagerank', () => {
    it('should return ranked definitions', () => {
      const rankedTagRanker = tagRanker.pagerank();
      expect(rankedTagRanker.rankedDefinitions).toEqual(expect.any(Array));
    });
  });
});
