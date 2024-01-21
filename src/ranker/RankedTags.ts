import { Tag } from './common';

export class RankedTags {
  constructor(
    readonly definitions: Map<string, Set<Tag>>,
    readonly rankedFiles: [string, number][],
    readonly rankedDefinitions: [string, number][]
  ) {}

  without(chatRelPaths: string[]) {
    const filteredFiles = this.rankedFiles.filter(
      ([relPath, _]) => !chatRelPaths.includes(relPath)
    );
    const filteredDefinitions = this.rankedDefinitions.filter(([key, _]) => {
      const [relPath, _ident] = key.split(',');
      return !chatRelPaths.includes(relPath);
    });
    return new RankedTags(this.definitions, filteredFiles, filteredDefinitions);
  }

  toTags() {
    return this.rankedDefinitions.reduce((acc: Tag[], [key, _rank]: [string, number]) => {
      return [...acc, ...Array.from(this.definitions.get(key) as Set<Tag>)];
    }, []);
  }

  toRankedFiles(files: string[]) {
    const missingFiles = files.filter(
      file => !this.rankedFiles.some(([relPath, _]) => relPath === file)
    );
    return [...this.rankedFiles.map(([relPath, _rank]) => relPath), ...missingFiles];
  }
}
