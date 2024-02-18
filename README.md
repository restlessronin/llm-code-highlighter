# llm-code-highlighter

**llm-code-highlighter** is a TypeScript library for creating succinct repository highlights, based on a simplified version of Paul Gauthier's repomap technique as outlined in the [Aider Chat docs](https://aider.chat/docs/repomap.html) and implemented by the code in the [aider](https://github.com/paul-gauthier/aider) and [grep-ast](https://github.com/paul-gauthier/grep-ast) repos.

This typescript version of the original python code was created with assistance from ChatGPT 4. Every line of code was manually curated (by me, @restlessronin 😇).

## Installation

At the moment, this plugin is only being actively developed against the [Continue repository](https://github.com/continuedev/continue). If you are interested in other use cases, please [file an issue on the repository](https://github.com/restlessronin/llm-code-highlighter/issues) and I'll see what I can do to accommodate.

To install llm-code-highlighter, you can use npm or yarn:

```bash
npm install llm-code-highlighter
```

### Usage

To use llm-code-highlighter in your TypeScript project, you need to import the required functions:

```typescript
import { getHighlightsThatFit, getOutlines, ILLMContextSizer } from 'llm-code-highlighter';
```

`getHighlightsThatFit`

The getHighlightsThatFit function selects top-ranked tags to generate highlights for a set of source files. The function takes chat sources, and other sources, and returns the maximum number of top-ranked tags (only from other sources) that will fit into the token budget specified in the Context Sizer.

```typescript
const contextSizer = {
  fits(content: string): boolean {
    return content.length <= 100;
  },
} as ILLMContextSizer;

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
          console.log(multiply(3, 1));
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

const result = await getHighlightsThatFit(contextSizer, chatSources, otherSources);
console.log(result);
// Output:
// file1.js
// ⋮...
// █function add(a, b) {
// ⋮...
//
// file3.js
// ⋮...
// █function multiply(a, b) {
// ⋮...
```

`getOutlines`

This function generates an outline for a set of files by only displaying the definition lines. It takes an array of objects, each containing the path and source code for a file. The function generates outlines for each of the files, concatenates all of them, and returns the result as a single string.

```typescript
const sources = [
  {
    relPath: 'file1.js',
    code: `
function add(a, b) {
  return a + b;
}`,
  },
  {
    relPath: 'file2.js',
    code: `
function subtract(a, b) {
  return a - b;
}`,
  },
];

const outlines = await getOutlines(sources);

console.log(outlines);
// Output:
// file1.js
// █function add(a, b) {
// ⋮...
//
// file2.js
//  █function subtract(a, b) {
// ⋮...
```

Please refer to the source code for more details and options.
