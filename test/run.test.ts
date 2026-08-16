import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { grokAsk, grokImagineImage, grokImagineVideo, runGrok } from '../src/api.ts'
import {
  FIXTURE_GROK,
  IMAGE_STDOUT,
  TEXT_STDOUT,
  VIDEO_STDOUT,
  makeHome,
  stubEnv,
} from './helpers.ts'

function recordPath(): string {
  return join(dirname(FIXTURE_GROK), `record-${process.pid}-${Math.random().toString(16).slice(2)}.json`)
}

describe('runGrok with PATH stub', () => {
  it('runs text and returns the stub stdout body', async () => {
    const home = makeHome(true)
    const record = recordPath()
    const result = await grokAsk({
      prompt: 'Say hello.',
      home,
      grokPath: FIXTURE_GROK,
      env: stubEnv({
        DSH_GROK_STUB_RECORD: record,
        DSH_GROK_STUB_STDOUT: TEXT_STDOUT,
        XAI_API_KEY: 'xai-should-not-leak',
      }),
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.text, TEXT_STDOUT)
    const recorded = JSON.parse(readFileSync(record, 'utf8')) as {
      argv: string[]
      env: { XAI_API_KEY: string | null }
    }
    assert.equal(recorded.argv[0], '--prompt-file')
    assert.equal(recorded.env.XAI_API_KEY, null)
  })

  it('image argv includes Imagine tools and parsed paths from fixture stdout', async () => {
    const home = makeHome(true)
    const record = recordPath()
    const result = await grokImagineImage({
      prompt: 'a red cube',
      home,
      grokPath: FIXTURE_GROK,
      env: stubEnv({
        DSH_GROK_STUB_RECORD: record,
        DSH_GROK_STUB_STDOUT: IMAGE_STDOUT,
        XAI_API_KEY: 'xai-should-not-leak',
      }),
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.deepEqual(result.paths, ['/Users/demo/.grok/sessions/abc/images/foo.png'])
    const recorded = JSON.parse(readFileSync(record, 'utf8')) as { argv: string[]; env: { XAI_API_KEY: null } }
    assert.ok(recorded.argv.includes('--prompt-file'))
    const tools = recorded.argv[recorded.argv.indexOf('--tools') + 1]
    assert.ok(tools.includes('image_gen'))
    assert.equal(recorded.env.XAI_API_KEY, null)
  })

  it('video argv includes image_to_video and returns the mp4 path', async () => {
    const home = makeHome(true)
    const record = recordPath()
    const result = await grokImagineVideo({
      prompt: 'slow push-in',
      home,
      grokPath: FIXTURE_GROK,
      env: stubEnv({
        DSH_GROK_STUB_RECORD: record,
        DSH_GROK_STUB_STDOUT: VIDEO_STDOUT,
      }),
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.deepEqual(result.paths, ['/Users/demo/.grok/sessions/abc/videos/bar.mp4'])
    const recorded = JSON.parse(readFileSync(record, 'utf8')) as { argv: string[] }
    const tools = recorded.argv[recorded.argv.indexOf('--tools') + 1]
    assert.ok(tools.includes('image_gen'))
    assert.ok(tools.includes('image_to_video'))
  })

  it('finds the stub grok on PATH when grokPath is omitted', async () => {
    const home = makeHome(true)
    const result = await runGrok({
      kind: 'text',
      prompt: 'path lookup',
      home,
      env: stubEnv({
        PATH: `${dirname(FIXTURE_GROK)}:${process.env.PATH ?? ''}`,
        DSH_GROK_STUB_STDOUT: TEXT_STDOUT,
      }),
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.text, TEXT_STDOUT)
    assert.equal(result.bin, FIXTURE_GROK)
  })
})
