import { generateSourceSetHighlights } from './index.shared';
import { NodeContentPath } from './tagger/ContentPath.node';

/**
 * Generates highlights for a repository by selecting the top percentile of ranked tags from non-chat sources.
 *
 * It ranks all tags across the repository using PageRank, filters out tags from chat sources,
 * takes the top percentile of tags, groups them by file, and generates highlights for each file.
 *
 * The highlights are concatenated and returned.
 *
 * @param topPercentile - The percentile of top ranked tags to use for highlights.
 * @param chatSources - The source code files that are from chat.
 * @param otherSources - The source code files that are not from chat.
 * @returns The concatenated highlights for the top percentile of non-chat tags.
 */
export async function getRepoHighlights(
  topPercentile: number,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  return generateSourceSetHighlights(
    topPercentile,
    chatSources,
    otherSources,
    new NodeContentPath()
  );
}
