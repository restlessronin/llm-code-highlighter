# llm-code-highlighter

**llm-code-highlighter** is a TypeScript library for creating succinct repository highlights, based on Paul Gauthier's repomap technique as outlined in the [Aider Chat docs](https://aider.chat/docs/repomap.html) and implemented by the code in the [Aider](https://github.com/paul-gauthier/aider) and [grep-ast](https://github.com/paul-gauthier/grep-ast) repos.

This typescript version of the original python code was created with assistance from ChatGPT 4.

## Installation

This package is distributed via npm:

```bash
npm install llm-code-highlighter
```

## Usage
```typescript
import { fileHighlights } from 'llm-code-highlighter';
```

## Contributing

* `npm run test`: Runs the test suite with Jest
* `npm run build`: Compiles the TypeScript code
