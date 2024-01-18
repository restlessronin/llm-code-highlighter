import { Tag } from './tagger-ts';

export { Tag };

export interface ITagExtractor {
  workspacePath: string;
  extractTags(path: [string, string], code: string): Promise<Tag[]>;
}