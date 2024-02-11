export type Language =
  | 'C'
  | 'C#'
  | 'C++'
  | 'Elisp'
  | 'Elixir'
  | 'Elm'
  | 'Go'
  | 'Java'
  | 'JavaScript'
  | 'Ocaml'
  | 'PHP'
  | 'Python'
  | 'QL'
  | 'Ruby'
  | 'Rust'
  | 'TypeScript';

const extToLang: Record<string, Language> = {
  py: 'Python',
  js: 'JavaScript',
  mjs: 'JavaScript',
  go: 'Go',
  c: 'C',
  cc: 'C++',
  cs: 'C#',
  cpp: 'C++',
  el: 'Elisp',
  ex: 'Elixir',
  elm: 'Elm',
  java: 'Java',
  ml: 'Ocaml',
  php: 'PHP',
  ql: 'QL',
  rb: 'Ruby',
  rs: 'Rust',
  ts: 'TypeScript',
};

const lang2QryNameString: Record<Language, string> = {
  C: 'c',
  'C#': 'c_sharp',
  'C++': 'cpp',
  Elisp: 'elisp',
  Elixir: 'elixir',
  Elm: 'elm',
  Go: 'go',
  Java: 'java',
  JavaScript: 'javascript',
  Ocaml: 'ocaml',
  PHP: 'php',
  Python: 'python',
  QL: 'ql',
  Ruby: 'ruby',
  Rust: 'rust',
  TypeScript: 'typescript',
};

export function getLanguage(filename: string) {
  const extension = filename.split('.').pop();
  if (!extension || !(extension in extToLang)) return;
  return extToLang[extension];
}

export function getQueryFileName(lang: string) {
  if (!(lang in lang2QryNameString)) return;
  return `tree-sitter-${lang2QryNameString[lang as Language]}-tags.scm`;
}

export function getWasmPath(lang: string) {
  if (!(lang in lang2QryNameString)) return;
  return `tree-sitter-${lang2QryNameString[lang as Language]}.wasm`;
}
