import { CodeTagExtractor } from '../tagger/CodeTagExtractor';
import { NodeContentPath } from '../tagger/ContentPath.node';
import { DefRef } from '../tagger/DefRef';
import { generateFileOutlineFromTags } from '../outliner';
import {
  test_typescript_code,
  expected_outlines_typescript,
  test_python_code,
  expected_outlines_python,
} from './codefixture';

describe('outliner', () => {
  let extractor: CodeTagExtractor;
  let contentPath: NodeContentPath;

  beforeEach(async () => {
    contentPath = new NodeContentPath();
    extractor = new CodeTagExtractor('', contentPath);
  });

  describe('create', () => {
    it('should create a new DefRef instance', async () => {
      const defRef = await DefRef.create(extractor, test_typescript_code);
      expect(defRef).toBeInstanceOf(DefRef);
    });
  });

  describe('highlight outline', () => {
    it('should return python definitions', async () => {
      const defRef = await DefRef.create(extractor, test_python_code);
      const defs = defRef.defs;
      const outline = await generateFileOutlineFromTags(defs, test_python_code.code);
      expect(outline).toBe(expected_outlines_python);
    });

    it('should return typescript definitions', async () => {
      const defRef = await DefRef.create(extractor, test_typescript_code);
      const defs = defRef.defs;
      if (!defs || defs.length === 0) return;
      const outline = await generateFileOutlineFromTags(defs, test_typescript_code.code);
      expect(outline).toBe(expected_outlines_typescript);
    });
  });
});
