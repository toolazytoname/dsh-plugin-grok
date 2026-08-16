import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { grokAsk, grokImagineImage, runGrok } from '../src/api.ts'
import { FIXTURE_GROK, makeHome, stubEnv } from './helpers.ts'

describe('fail closed', () => {
  it('rejects an empty prompt without spawning grok', async () => {
    const result = await grokAsk({
      prompt: '   ',
      home: makeHome(true),
      grokPath: FIXTURE_GROK,
    })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, 'empty_prompt')
  })

  it('rejects a missing grok binary', async () => {
    const result = await grokAsk({
      prompt: 'hello',
      home: makeHome(true),
      grokPath: '/definitely/missing/grok-binary',
      env: stubEnv({ PATH: '/usr/bin' }),
    })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, 'missing_binary')
  })

  it('rejects a home without ~/.grok/auth.json', async () => {
    const result = await grokAsk({
      prompt: 'hello',
      home: makeHome(false),
      grokPath: FIXTURE_GROK,
    })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, 'missing_login')
  })

  it('rejects grok exit 1 as an error, not success', async () => {
    const result = await runGrok({
      kind: 'text',
      prompt: 'fail please',
      home: makeHome(true),
      grokPath: FIXTURE_GROK,
      env: stubEnv({
        DSH_GROK_STUB_EXIT: '1',
        DSH_GROK_STUB_STDERR: 'boom from grok',
        DSH_GROK_STUB_STDOUT: '',
      }),
    })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, 'grok_failed')
    assert.match(result.error, /boom from grok/)
  })

  it('rejects image runs that finish without a parseable path', async () => {
    const result = await grokImagineImage({
      prompt: 'a cube',
      home: makeHome(true),
      grokPath: FIXTURE_GROK,
      env: stubEnv({
        DSH_GROK_STUB_STDOUT: 'I made an image but will not say where.',
      }),
    })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, 'no_media')
  })
})
