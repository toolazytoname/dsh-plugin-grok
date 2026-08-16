import type { GrokKind } from './types.js';
export interface ArgvInput {
    kind: GrokKind;
    promptFile: string;
    cwd: string;
    model?: string;
    extraArgs?: string[];
}
export declare function buildArgv(input: ArgvInput): string[];
