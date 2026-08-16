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
