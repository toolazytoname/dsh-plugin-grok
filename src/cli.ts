#!/usr/bin/env node
import { grokAsk, grokImagineImage, grokImagineVideo } from './api.js'
import { isLoggedIn, resolveGrokBin, resolveHome } from './detect.js'
import type { GrokResult } from './types.js'

function usage(): string {
  return [
    'dsh-plugin-grok — drive the local Grok Build CLI',
    '',
    'Usage:',
    '  dsh-plugin-grok status',
    '  dsh-plugin-grok ask <prompt>',
    '  dsh-plugin-grok image <prompt> [--ratio 16:9] [--image /path.png]',
    '  dsh-plugin-grok video <prompt> [--image /path.png] [--duration 6] [--resolution 480p]',
    '',
    'Requires `grok` on PATH and `grok login`. Does not use XAI_API_KEY.',
  ].join('\n')
}

function takeFlag(args: string[], name: string): string | undefined {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  const value = args[index + 1]
  args.splice(index, 2)
  return value
}

function printResult(result: GrokResult): never {
  if (!result.ok) {
    process.stderr.write(`${result.error}\n`)
    process.exit(1)
  }
  if (result.paths.length > 0) {
    process.stdout.write(`${result.paths.join('\n')}\n`)
  } else {
    process.stdout.write(result.text.endsWith('\n') ? result.text : `${result.text}\n`)
  }
  process.exit(0)
}

async function main(argv: string[]): Promise<void> {
  const [command, ...rest] = argv
  if (!command || command === '-h' || command === '--help') {
    process.stdout.write(`${usage()}\n`)
    process.exit(command ? 0 : 2)
  }

  if (command === 'status') {
    const home = resolveHome()
    const bin = resolveGrokBin(undefined, home)
    const login = isLoggedIn(home)
    process.stdout.write(
      [
        `grok: ${bin ?? 'not found'}`,
        `login: ${login ? 'yes' : 'no — run grok login'}`,
        `home: ${home}`,
      ].join('\n') + '\n',
    )
    process.exit(bin && login ? 0 : 1)
  }

  const ratio = takeFlag(rest, '--ratio')
  const image = takeFlag(rest, '--image')
  const durationRaw = takeFlag(rest, '--duration')
  const resolutionRaw = takeFlag(rest, '--resolution')
  const cwd = takeFlag(rest, '--cwd')
  const prompt = rest.join(' ').trim()

  if (command === 'ask') {
    printResult(await grokAsk({ prompt, cwd }))
  }
  if (command === 'image') {
    printResult(await grokImagineImage({ prompt, cwd, aspectRatio: ratio, image }))
  }
  if (command === 'video') {
    const duration = durationRaw === '10' ? 10 : 6
    const resolution = resolutionRaw === '720p' ? '720p' : '480p'
    printResult(await grokImagineVideo({ prompt, cwd, aspectRatio: ratio, image, duration, resolution }))
  }

  process.stderr.write(`${usage()}\n`)
  process.exit(2)
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exit(1)
})
