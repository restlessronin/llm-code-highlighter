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

export class TagRanker {
  constructor(
    readonly workspacePath: string,
    readonly relPaths: string[],
    readonly defines: Map<string, Set<string>>,
    readonly definitions: Map<string, Set<Tag>>,
    readonly references: Map<string, string[]>,
    readonly identifiers: string[],
    readonly ranked: Record<string, number> = {},
    readonly rankedDefinitions: Map<string, number> = new Map<string, number>()
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
    const rankedDefinitions = new Map<string, number>();
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
        if (!rankedDefinitions.has(key)) rankedDefinitions.set(key, 0);
        rankedDefinitions.set(key, (rankedDefinitions.get(key) as number) + defRank);
      });
    });
    const ranked = G.nodes().reduce((accumulator: Record<string, number>, node: string) => {
      accumulator[node] = G.getNodeAttribute(node, 'pagerank') as number;
      return accumulator;
    }, {});
    return new TagRanker(
      this.workspacePath,
      this.relPaths,
      this.defines,
      this.definitions,
      this.references,
      this.identifiers,
      ranked,
      rankedDefinitions
    );
  }

  getDefinitionsIn(chatRelPaths: string[], restRelPaths: string[]) {
    assert(
      chatRelPaths.every(relPath => this.relPaths.includes(relPath)),
      'chatRelPaths must be a subset of relPaths'
    );
    assert(
      restRelPaths.every(relPath => this.relPaths.includes(relPath)),
      'restRelPaths must be a subset of relPaths'
    );

    const rankedDefinitionsArr = Array.from(this.rankedDefinitions.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const rankedTags: Tag[] = rankedDefinitionsArr
      .filter(([key, _rank]: [string, number]) => {
        const [relPath, _ident] = key.split(',');
        return !chatRelPaths.includes(relPath as string);
      })
      .reduce((acc: Tag[], [key, _rank]: [string, number]) => {
        return [...acc, ...Array.from(this.definitions.get(key) as Set<Tag>)];
      }, []);
    const incRelPaths = rankedTags.map(rt => rt.relPath);
    const ovlpRelPaths = Object.entries(this.ranked)
      .filter(([relPath, _]) => restRelPaths.includes(relPath))
      .map(([relPath, _]) => relPath);
    const remnRelPaths = restRelPaths.filter(relPath => !ovlpRelPaths.includes(relPath));
    const allRankedRelPaths = [
      ...Object.entries(this.ranked).filter(([relPath, _]) => !incRelPaths.includes(relPath)),
      ...Object.entries(this.ranked).filter(([relPath, _]) => remnRelPaths.includes(relPath)),
    ];
    const allRelPaths = allRankedRelPaths
      .sort((a, b) => b[1] - a[1])
      .map(([relPath, _]) => relPath);
    return { rankedTags: rankedTags, relPaths: allRelPaths };
  }
}
