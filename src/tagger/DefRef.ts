import { Tag, ITagExtractor, Source } from './common';

export class DefRef {
  static async createEach(extractor: ITagExtractor, sources: Source[]) {
    return await Promise.all(
      sources.map(async source => {
        return DefRef.create(extractor, source);
      })
    );
  }

  static async create(extractor: ITagExtractor, source: Source) {
    const tags = await extractor.extractTags(source);
    const defs = tags.filter(tag => tag.kind === 'def');
    const refs = tags.filter(tag => tag.kind === 'ref');
    return new DefRef(source.relPath, tags, defs, refs);
  }

  constructor(
    readonly relPath: string,
    readonly all: Tag[],
    readonly defs: Tag[],
    readonly refs: Tag[]
  ) {}
}
