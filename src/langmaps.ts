import linguist from 'linguist-languages';

type Language =
  | 'C'
  | 'C#'
  | 'C++'
  | 'Go'
  | 'Java'
  | 'JavaScript'
  | 'PHP'
  | 'Python'
  | 'Ruby'
  | 'Rust'
  | 'TypeScript';

const _lang2QueryFileName: Record<Language, string> = {
  C: 'c',
  'C#': 'c_sharp',
  'C++': 'cpp',
  Go: 'go',
  Java: 'java',
  JavaScript: 'javascript',
  PHP: 'php',
  Python: 'python',
  Ruby: 'ruby',
  Rust: 'rust',
  TypeScript: 'typescript',
};

export function getLinguistLanguage(filename: string) {
  const extension = filename.split('.').pop();
  if (!extension) {
    return undefined;
  }
  for (const lang of Object.values(linguist)) {
    if (lang.extensions?.includes('.' + extension)) {
      return lang.name;
    }
  }
  return undefined;
}

export function getQueryFileName(lang: string) {
  if (!(lang in _lang2QueryFileName)) return;
  return `tree-sitter-${_lang2QueryFileName[lang as Language]}-tags.scm`;
}

export function getWasmPath(lang: string) {
  if (!(lang in _lang2QueryFileName)) return;
  return `../assets/wasms/${_lang2QueryFileName[lang as Language]}.wasm`;
}
