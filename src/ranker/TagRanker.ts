import _ from 'lodash';
import MultiGraph from 'graphology';
import pagerank from 'graphology-metrics/centrality/pagerank';
import { Tag } from './common';
import { RankedTags } from './RankedTags';

export class TagRanker {
  constructor(
    readonly workspacePath: string,
    readonly relPaths: string[],
    readonly defines: Map<string, Set<string>>,
    readonly definitions: Map<string, Set<Tag>>,
    readonly references: Map<string, string[]>,
    readonly identifiers: string[]
  ) {}

  pagerank() {
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
