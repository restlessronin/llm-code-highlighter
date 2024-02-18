import { Highlighter } from '../highlighter/Highlighter';
import { LineOfInterest } from '../highlighter/common';
import { IContentPath, Source } from '../parser';
import { NodeContentPath } from '../parser/ContentPath.node';

async function generateFileHighlights(
  source: Source,
  linesOfInterest: LineOfInterest[],
  contentPath: IContentPath
) {
  const highlighter = await Highlighter.createFromLOI(linesOfInterest, source, contentPath);
  if (!highlighter) return;
  return highlighter.toHighlights();
}

describe('CodeHighlighter', () => {
  it('should format python code correctly', async () => {
    const repomap = await generateFileHighlights(
      {
        relPath: 'test.py',
        code: `class MyClass:
  def my_method(self, arg1, arg2):
    return arg1 + arg2

def my_function(arg1, arg2):
  return arg1 * arg2`,
      },
      [1, 4],
      new NodeContentPath()
    );
    const expectedOutput = `
test.py
│class MyClass:
█  def my_method(self, arg1, arg2):
⋮...
█def my_function(arg1, arg2):
⋮...
`;
    expect(repomap).toBe(expectedOutput);
  });
});
