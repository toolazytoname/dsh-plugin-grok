export type GrokKind = 'text' | 'image' | 'video'

export interface PluginConfig {
  grokPath?: string
  home?: string
  timeoutMs?: number
  extraArgs?: string[]
}

export interface RunRequest {
  kind: GrokKind
  prompt: string
  cwd?: string
  grokPath?: string
  home?: string
  timeoutMs?: number
  extraArgs?: string[]
  model?: string
  aspectRatio?: string
  image?: string
  duration?: 6 | 10
  resolution?: '480p' | '720p'
  env?: NodeJS.ProcessEnv
  signal?: AbortSignal
}

export interface GrokSuccess {
  ok: true
  kind: GrokKind
  text: string
  paths: string[]
  sessionId?: string
  argv: string[]
  bin: string
  cwd: string
  durationMs: number
}

export interface GrokFailure {
  ok: false
  error: string
  code:
    | 'empty_prompt'
    | 'missing_binary'
    | 'missing_login'
    | 'grok_failed'
    | 'no_media'
    | 'timeout'
    | 'aborted'
  argv?: string[]
  stdout?: string
  stderr?: string
  exitCode?: number | null
}

export type GrokResult = GrokSuccess | GrokFailure

export interface Invocation {
  bin: string
  argv: string[]
  env: NodeJS.ProcessEnv
  cwd: string
  promptFileContents: string
  timeoutMs: number
}

export interface SpawnResult {
  exitCode: number | null
  stdout: string
  stderr: string
  signal?: NodeJS.Signals | null
}

export type SpawnFn = (
  bin: string,
  argv: string[],
  options: {
    cwd: string
    env: NodeJS.ProcessEnv
    signal?: AbortSignal
    timeoutMs: number
  },
) => Promise<SpawnResult>
