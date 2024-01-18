import assert from 'assert';
import * as path from 'path';
import _ from 'lodash';
import { Tag, Tagger } from './tagger-ts';
import { ITagExtractor } from './tagextractor';

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
    readonly definitions: Map<string, Set<any>>,
    readonly references: Map<string, string[]>,
    readonly identifiers: string[],
    readonly ranked: string[] = [],
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
    const ranked = Array.from(G.nodes()).sort(
      (a, b) => G.getNodeAttribute(b, 'pagerank') - G.getNodeAttribute(a, 'pagerank')
    );
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
      .filter(([key, rank]: [string, number]) => {
        const [relPath, ident] = key.split(',');
        return !chatRelPaths.includes(relPath as string);
      })
      .reduce((acc: Tag[], [key, rank]: [string, number]) => {
        return [...acc, ...Array.from(this.definitions.get(key) as Set<Tag>)];
      }, []);
    const incRelPaths = rankedTags.map(rt => rt.relPath);
    const ovlpRelPaths = this.ranked.filter(relPath => restRelPaths.includes(relPath));
    const remnRelPaths = restRelPaths.filter(relPath => !ovlpRelPaths.includes(relPath));
    const allRelPaths = [
      ...this.ranked.filter(relPath => !incRelPaths.includes(relPath)),
      ...this.ranked.filter(relPath => remnRelPaths.includes(relPath)),
    ].map(relPath => ({ relPath: relPath } as Tag));
    return [...rankedTags, ...allRelPaths];
  }
}
