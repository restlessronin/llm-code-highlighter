import { getQueryFileName, getWasmPath } from './lang-utils';
import { IContentPath } from './common';

const qryFiles = require.context('../tag-qry', false, /\.scm$/);
const wasmRoot = 'https://unpkg.com/browse/tree-sitter-wasms@latest/out/';

export class BrowserContentPath implements IContentPath {
  getQuery(language: string): string {
    return qryFiles(`./${getQueryFileName(language)!}`);
  }
  getWasmURL(language: string): string {
    return `${wasmRoot}${getWasmPath(language)}`;
  }
}
