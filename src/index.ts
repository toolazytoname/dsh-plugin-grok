import { createTools } from './tools.js'
import type { PluginConfig } from './types.js'

export const name = 'dsh-plugin-grok'
export const inject = ['tools']

export interface Context {
  tools: {
    register(tool: unknown): void
  }
}

export function apply(ctx: Context, config: PluginConfig = {}): void {
  for (const tool of createTools(config)) {
    ctx.tools.register(tool)
  }
}

export { createTools, TOOL_ASK, TOOL_IMAGE, TOOL_NAMES, TOOL_VIDEO } from './tools.js'
export { grokAsk, grokImagineImage, grokImagineVideo, prepareInvocation, runGrok } from './api.js'
export { buildArgv } from './argv.js'
export { buildPrompt, IMAGE_TOOLS, VIDEO_TOOLS } from './prompt.js'
export { extractMediaPaths, parseGrokStdout } from './media.js'
export { buildGrokEnv } from './env.js'
export { resolveGrokBin, isLoggedIn, authPath } from './detect.js'
export type { GrokResult, PluginConfig, RunRequest } from './types.js'
