import { generateHighlightedSourceCode } from '../highlighter';

describe('CodeHighlighter', () => {
  it('should format python code correctly', async () => {
    const repomap = await generateHighlightedSourceCode(
      'test.js',
      'Python',
      `class MyClass:
    def my_method(self, arg1, arg2):
    return arg1 + arg2

def my_function(arg1, arg2):
    return arg1 * arg2`,
      [0, 4]
    );
    console.log(repomap);
    const expectedOutput = `█class MyClass:
│    def my_method(self, arg1, arg2):
⋮...
█def my_function(arg1, arg2):
⋮...
`;
    expect(repomap).toBe(expectedOutput);
  });
});
