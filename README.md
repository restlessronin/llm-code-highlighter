# llm-code-highlighter

**llm-code-highlighter** is a TypeScript library for creating succinct repository highlights, based on Paul Gauthier's repomap technique as outlined in the [Aider Chat docs](https://aider.chat/docs/repomap.html) and implemented by the code in the [aider](https://github.com/paul-gauthier/aider) and [grep-ast](https://github.com/paul-gauthier/grep-ast) repos.

This typescript version of the original python code was created with assistance from ChatGPT 4. Every line of code was manually curated by me (@restlessronin) 😇.

## Installation

At the moment, this plugin is only being actively developed against the [Continue repository](https://github.com/continuedev/continue). If you are interested in other use cases, please [file an issue on the repository](https://github.com/restlessronin/llm-code-highlighter/issues) and I'll see what I can do to accommodate.

To install llm-code-highlighter, you can use npm or yarn:

```bash
npm install llm-code-highlighter
```

### Usage

To use llm-code-highlighter in your TypeScript project, you need to import the required functions:

```typescript
import { generateFileOutlineHighlights, generateSourceSetHighlights } from 'llm-code-highlighter';
```

`generateSourceSetHighlights`

This function generates highlights for a source set by selecting the top percentile of ranked tags from non-chat sources. It uses PageRank to rank all tags across the source set, filters out tags from chat sources, takes the top percentile of tags, groups them by file, and generates highlights for each file. The highlights are then concatenated and returned as a single string.

```typescript
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
console.log(result);
// Output:
// file1.js
// ⋮...
// █function add(a, b) {
// │  return a + b;
// ⋮...
```

`generateFileOutlineHighlights`

This function generates an outline for a set of files by only displaying the definition lines. It takes an array of objects, each containing the path and source code for a file. The function generates outlines for all the files, concatenates them, and returns the concatenated outlines as a single string.

````typescript
const sources = [
      {
        relPath: 'file1.js',
        code: 'function add(a, b) { return a + b; }',
      },
      {
        relPath: 'file2.js',
        code: 'function subtract(a, b) { return a - b; }',
      },
    ];

    const outlines = await getFileOutlineHighlights(sources);

    console.log(outlines);
    // Output:
    // file1.js
    // █function add(a, b) { return a + b; }
    //
    // file2.js
    // █function subtract(a, b) { return a - b; }
```

Please refer to the source code for more details and options.
````
