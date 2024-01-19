import { Tag } from './tagger-ts';

export { Tag };

export interface ITagExtractor {
  workspacePath: string;
  extractTags(relPath: string, code: string): Promise<Tag[]>;
}