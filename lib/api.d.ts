import type { GrokResult, Invocation, RunRequest, SpawnFn } from './types.js';
export declare function prepareInvocation(request: RunRequest, promptFile: string): Invocation | GrokResult;
export declare function runGrok(request: RunRequest, spawn?: SpawnFn): Promise<GrokResult>;
export declare function grokAsk(request: Omit<RunRequest, 'kind'>, spawn?: SpawnFn): Promise<GrokResult>;
export declare function grokImagineImage(request: Omit<RunRequest, 'kind'>, spawn?: SpawnFn): Promise<GrokResult>;
export declare function grokImagineVideo(request: Omit<RunRequest, 'kind'>, spawn?: SpawnFn): Promise<GrokResult>;
