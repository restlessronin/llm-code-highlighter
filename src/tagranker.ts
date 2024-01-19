import assert from 'assert';
import _ from 'lodash';
import { Tag } from './tagger-ts';

import MultiGraph from 'graphology';
import pagerank from 'graphology-metrics/centrality/pagerank';

class _Counter extends Map<string, number> {
  constructor(iterable: Iterable<string> = []) {
    super();
    for (let item of iterable) {
      this.add(item);
    }
  }

  add(item: any) {
    this.set(item, (this.get(item) || 0) + 1);
  }
}

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

export class TagRanker {
  constructor(
    readonly workspacePath: string,
    readonly relPaths: string[],
    readonly defines: Map<string, Set<string>>,
    readonly definitions: Map<string, Set<Tag>>,
    readonly references: Map<string, string[]>,
    readonly identifiers: string[]
  ) {}

  rank() {
    const G = new MultiGraph();
    this.identifiers.forEach(ident => {
      const definers = this.defines.get(ident);
      const counter = new _Counter(this.references.get(ident));
      counter.forEach((numRefs, referencer) => {
        (definers as Set<string>).forEach(definer => {
          G.mergeEdge(referencer, definer, { weight: numRefs, ident: ident });
        });
      });
    });
    pagerank.assign(G);
    const rankedDefinitionsMap = new Map<string, number>();
    G.nodes().forEach(referencer => {
      const refRank = G.getNodeAttribute(referencer, 'pagerank');
      const totalWeight = G.edges(referencer).reduce(
        (total, edge) => total + G.getEdgeAttribute(edge, 'weight'),
        0
      );
      G.edges(referencer).map(edge => {
        const definer: string = G.target(edge);
        const data = G.getEdgeAttributes(edge);
        const defRank = ((refRank as number) * data['weight']) / totalWeight;
        const key = `${definer},${data['ident']}`;
        if (!rankedDefinitionsMap.has(key)) rankedDefinitionsMap.set(key, 0);
        rankedDefinitionsMap.set(key, (rankedDefinitionsMap.get(key) as number) + defRank);
      });
    });
    const rankedFilesMap = G.nodes().reduce((accumulator: Record<string, number>, node: string) => {
      accumulator[node] = G.getNodeAttribute(node, 'pagerank') as number;
      return accumulator;
    }, {});
    const rankedDefinitions = Array.from(rankedDefinitionsMap.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const rankedFiles = Object.entries(rankedFilesMap).sort((a, b) => b[1] - a[1]);
    return new RankedTags(this.definitions, rankedFiles, rankedDefinitions);
  }
}
