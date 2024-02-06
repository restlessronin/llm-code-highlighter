const test_file_with_identifiers = {
  relPath: 'test_file_with_identifiers.py',
  code: `class MyClass:
  def my_method(self, arg1, arg2):
    return arg1 + arg2

def my_function(arg1, arg2):
  return arg1 * arg2
`,
};

const test_file_pass = {
  relPath: 'test_file_pass.py',
  code: `pass`,
};

const test_file_import = {
  relPath: 'test_file_import.py',
  code: `from test_file_with_identifiers import MyClass

obj = MyClass()
print(obj.my_method(1, 2))
print(my_function(3, 4))
`,
};

export const test_typescript_code = `import { Tag } from '../tagger';

export class RankedTags {
  constructor(
    readonly definitions: Map<string, Set<Tag>>,
    readonly rankedFiles: [string, number][],
    readonly rankedDefinitions: [string, number][]
  ) {}

  without(chatRelPaths: string[]) {
    const filteredFiles = this.rankedFiles.filter(
      ([relPath, _]) => !chatRelPaths.includes(relPath)
    );
    const filteredDefinitions = this.rankedDefinitions.filter(([key, _]) => {
      const [relPath, _ident] = key.split(',');
      return !chatRelPaths.includes(relPath);
    });
    return new RankedTags(this.definitions, filteredFiles, filteredDefinitions);
  }

  toTags() {
    return this.rankedDefinitions.reduce((acc: Tag[], [key, _rank]: [string, number]) => {
      return [...acc, ...Array.from(this.definitions.get(key) as Set<Tag>)];
    }, []);
  }

  toRankedFiles(files: string[]) {
    const missingFiles = files.filter(
      file => !this.rankedFiles.some(([relPath, _]) => relPath === file)
    );
    return [...this.rankedFiles.map(([relPath, _rank]) => relPath), ...missingFiles];
  }
}
`;

export const pythonSources = [test_file_with_identifiers, test_file_import, test_file_pass];
