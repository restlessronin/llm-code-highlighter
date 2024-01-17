import * as path from 'path';
import { CachingTagExtactor } from '../cachingtagextractor.node';
import { TagRanker } from '../defranker';

describe('TagRanker', () => {
  let tagCacher: CachingTagExtactor;
  let tagRanker: TagRanker;
  let workspacePath: string;
  let absPaths: string[];

  beforeEach(async () => {
    workspacePath = path.resolve(__dirname, '../../_testworkspace_'); // Create a subdirectory named 'testWorkspace'
    absPaths = [
      path.resolve(workspacePath, 'test_file_with_identifiers.py'),
      path.resolve(workspacePath, 'test_file_import.py'),
      path.resolve(workspacePath, 'test_file_pass.py'),
    ];
    tagCacher = CachingTagExtactor.create(workspacePath);
    tagRanker = await TagRanker.create(tagCacher, absPaths);
  });

  describe('create', () => {
    it('should create a new TagRanker instance', async () => {
      expect(tagRanker).toBeInstanceOf(TagRanker);
    });
  });

  describe('rank', () => {
    it('should return ranked definitions', () => {
      const rankedTagRanker = tagRanker.rank();
      expect(rankedTagRanker.ranked).toEqual(expect.any(Array));
      expect(rankedTagRanker.rankedDefinitions).toEqual(expect.any(Map));
    });
  });
});
