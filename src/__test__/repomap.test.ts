import { createRepoMap } from '../repomap';

describe('CodeMapper', () => {
  it('should format python code correctly', async () => {
    const repomap = await createRepoMap(
      ['test.js', 'test.js'],
      'Python',
      `class MyClass:
    def my_method(self, arg1, arg2):
        return arg1 + arg2

def my_function(arg1, arg2):
    return arg1 * arg2`,
      [1, 4]
    );
    console.log(repomap);
    const expectedOutput = `⋮...\n█2:     def my_method(self, arg1, arg2):
⋮...\n█5: def my_function(arg1, arg2):
⋮...\n`;
    expect(repomap).toBe(expectedOutput);
  });
});
