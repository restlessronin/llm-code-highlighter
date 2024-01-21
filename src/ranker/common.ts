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

export interface IContentPath {
  getQuery(language: string): string;
  getWasmURL(language: string): string;
}
