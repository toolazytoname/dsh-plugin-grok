import { dirname } from 'node:path'
import { defaultGrokBin, resolveHome } from './detect.js'

export function buildGrokEnv(input: {
  home?: string
  pathExtra?: string
  base?: NodeJS.ProcessEnv
} = {}): NodeJS.ProcessEnv {
  const base = input.base ?? process.env
  const env: NodeJS.ProcessEnv = { ...base }

  const home = resolveHome(input.home)
  env.HOME = home

  const grokBinDir = dirname(defaultGrokBin(home))
  const pathParts = [input.pathExtra, grokBinDir, env.PATH].filter(Boolean)
  env.PATH = pathParts.join(':')

  delete env.XAI_API_KEY
  return env
}
