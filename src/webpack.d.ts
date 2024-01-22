// webpack.d.ts
declare module '*.scm' {
  const context: __WebpackModuleApi.RequireContext;
  export = context;
}

declare namespace __WebpackModuleApi {
  interface RequireContext {
    keys(): string[];
    (id: string): any;
    <T>(id: string): T;
    resolve(id: string): string;
    id: string;
  }
}

interface NodeRequire {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ): __WebpackModuleApi.RequireContext;
}
