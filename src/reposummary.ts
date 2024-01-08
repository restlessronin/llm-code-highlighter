import assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { Tag, Tagger } from './tagger-ts';

import MultiGraph from 'graphology';
import pagerank from 'graphology-metrics/centrality/pagerank';

function _getMtime(absPath: string): number | undefined {
  try {
    return fs.statSync(absPath).mtimeMs;
  } catch (e) {
    return;
  }
}

export async function createDefRefs(tagCacher: TagCacher, absPath: string, relPath: string) {
  const tags = await tagCacher.getTags(absPath, relPath);
  const defs = tags.filter(tag => tag.kind === 'def');
  const refs = tags.filter(tag => tag.kind === 'ref');
  return [relPath, defs, refs] as [string, Tag[], Tag[]];
}

export class TagCacher {
  static readonly CACHE_FILE_NAME: string = 'tags.cache.json';

  static create(workspacePath: string) {
    const cacheFileName = path.join(workspacePath, TagCacher.CACHE_FILE_NAME);
    const cache = fs.existsSync(cacheFileName)
      ? JSON.parse(fs.readFileSync(cacheFileName, 'utf8'))
      : {};
    return new TagCacher(workspacePath, cache);
  }

  constructor(
    readonly workspacePath: string,
    readonly cache: { [key: string]: { mtime: number; data: Tag[] } }
  ) {}

  async getTags(absPath: string, relPath: string): Promise<Tag[]> {
    const fileMtime = _getMtime(absPath);
    if (!fileMtime) return [];
    const value = this.cache[absPath];
    if (value && value.mtime === fileMtime) {
      return value.data;
    }
    const tagger = await Tagger.createFromPath(absPath, relPath);
    if (!tagger) return [];
    const data = tagger.read();
    this.cache[absPath] = { mtime: fileMtime, data: data };
    return data;
  }

  writeCache() {
    const cacheFileName = path.join(this.workspacePath, TagCacher.CACHE_FILE_NAME);
    fs.writeFileSync(cacheFileName, JSON.stringify(this.cache), 'utf8');
  }
}

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

function _add<K, V>(map: Map<K, Set<V>>, key: K, value: V): void {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key)?.add(value);
}

function _push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  if (!map.has(key)) map.set(key, []);
  map.get(key)?.push(value);
}

export class TagRanker {
  static async create(workspacePath: string, absPaths: string[]) {
    const tagCacher = TagCacher.create(workspacePath);
    const relPaths = absPaths.map(absPath => path.relative(workspacePath, absPath));
    const absRelPaths = _.zip(absPaths, relPaths) as [string, string][];
    const defRefs = await Promise.all(
      absRelPaths.map(
        async ([absPath, relPath]) => await createDefRefs(tagCacher, absPath, relPath)
      )
    );
    tagCacher.writeCache();
    const defines = new Map<string, Set<string>>();
    defRefs.forEach(([relPath, defs, _]) => {
      (defs as Tag[]).forEach(def => {
        _add(defines, def.text, relPath);
      });
    });
    const definitions = new Map<string, Set<any>>();
    defRefs.forEach(([relPath, defs, _]) => {
      (defs as Tag[]).forEach(tag => {
        _add(definitions, `${relPath},${tag.text}`, tag);
      });
    });
    const references = new Map<string, string[]>();
    defRefs.forEach(([relPath, _, refs]) => {
      (refs as Tag[]).forEach(tag => {
        _push(references, tag.text, relPath);
      });
    });
    if (references.size === 0) {
      defines.forEach((value, key) => {
        references.set(key, Array.from(value));
      });
    }
    const identifiers = Array.from(defines.keys()).filter(key => references.has(key));
    return new TagRanker(workspacePath, relPaths, defines, definitions, references, identifiers);
  }

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
