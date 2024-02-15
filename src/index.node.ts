import { ILLMContextSizer, generateFileOutlines, highlightsThatFit } from './index.shared';
import { Source } from './parser';
import { NodeContentPath } from './parser/ContentPath.node';

/**
 * Generates highlights for a source set by selecting the top ranked tags from non-chat sources,
 * that will fit in the context.
 *
 * It ranks all tags across the source set using PageRank, filters out tags from chat sources,
 * groups them by file, and generates highlights for each file.
 *
 * If the concatenated highlights do not fit in context a binary search on percentile is carried out
 * until a result is found that fits.
 *
 * @param contextSizer: - The context sizer that determines if the highlights will fit in the context.
 * @param chatSources - The source code files that are from chat.
 * @param otherSources - The source code files that are not from chat.
 * @returns The concatenated highlights for the top percentile of non-chat tags.
 */
export async function getHighlightsThatFit(
  contextSizer: ILLMContextSizer,
  chatSources: { relPath: string; code: string }[],
  otherSources: { relPath: string; code: string }[]
) {
  return highlightsThatFit(contextSizer, chatSources, otherSources, new NodeContentPath());
}

/**
 * Generates an outline for a set of files by only displaying the definition lines.
 *
 * The outlines are concatenated and returned.
 *
 * @param sources - An array of objects, each having the path and source code for a file
 * @returns The concatenated outlines for all the files.
 */
export async function getFileOutlineHighlights(sources: Source[]) {
  return generateFileOutlines({ sources: sources, contentPath: new NodeContentPath() });
}

export { ILLMContextSizer };
