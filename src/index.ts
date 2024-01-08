import { RepoSummarizer } from './reposummarizer'; // Adjust the path as needed
import { TagRanker } from './reposummary';
import { glob } from 'glob';
import { resolve } from 'path';

async function main() {
  const workspacePath = __dirname + '/__test__/workspace';
  const contextPaths = [
    'test_file_import.py',
    'test_file_pass.py',
    'test_file_with_identifiers.py',
  ];
  const codeFilePaths: string[] = glob.sync(
    '**/*.{js,ts,jsx,tsx,java,c,cpp,cs,go,py,ruby,php,swift,kotlin}',
    { cwd: resolve(workspacePath) }
  );
  const tagRanker = await TagRanker.create(workspacePath, codeFilePaths);
  const defs = tagRanker.rank().getDefinitionsIn(contextPaths, []);
  return RepoSummarizer.create(1000).toSummary(defs);
}

main(); // Call the main function
