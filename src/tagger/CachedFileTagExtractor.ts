import * as fs from 'fs';
import * as path from 'path';
import { Source } from '../parser';
import { Tag, ITagExtractor } from './common';
import { CodeTagExtractor } from './CodeTagExtractor';
import { NodeContentPath } from '../parser/ContentPath.node';

export class CachedFileTagExtractor implements ITagExtractor {
  static readonly CACHE_FILE_NAME: string = 'tags.cache.json';

  static create(workspacePath: string): CachedFileTagExtractor {
    const cacheFileName = path.join(workspacePath, CachedFileTagExtractor.CACHE_FILE_NAME);
    const cache = fs.existsSync(cacheFileName)
      ? JSON.parse(fs.readFileSync(cacheFileName, 'utf8'))
      : {};
    const extractor = new CodeTagExtractor(workspacePath, new NodeContentPath());
    return new CachedFileTagExtractor(extractor, cache);
  }

  private static getMtime(absPath: string): number | undefined {
    try {
      return fs.statSync(absPath).mtimeMs;
    } catch (e) {
      return;
    }
  }

  constructor(
    readonly extractor: CodeTagExtractor,
    readonly cache: { [key: string]: { mtime: number; data: Tag[] } }
  ) {}

  get workspacePath() {
    return this.extractor.workspacePath;
  }

  getAbsPath(relPath: string): string {
    return path.join(this.workspacePath, relPath);
  }

  async getTags(relPath: string): Promise<Tag[]> {
    const absPath = this.getAbsPath(relPath);
    const fileMtime = CachedFileTagExtractor.getMtime(absPath);
    if (!fileMtime) return [];
    const value = this.cache[absPath];
    if (value && value.mtime === fileMtime) {
      return value.data;
    }
    const code = fs.readFileSync(absPath, 'utf8');
    if (!code) return [];
    return this.extractor.extractTags({ relPath: relPath, code: code });
  }

  async extractTags(source: Source): Promise<Tag[]> {
    return this.extractor.extractTags(source);
  }

  writeCache() {
    const cacheFileName = path.join(this.workspacePath, CachedFileTagExtractor.CACHE_FILE_NAME);
    fs.writeFileSync(cacheFileName, JSON.stringify(this.cache), 'utf8');
  }
}
