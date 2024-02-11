import { getSourceSetHighlights, getFileOutlineHighlights } from '../index.node';

describe('getSourceSetHighlights', () => {
  it('should return the concatenated highlights for the top percentile of non-chat tags', async () => {
    const topPercentile = 0.2;
    const chatSources = [
      {
        relPath: 'chat1.js',
        code: `
          console.log(add(1, 2));
        `,
      },
      {
        relPath: 'chat2.js',
        code: `
          console.log(subtract(3, 1));
        `,
      },
    ];

    const otherSources = [
      {
        relPath: 'file1.js',
        code: `
function add(a, b) {
  return a + b;
}
console.log(add(1, 2));
`,
      },
      {
        relPath: 'file2.js',
        code: `
function subtract(a, b) {
  return a - b;
}
console.log(subtract(3, 1));
`,
      },
      {
        relPath: 'file3.js',
        code: `
function multiply(a, b) {
  return a * b;
}
console.log(multiply(2, 3));
`,
      },
    ];

    const result = await getSourceSetHighlights(topPercentile, chatSources, otherSources);

    expect(result).toBe(`
file1.js
⋮...
█function add(a, b) {
│  return a + b;
⋮...
`);
  });
});

describe('getFileOutlineHighlights', () => {
  it('should return the concatenated outlines for all the files', async () => {
    const sources = [
      {
        relPath: 'file1.js',
        code: `function add(a, b) {
      return a + b;
    }`,
      },
      {
        relPath: 'file2.js',
        code: `function subtract(a, b) {
      return a - b;
    }`,
      },
    ];

    const result = await getFileOutlineHighlights(sources);

    expect(result).toBe(`
file1.js
█function add(a, b) {
⋮...

file2.js
█function subtract(a, b) {
⋮...
`);
  });
});
