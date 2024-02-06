import _ from 'lodash';
import { Tag, ITagExtractor } from './common';
import { Tags } from './Tags';
import { Source, DefRef } from './DefRef';

export class DefRefs {
  static async create(tagGetter: ITagExtractor, sources: Source[]) {
    const defRefs = await DefRef.createEach(tagGetter, sources);
    const nonEmpty = defRefs.filter(defRef => defRef.defs.length != 0 || defRef.refs.length != 0);
    if (nonEmpty.length == 0) return;
    return new DefRefs(tagGetter.workspacePath, nonEmpty);
  }

  constructor(readonly workspacePath: string, readonly defRefs: DefRef[]) {}

  static _add<K, V>(map: Map<K, Set<V>>, key: K, value: V): void {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)?.add(value);
  }

  static _push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(value);
  }

  createTags() {
    const defines = new Map<string, Set<string>>();
    this.defRefs.forEach(defRef => {
      (defRef.defs as Tag[]).forEach(def => {
        DefRefs._add(defines, def.text, defRef.relPath);
      });
    });
    const definitions = new Map<string, Set<Tag>>();
    this.defRefs.forEach(defRef => {
      (defRef.defs as Tag[]).forEach(tag => {
        DefRefs._add(definitions, `${defRef.relPath},${tag.text}`, tag);
      });
    });
    const references = new Map<string, string[]>();
    this.defRefs.forEach(defRef => {
      (defRef.refs as Tag[]).forEach(tag => {
        DefRefs._push(references, tag.text, defRef.relPath);
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
    if (defines.size === 0 || definitions.size === 0 || references.size === 0) return;
    const identifiers = Array.from(defines.keys()).filter(key => references.has(key));
    return new Tags(this.workspacePath, relPaths, defines, definitions, references, identifiers);
  }
}
