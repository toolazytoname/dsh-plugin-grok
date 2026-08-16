import { randomUUID } from 'node:crypto'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildArgv } from './argv.js'
import { isLoggedIn, resolveGrokBin, resolveHome } from './detect.js'
import { buildGrokEnv } from './env.js'
import { extractMediaPaths, parseGrokStdout } from './media.js'
import { buildPrompt } from './prompt.js'
import { spawnGrok } from './runner.js'
import type { GrokResult, Invocation, RunRequest, SpawnFn } from './types.js'

const DEFAULT_TIMEOUT: Record<RunRequest['kind'], number> = {
  text: 300_000,
  image: 300_000,
  video: 600_000,
}

export function prepareInvocation(request: RunRequest, promptFile: string): Invocation | GrokResult {
  const prompt = request.prompt.trim()
  if (!prompt) {
    return { ok: false, error: 'Prompt is empty.', code: 'empty_prompt' }
  }

  const home = resolveHome(request.home)
  const bin = resolveGrokBin(request.grokPath, home, request.env?.PATH ?? process.env.PATH)
  if (!bin) {
    return {
      ok: false,
      error: 'Local grok CLI not found. Install Grok Build and ensure `grok` is on PATH (or set DSH_PLUGIN_GROK_BIN).',
      code: 'missing_binary',
    }
  }

  if (!isLoggedIn(home)) {
    return {
      ok: false,
      error: `Not logged in. Run \`grok login\` so ${join(home, '.grok', 'auth.json')} exists. This plugin does not use XAI_API_KEY.`,
      code: 'missing_login',
    }
  }

  const cwd = request.cwd?.trim() || process.cwd()
  const promptFileContents = buildPrompt({
    kind: request.kind,
    prompt,
    aspectRatio: request.aspectRatio,
    image: request.image,
    duration: request.duration,
    resolution: request.resolution,
  })

  return {
    bin,
    argv: buildArgv({
      kind: request.kind,
      promptFile,
      cwd,
      model: request.model,
      extraArgs: request.extraArgs,
    }),
    env: buildGrokEnv({ home, base: request.env ?? process.env }),
    cwd,
    promptFileContents,
    timeoutMs: request.timeoutMs ?? DEFAULT_TIMEOUT[request.kind],
  }
}

export async function runGrok(request: RunRequest, spawn: SpawnFn = spawnGrok): Promise<GrokResult> {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-plugin-grok-'))
  const promptFile = join(dir, `${request.kind}-${randomUUID()}.txt`)
  const prepared = prepareInvocation(request, promptFile)
  if ('ok' in prepared && prepared.ok === false) {
    await rm(dir, { recursive: true, force: true })
    return prepared
  }

  const invocation = prepared as Invocation
  await writeFile(promptFile, invocation.promptFileContents, 'utf8')

  const started = Date.now()
  try {
    const spawned = await spawn(invocation.bin, invocation.argv, {
      cwd: invocation.cwd,
      env: invocation.env,
      signal: request.signal,
      timeoutMs: invocation.timeoutMs,
    })

    if (request.signal?.aborted) {
      return { ok: false, error: 'Cancelled.', code: 'aborted', argv: invocation.argv }
    }

    if (spawned.exitCode === null && spawned.signal) {
      return {
        ok: false,
        error: spawned.stderr.trim() || `grok timed out after ${invocation.timeoutMs}ms`,
        code: 'timeout',
        argv: invocation.argv,
        stdout: spawned.stdout,
        stderr: spawned.stderr,
      }
    }

    if (spawned.exitCode !== 0) {
      const detail = [spawned.stderr.trim(), spawned.stdout.trim()].filter(Boolean).join('\n')
      return {
        ok: false,
        error: detail || `grok exited with code ${spawned.exitCode}`,
        code: 'grok_failed',
        argv: invocation.argv,
        stdout: spawned.stdout,
        stderr: spawned.stderr,
        exitCode: spawned.exitCode,
      }
    }

    const parsed = parseGrokStdout(spawned.stdout)
    const text = parsed.text
    const paths = extractMediaPaths(
      `${spawned.stdout}\n${text}`,
      request.kind === 'text' ? 'any' : request.kind,
    )

    if (request.kind !== 'text' && paths.length === 0) {
      return {
        ok: false,
        error: `grok finished but no absolute ${request.kind} path was found in the output.`,
        code: 'no_media',
        argv: invocation.argv,
        stdout: spawned.stdout,
        stderr: spawned.stderr,
        exitCode: spawned.exitCode,
      }
    }

    if (request.kind === 'text' && !text.trim()) {
      return {
        ok: false,
        error: 'grok finished but returned empty text.',
        code: 'grok_failed',
        argv: invocation.argv,
        stdout: spawned.stdout,
        stderr: spawned.stderr,
        exitCode: spawned.exitCode,
      }
    }

    return {
      ok: true,
      kind: request.kind,
      text,
      paths,
      sessionId: parsed.sessionId,
      argv: invocation.argv,
      bin: invocation.bin,
      cwd: invocation.cwd,
      durationMs: Date.now() - started,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      ok: false,
      error: message,
      code: message.includes('ENOENT') ? 'missing_binary' : 'grok_failed',
      argv: invocation.argv,
    }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

export function grokAsk(request: Omit<RunRequest, 'kind'>, spawn?: SpawnFn): Promise<GrokResult> {
  return runGrok({ ...request, kind: 'text' }, spawn)
}

export function grokImagineImage(request: Omit<RunRequest, 'kind'>, spawn?: SpawnFn): Promise<GrokResult> {
  return runGrok({ ...request, kind: 'image' }, spawn)
}

export function grokImagineVideo(request: Omit<RunRequest, 'kind'>, spawn?: SpawnFn): Promise<GrokResult> {
  return runGrok({ ...request, kind: 'video' }, spawn)
}
