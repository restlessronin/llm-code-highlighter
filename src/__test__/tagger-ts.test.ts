import { AST } from '../tree-sitter';
import { Tagger } from '../tagger-ts';
import { createTagger } from '../cachedfiletagextractor.node';

describe('Tagger', () => {
  let tagger: Tagger;
  let mockParser: any;
  let mockLanguage: any;

  describe('read for JavaScript file contents', () => {
    it('should return an empty array when there are no captures', async () => {
      const ast = await AST.createFromCode(['test.js', 'test.js'], 'JavaScript', 'let x = 1;');
      const tagger = await createTagger(ast);
      const result = tagger?.read();
      expect(result).toEqual([]);
    });

    it('should return a single reference', async () => {
      const ast = await AST.createFromCode(
        ['test.js', 'test.js'],
        'JavaScript',
        `let x = 1;
        console.log(x);`
      );
      const tagger = await createTagger(ast);
      const result = tagger?.read();
      expect(result).toEqual([
        {
          relPath: 'test.js',
          absPath: 'test.js',
          text: 'log',
          kind: 'ref',
          start: {
            ln: 1,
            col: 16,
          },
          end: {
            ln: 1,
            col: 19,
          },
        },
      ]);
    });
  });
});
