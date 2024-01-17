import * as fs from 'fs';
import * as path from 'path';
import { Tag, ITagCacher } from './tagextractor';
import { getLinguistLanguage, getQueryFileName } from './langmaps';
import { AST } from './tree-sitter';
import { Tagger } from './tagger-ts';

export async function createASTFromPath([absPath, relPath]: [string, string]) {
  const language = getLinguistLanguage(absPath);
  if (!language) return;
  const code = fs.readFileSync(absPath, 'utf8');
  return AST.createFromCode([absPath, relPath], language, code);
}

export async function createTagger(ast: AST) {
  const qFnName = getQueryFileName(ast.treeSitter.language);
  if (!qFnName) return;
  const scmFname = path.join(__dirname, 'queries', qFnName);
  if (!fs.existsSync(scmFname)) return;
  const queryScm = fs.readFileSync(scmFname, 'utf8');
  return Tagger.create(ast, queryScm);
}

function _getMtime(absPath: string): number | undefined {
  try {
    return fs.statSync(absPath).mtimeMs;
  } catch (e) {
    return;
  }
}

export class NodeTagCacher implements ITagCacher {
  static readonly CACHE_FILE_NAME: string = 'tags.cache.json';

  static create(workspacePath: string) {
    const cacheFileName = path.join(workspacePath, NodeTagCacher.CACHE_FILE_NAME);
    const cache = fs.existsSync(cacheFileName)
      ? JSON.parse(fs.readFileSync(cacheFileName, 'utf8'))
      : {};
    return new NodeTagCacher(workspacePath, cache);
  }

  constructor(
    public readonly workspacePath: string,
    readonly cache: { [key: string]: { mtime: number; data: Tag[] } }
  ) {}

  async getTags([absPath, relPath]: [string, string]): Promise<Tag[]> {
    const fileMtime = _getMtime(absPath);
    if (!fileMtime) return [];
    const value = this.cache[absPath];
    if (value && value.mtime === fileMtime) {
      return value.data;
    }
    const ast = await createASTFromPath([absPath, relPath]);
    if (!ast) return [];
    const tagger = await createTagger(ast);
    if (!tagger) return [];
    const data = tagger.read();
    this.cache[absPath] = { mtime: fileMtime, data: data };
    return data;
  }

  writeCache() {
    const cacheFileName = path.join(this.workspacePath, NodeTagCacher.CACHE_FILE_NAME);
    fs.writeFileSync(cacheFileName, JSON.stringify(this.cache), 'utf8');
  }
}
