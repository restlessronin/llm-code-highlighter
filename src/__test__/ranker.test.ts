import * as path from 'path';
import { TagRanker } from '../ranker/tagranker';

import { allSources } from './codefixture';
import { CodeTagExtractor } from '../ranker/CodeTagExtractor';
import { TagQuery } from '../ranker/TagQuery.node';
import { DefRefs } from '../ranker/DefRefs';

describe('TagRanker', () => {
  let tagRanker: TagRanker;

  beforeEach(async () => {
    const extractor = new CodeTagExtractor('', new TagQuery());
    const defRefs = await DefRefs.create(extractor, allSources);
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
