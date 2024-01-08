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
      [0, 4]
    );
    console.log(repomap);
    const expectedOutput = `█1: class MyClass:
│2:     def my_method(self, arg1, arg2):
⋮...
█5: def my_function(arg1, arg2):
⋮...
`;
    expect(repomap).toBe(expectedOutput);
  });
});
