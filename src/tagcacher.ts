import { Tag } from './tagger-ts';

export { Tag };

export interface ITagCacher {
  workspacePath: string;
  getTags(paths: string[]): Promise<Tag[]>;
  writeCache(): void;
}
