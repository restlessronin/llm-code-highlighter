import { CodeTagExtractor } from '../tagger/CodeTagExtractor';
import { NodeContentPath } from '../parser/ContentPath.node';
import { DefRefs } from '../tagger/DefRefs';
import { TagRanker } from '../ranker/TagRanker';
import { pythonSources } from './codefixture';

describe('TagRanker', () => {
  let tagRanker: TagRanker;

  beforeEach(async () => {
    const extractor = new CodeTagExtractor('', new NodeContentPath());
    const defRefs = await DefRefs.create(extractor, pythonSources);
    const tags = defRefs!.createTags();
    tagRanker = new TagRanker(tags!);
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
