import { spawn } from 'node:child_process'
import type { SpawnFn, SpawnResult } from './types.js'

export const spawnGrok: SpawnFn = (bin, argv, options) => {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, argv, {
      cwd: options.cwd,
      env: options.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    let settled = false

    const finish = (result: SpawnResult) => {
      if (settled) return
      settled = true
      resolve(result)
    }

    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      setTimeout(() => child.kill('SIGKILL'), 1000)
      finish({
        exitCode: null,
        stdout,
        stderr: stderr || `grok timed out after ${options.timeoutMs}ms`,
        signal: 'SIGTERM',
      })
    }, options.timeoutMs)

    const onAbort = () => {
      child.kill('SIGTERM')
    }
    options.signal?.addEventListener('abort', onAbort, { once: true })

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk
    })
    child.on('error', (error) => {
      clearTimeout(timer)
      options.signal?.removeEventListener('abort', onAbort)
      if (settled) return
      settled = true
      reject(error)
    })
    child.on('close', (code, signal) => {
      clearTimeout(timer)
      options.signal?.removeEventListener('abort', onAbort)
      finish({ exitCode: code, stdout, stderr, signal })
    })
  })
}
