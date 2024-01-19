import _ from 'lodash';
import { Tag } from './tagger-ts';
import { TagRanker } from './tagranker';
import { ITagExtractor } from './tagextractor';

function _add<K, V>(map: Map<K, Set<V>>, key: K, value: V): void {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key)?.add(value);
}

function _push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  if (!map.has(key)) map.set(key, []);
  map.get(key)?.push(value);
}

export type Source = { relPath: string; code: string };
export type DefRef = { relPath: string; all: Tag[]; defs: Tag[]; refs: Tag[] };

export async function createDefRefs(tagGetter: ITagExtractor, sources: Source[]) {
  const defRefs = await Promise.all(
    sources.map(async source => {
      const tags = await tagGetter.extractTags(source.relPath, source.code);
      const defs = tags.filter(tag => tag.kind === 'def');
      const refs = tags.filter(tag => tag.kind === 'ref');
      return { relPath: source.relPath, all: tags, defs: defs, refs: refs } as DefRef;
    })
  );
  return new DefRefs(tagGetter.workspacePath, defRefs);
}

export class DefRefs {
  constructor(readonly workspacePath: string, readonly defRefs: DefRef[]) {}

  createTagranker() {
    const defines = new Map<string, Set<string>>();
    this.defRefs.forEach(defRef => {
      (defRef.defs as Tag[]).forEach(def => {
        _add(defines, def.text, defRef.relPath);
      });
    });
    const definitions = new Map<string, Set<Tag>>();
    this.defRefs.forEach(defRef => {
      (defRef.defs as Tag[]).forEach(tag => {
        _add(definitions, `${defRef.relPath},${tag.text}`, tag);
      });
    });
    const references = new Map<string, string[]>();
    this.defRefs.forEach(defRef => {
      (defRef.refs as Tag[]).forEach(tag => {
        _push(references, tag.text, defRef.relPath);
      });
    });
    if (references.size === 0) {
      defines.forEach((value, key) => {
        references.set(key, Array.from(value));
      });
    }
    const relPaths = this.defRefs.map(defRef => {
      return defRef.relPath;
    });
    const identifiers = Array.from(defines.keys()).filter(key => references.has(key));
    return new TagRanker(
      this.workspacePath,
      relPaths,
      defines,
      definitions,
      references,
      identifiers
    );
  }
}
