import { CodeTagExtractor } from '../tagger/CodeTagExtractor';
import { NodeContentPath } from '../tagger/ContentPath.node';
import { DefRef } from '../tagger/DefRef';
import { test_typescript_code } from './codefixture';

describe('outliner', () => {
  let defRef: DefRef;

  beforeEach(async () => {
    const extractor = new CodeTagExtractor('', new NodeContentPath());
    defRef = await DefRef.create(extractor, test_typescript_code);
  });

  describe('create', () => {
    it('should create a new DefRef instance', async () => {
      expect(defRef).toBeInstanceOf(DefRef);
    });
  });

  describe('pagerank', () => {
    it('should return ranked definitions', () => {});
  });
});
