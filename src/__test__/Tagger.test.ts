import { AST } from '../ranker/AST';
import { Tagger } from '../ranker/Tagger';

describe('Tagger', () => {
  const jsQueryScm = `
  (
    (comment)* @doc
    .
    (method_definition
      name: (property_identifier) @name.definition.method) @definition.method
    (#not-eq? @name.definition.method "constructor")
    (#strip! @doc "^[\\s\\*/]+|^[\\s\\*/]$")
    (#select-adjacent! @doc @definition.method)
  )
  
  (
    (comment)* @doc
    .
    [
      (class
        name: (_) @name.definition.class)
      (class_declaration
        name: (_) @name.definition.class)
    ] @definition.class
    (#strip! @doc "^[\\s\\*/]+|^[\\s\\*/]$")
    (#select-adjacent! @doc @definition.class)
  )
  
  (
    (comment)* @doc
    .
    [
      (function
        name: (identifier) @name.definition.function)
      (function_declaration
        name: (identifier) @name.definition.function)
      (generator_function
        name: (identifier) @name.definition.function)
      (generator_function_declaration
        name: (identifier) @name.definition.function)
    ] @definition.function
    (#strip! @doc "^[\\s\\*/]+|^[\\s\\*/]$")
    (#select-adjacent! @doc @definition.function)
  )
  
  (
    (comment)* @doc
    .
    (lexical_declaration
      (variable_declarator
        name: (identifier) @name.definition.function
        value: [(arrow_function) (function)]) @definition.function)
    (#strip! @doc "^[\\s\\*/]+|^[\\s\\*/]$")
    (#select-adjacent! @doc @definition.function)
  )
  
  (
    (comment)* @doc
    .
    (variable_declaration
      (variable_declarator
        name: (identifier) @name.definition.function
        value: [(arrow_function) (function)]) @definition.function)
    (#strip! @doc "^[\\s\\*/]+|^[\\s\\*/]$")
    (#select-adjacent! @doc @definition.function)
  )
  
  (assignment_expression
    left: [
      (identifier) @name.definition.function
      (member_expression
        property: (property_identifier) @name.definition.function)
    ]
    right: [(arrow_function) (function)]
  ) @definition.function
  
  (pair
    key: (property_identifier) @name.definition.function
    value: [(arrow_function) (function)]) @definition.function
  
  (
    (call_expression
      function: (identifier) @name.reference.call) @reference.call
    (#not-match? @name.reference.call "^(require)$")
  )
  
  (call_expression
    function: (member_expression
      property: (property_identifier) @name.reference.call)
    arguments: (_) @reference.call)
  
  (new_expression
    constructor: (_) @name.reference.class) @reference.class
  
  `;
  describe('read for JavaScript file contents', () => {
    it('should return an empty array when there are no captures', async () => {
      const ast = await AST.createFromCode('test.js', 'JavaScript', 'let x = 1;');
      const tagger = Tagger.create(ast, jsQueryScm);
      const result = tagger?.read();
      expect(result).toEqual([]);
    });

    it('should return a single reference', async () => {
      const ast = await AST.createFromCode(
        'test.js',
        'JavaScript',
        `let x = 1;
      console.log(x);`
      );
      const tagger = Tagger.create(ast, jsQueryScm);
      const result = tagger?.read();
      expect(result).toEqual([
        {
          relPath: 'test.js',
          text: 'log',
          kind: 'ref',
          start: {
            ln: 1,
            col: 14,
          },
          end: {
            ln: 1,
            col: 17,
          },
        },
      ]);
    });
  });
});
