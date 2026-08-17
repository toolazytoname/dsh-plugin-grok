import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const FIXTURE_GROK = fileURLToPath(new URL('./fixtures/bin/grok', import.meta.url))
export const IMAGE_STDOUT = 'Saved the still at /Users/demo/.grok/sessions/abc/images/foo.png\n'
export const VIDEO_STDOUT =
  'Staged /Users/demo/.grok/sessions/abc/images/foo.png\nthen animated /Users/demo/.grok/sessions/abc/videos/bar.mp4\n'
export const TEXT_STDOUT = 'hello-from-stub'

export function makeHome(loggedIn: boolean): string {
  const home = join(tmpdir(), `dsh-plugin-grok-home-${process.pid}-${Math.random().toString(16).slice(2)}`)
  mkdirSync(join(home, '.grok'), { recursive: true })
  if (loggedIn) {
    writeFileSync(join(home, '.grok', 'auth.json'), '{}\n')
  }
  return home
}

export function stubEnv(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete env[key]
    else env[key] = value
  }
  delete env.DSH_PLUGIN_GROK_BIN
  return env
}
