import * as fs from 'fs';
import * as path from 'path';
import { Tag, ITagExtractor } from './tagextractor';
import { CodeTagExtractor } from './codetagextractor';
import { TagQuery } from './tagquery.node';

function _getMtime(absPath: string): number | undefined {
  try {
    return fs.statSync(absPath).mtimeMs;
  } catch (e) {
    return;
  }
}

export class CachedFileTagExtractor implements ITagExtractor {
  static readonly CACHE_FILE_NAME: string = 'tags.cache.json';

  static create(workspacePath: string): CachedFileTagExtractor {
    const cacheFileName = path.join(workspacePath, CachedFileTagExtractor.CACHE_FILE_NAME);
    const cache = fs.existsSync(cacheFileName)
      ? JSON.parse(fs.readFileSync(cacheFileName, 'utf8'))
      : {};
    const extractor = new CodeTagExtractor(workspacePath, new TagQuery());
    return new CachedFileTagExtractor(extractor, cache);
  }

  constructor(
    readonly extractor: CodeTagExtractor,
    readonly cache: { [key: string]: { mtime: number; data: Tag[] } }
  ) {}

  get workspacePath() {
    return this.extractor.workspacePath;
  }

  async getTags([absPath, relPath]: [string, string]): Promise<Tag[]> {
    const fileMtime = _getMtime(absPath);
    if (!fileMtime) return [];
    const value = this.cache[absPath];
    if (value && value.mtime === fileMtime) {
      return value.data;
    }
    const code = fs.readFileSync(absPath, 'utf8');
    if (!code) return [];
    return this.extractor.extractTags([absPath, relPath], code);
  }

  async extractTags(path: [string, string], code: string): Promise<Tag[]> {
    return this.extractor.extractTags(path, code);
  }

  writeCache() {
    const cacheFileName = path.join(this.workspacePath, CachedFileTagExtractor.CACHE_FILE_NAME);
    fs.writeFileSync(cacheFileName, JSON.stringify(this.cache), 'utf8');
  }
}