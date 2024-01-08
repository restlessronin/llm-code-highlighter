import { Tag } from './tagger-ts';

export class RepoSummarizer {
  static readonly CACHE_FILE_NAME: string = 'repo.cache.json';

  static create(maxTokens: number) {
    return new RepoSummarizer(maxTokens);
  }

  readonly maxTokens: number;
  readonly tokenizer = {
    encode: (text: string) => text.split(' '),
  };

  constructor(maxTokens: number) {
    this.maxTokens = maxTokens;
  }

  private toDefsPerFileMap(defs: Tag[]) {
    return defs.reduce((map, decl) => {
      if (!map[decl.absPath]) map[decl.absPath] = [];
      (map[decl.absPath] as Tag[]).push(decl);
      return map;
    }, {} as { [key: string]: Tag[] });
  }

  private defToLine(def: Tag) {
    return `⋮...\n${def.text}\n⋮...\n`;
  }

  private *topDefs(allDefs: Tag[]) {
    let tokens = 0;
    for (let def of allDefs) {
      const defString = this.defToLine(def);
      tokens += this.tokenizer.encode(defString).length;
      if (tokens > this.maxTokens) {
        return;
      }
      yield def;
    }
  }

  private fileLines(defsInFile: { [key: string]: Tag[] }, filePath: string) {
    return (defsInFile[filePath] as Tag[]).reduce((acc, def) => {
      return acc + this.defToLine(def);
    }, '');
  }

  public toSummary(allDefs: Tag[]) {
    const topDefs = [...this.topDefs(allDefs)];
    const defsInFile: { [key: string]: Tag[] } = this.toDefsPerFileMap(topDefs);
    return Object.keys(defsInFile).map(filePath => {
      return { name: filePath, content: this.fileLines(defsInFile, filePath) };
    });
  }
}
