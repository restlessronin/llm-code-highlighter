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
  extractTags(relPath: string, code: string): Promise<Tag[]>;
}

export interface ITagQuery {
  getQuery(language: string): string;
}
