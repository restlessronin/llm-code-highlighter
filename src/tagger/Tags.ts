import { Tag } from './common';

export class Tags {
  constructor(
    readonly workspacePath: string,
    readonly relPaths: string[],
    readonly defines: Map<string, Set<string>>,
    readonly definitions: Map<string, Set<Tag>>,
    readonly references: Map<string, string[]>,
    readonly identifiers: string[]
  ) {}
}
