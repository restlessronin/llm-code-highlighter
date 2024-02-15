import _ from 'lodash';
import { IContentPath, Source } from '../parser';
import { createRankedTags } from '../ranker';
import { RankedTags } from '../ranker/RankedTags';
import { Highlighter } from './Highlighter';

export class Highlights {
  static async create(chatSources: Source[], otherSources: Source[], contentPath: IContentPath) {
    const allSources = [...chatSources, ...otherSources];
    const rankedTags = await createRankedTags({ sources: allSources, contentPath: contentPath });
    if (!rankedTags) return;
    const chatRelPaths = chatSources.map(source => source.relPath);
    return new Highlights(rankedTags.without(chatRelPaths), allSources, contentPath);
  }

  constructor(
    readonly rankedTags: RankedTags,
    readonly allSources: Source[],
    readonly contentPath: IContentPath
  ) {}

  async toCodeHighlights(percentile: number) {
    const topTags = this.rankedTags.toTags();
    const maxTags = _.round(percentile * topTags.length);
    const mapTags = topTags.slice(0, maxTags);
    const sortedTags = _.orderBy(mapTags, ['relPath', 'start.ln'], ['asc', 'asc']);
    const groupedTags = _.groupBy(sortedTags, tag => tag.relPath);
    const fileHighlights = await Promise.all(
      _.values(groupedTags).map(async tags => {
        const relPath = tags[0].relPath;
        const code = this.allSources.find(source => source.relPath === relPath)!.code;
        const highlighter = await Highlighter.create(tags, code, this.contentPath);
        if (!highlighter) return;
        return highlighter.toHighlights();
      })
    );
    return _.join(fileHighlights, '');
  }
}
