export type Source = { relPath: string; code: string };

export type SourceSet = { contentPath: IContentPath; sources: Source[] };

export interface IContentPath {
  getQuery(language: string): string;
  getWasmURL(language: string): string;
}
