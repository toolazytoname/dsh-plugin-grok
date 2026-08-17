import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export function resolveHome(home?: string): string {
  return home?.trim() || process.env.GROK_HOME?.trim() || homedir()
}

export function authPath(home?: string): string {
  return join(resolveHome(home), '.grok', 'auth.json')
}

export function isLoggedIn(home?: string): boolean {
  return existsSync(authPath(home))
}

export type AuthMode = 'login' | 'api_key'

export interface ResolvedAuth {
  mode: AuthMode
  apiKey?: string
}

export function resolveApiKey(explicit?: string, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const key = explicit?.trim() || env.XAI_API_KEY?.trim()
  return key || undefined
}

export function resolveAuth(input: {
  home?: string
  apiKey?: string
  env?: NodeJS.ProcessEnv
}): ResolvedAuth | { error: string } {
  if (isLoggedIn(input.home)) {
    return { mode: 'login' }
  }
  const apiKey = resolveApiKey(input.apiKey, input.env ?? process.env)
  if (apiKey) {
    return { mode: 'api_key', apiKey }
  }
  return {
    error:
      'No Grok credentials. Run `grok login` (writes ~/.grok/auth.json) or set XAI_API_KEY from https://console.x.ai.',
  }
}

export function defaultGrokBin(home?: string): string {
  return join(resolveHome(home), '.grok', 'bin', 'grok')
}

export function resolveGrokBin(explicit?: string, home?: string, pathEnv?: string): string | null {
  const candidates = [
    explicit?.trim(),
    process.env.DSH_PLUGIN_GROK_BIN?.trim(),
    'grok',
    defaultGrokBin(home),
  ].filter((value): value is string => Boolean(value))

  const pathDirs = (pathEnv ?? process.env.PATH ?? '').split(':').filter(Boolean)

  for (const candidate of candidates) {
    if (candidate.includes('/') || candidate.includes('\\')) {
      if (existsSync(candidate)) return candidate
      continue
    }
    for (const dir of pathDirs) {
      const full = join(dir, candidate)
      if (existsSync(full)) return full
    }
  }
  return null
}
