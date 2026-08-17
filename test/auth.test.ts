import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, it } from 'node:test'
import { grokAsk } from '../src/api.ts'
import { resolveAuth } from '../src/detect.ts'
import { FIXTURE_GROK, TEXT_STDOUT, makeHome, stubEnv } from './helpers.ts'

describe('resolveAuth', () => {
  it('prefers login over an API key', () => {
    const auth = resolveAuth({
      home: makeHome(true),
      apiKey: 'xai-ignored',
      env: { XAI_API_KEY: 'xai-env' },
    })
    assert.ok(!('error' in auth))
    if ('error' in auth) return
    assert.equal(auth.mode, 'login')
    assert.equal(auth.apiKey, undefined)
  })

  it('accepts XAI_API_KEY when there is no auth.json', () => {
    const auth = resolveAuth({
      home: makeHome(false),
      env: { XAI_API_KEY: 'xai-only' },
    })
    assert.ok(!('error' in auth))
    if ('error' in auth) return
    assert.equal(auth.mode, 'api_key')
    assert.equal(auth.apiKey, 'xai-only')
  })
})

describe('token users can run without login', () => {
  it('spawns grok with XAI_API_KEY when auth.json is missing', async () => {
    const record = join(
      tmpdir(),
      `dsh-grok-stub-record-auth-${process.pid}-${Math.random().toString(16).slice(2)}.json`,
    )
    const result = await grokAsk({
      prompt: 'hello from token user',
      home: makeHome(false),
      grokPath: FIXTURE_GROK,
      env: stubEnv({
        DSH_GROK_STUB_RECORD: record,
        DSH_GROK_STUB_STDOUT: TEXT_STDOUT,
        XAI_API_KEY: 'xai-token-user',
      }),
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.text, TEXT_STDOUT)
    const recorded = JSON.parse(readFileSync(record, 'utf8')) as { env: { XAI_API_KEY: string | null } }
    assert.equal(recorded.env.XAI_API_KEY, 'xai-token-user')
  })

  it('strips XAI_API_KEY when auth.json is present', async () => {
    const record = join(
      tmpdir(),
      `dsh-grok-stub-record-login-${process.pid}-${Math.random().toString(16).slice(2)}.json`,
    )
    const result = await grokAsk({
      prompt: 'hello from login user',
      home: makeHome(true),
      grokPath: FIXTURE_GROK,
      env: stubEnv({
        DSH_GROK_STUB_RECORD: record,
        DSH_GROK_STUB_STDOUT: TEXT_STDOUT,
        XAI_API_KEY: 'xai-should-not-leak',
      }),
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    const recorded = JSON.parse(readFileSync(record, 'utf8')) as { env: { XAI_API_KEY: string | null } }
    assert.equal(recorded.env.XAI_API_KEY, null)
  })
})
