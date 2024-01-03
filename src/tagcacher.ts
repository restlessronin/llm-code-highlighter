import * as fs from 'fs';
import * as path from 'path';
import { Tag, Tagger } from './tagger-ts';

function _getMtime(absPath: string): number | undefined {
  try {
    return fs.statSync(absPath).mtimeMs;
  } catch (e) {
    return;
  }
}

export async function createDefRefs(tagCacher: TagCacher, absPath: string, relPath: string) {
  const tags = await tagCacher.getTags(absPath, relPath);
  const defs = tags.filter(tag => tag.kind === 'def');
  const refs = tags.filter(tag => tag.kind === 'ref');
  return [relPath, defs, refs] as [string, Tag[], Tag[]];
}

export class TagCacher {
  static readonly CACHE_FILE_NAME: string = 'tags.cache.json';

  readonly workspacePath: string;
  readonly cache: { [key: string]: { mtime: number; data: Tag[] } };

  static create(workspacePath: string) {
    const cacheFileName = path.join(workspacePath, TagCacher.CACHE_FILE_NAME);
    const cache = fs.existsSync(cacheFileName)
      ? JSON.parse(fs.readFileSync(cacheFileName, 'utf8'))
      : {};
    return new TagCacher(workspacePath, cache);
  }

  constructor(workspacePath: string, cache: { [key: string]: { mtime: number; data: Tag[] } }) {
    this.workspacePath = workspacePath;
    this.cache = cache;
  }

  async getTags(absPath: string, relPath: string): Promise<Tag[]> {
    const fileMtime = _getMtime(absPath);
    if (!fileMtime) return [];
    const value = this.cache[absPath];
    if (value && value.mtime === fileMtime) {
      return value.data;
    }
    const tagger = await Tagger.create(absPath, relPath);
    if (!tagger) return [];
    const data = tagger.read();
    this.cache[absPath] = { mtime: fileMtime, data: data };
    return data;
  }

  writeCache() {
    const cacheFileName = path.join(this.workspacePath, TagCacher.CACHE_FILE_NAME);
    fs.writeFileSync(cacheFileName, JSON.stringify(this.cache), 'utf8');
  }
}
