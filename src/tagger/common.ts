import { Source } from '../parser';

export type Tag = {
  relPath: string;
  text: string;
  kind: string;
  start: {
    ln: number;
    col: number;
  };
  end: {
    ln: number;
    col: number;
  };
};

export interface ITagExtractor {
  workspacePath: string;
  extractTags(source: Source): Promise<Tag[]>;
}
