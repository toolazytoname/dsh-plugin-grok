import type { GrokKind } from './types.js'
import { toolsFor } from './prompt.js'

export interface ArgvInput {
  kind: GrokKind
  promptFile: string
  cwd: string
  model?: string
  extraArgs?: string[]
}

export function buildArgv(input: ArgvInput): string[] {
  const argv = [
    '--prompt-file',
    input.promptFile,
    '--always-approve',
    '--verbatim',
    '--cwd',
    input.cwd,
    '--max-turns',
    input.kind === 'text' ? '24' : '8',
  ]

  if (input.model) {
    argv.push('--model', input.model)
  }

  const tools = toolsFor(input.kind)
  if (tools) {
    argv.push('--tools', tools, '--no-subagents')
  }

  if (input.extraArgs?.length) {
    argv.push(...input.extraArgs)
  }

  return argv
}
