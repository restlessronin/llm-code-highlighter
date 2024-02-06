import { Tag, ITagExtractor } from './common';

export type Source = { relPath: string; code: string };

export class DefRef {
  static async createEach(tagGetter: ITagExtractor, sources: Source[]) {
    return await Promise.all(
      sources.map(async source => {
        return DefRef.create(tagGetter, source);
      })
    );
  }

  static async create(tagGetter: ITagExtractor, source: Source) {
    const tags = await tagGetter.extractTags(source.relPath, source.code);
    const defs = tags.filter(tag => tag.kind === 'def');
    const refs = tags.filter(tag => tag.kind === 'ref');
    return { relPath: source.relPath, all: tags, defs: defs, refs: refs } as DefRef;
  }

  constructor(
    readonly relPath: string,
    readonly all: Tag[],
    readonly defs: Tag[],
    readonly refs: Tag[]
  ) {}
}
