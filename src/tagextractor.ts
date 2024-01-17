import { Tag } from './tagger-ts';

export { Tag };

export interface ITagExtractor {
  workspacePath: string;
  getTags(paths: string[]): Promise<Tag[]>;
}