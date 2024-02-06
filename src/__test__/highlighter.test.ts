import { generateFileHighlights } from '../highlighter';
import { NodeContentPath } from '../tagger/ContentPath.node';

describe('CodeHighlighter', () => {
  it('should format python code correctly', async () => {
    const repomap = await generateFileHighlights(
      'test.py',
      `class MyClass:
  def my_method(self, arg1, arg2):
    return arg1 + arg2

def my_function(arg1, arg2):
  return arg1 * arg2`,
      [0, 4],
      new NodeContentPath()
    );
    const expectedOutput = `
test.py
█class MyClass:
│  def my_method(self, arg1, arg2):
⋮...
█def my_function(arg1, arg2):
⋮...
`;
    expect(repomap).toBe(expectedOutput);
  });
});
