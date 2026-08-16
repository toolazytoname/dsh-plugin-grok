import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { apply, TOOL_ASK, TOOL_IMAGE, TOOL_NAMES, TOOL_VIDEO } from '../src/index.ts'
import type { GrokResult } from '../src/types.ts'
import { FIXTURE_GROK, TEXT_STDOUT, makeHome } from './helpers.ts'

type Registered = {
  name: string
  description: string
  execute: (args: Record<string, unknown>) => Promise<GrokResult>
}

describe('apply', () => {
  it('registers text, image, and video tools with distinct use cases', () => {
    const registered: Registered[] = []
    apply({
      tools: {
        register(tool: unknown) {
          registered.push(tool as Registered)
        },
      },
    })
    assert.deepEqual(registered.map((tool) => tool.name), [...TOOL_NAMES])
    const ask = registered.find((tool) => tool.name === TOOL_ASK)
    const image = registered.find((tool) => tool.name === TOOL_IMAGE)
    const video = registered.find((tool) => tool.name === TOOL_VIDEO)
    assert.ok(ask && image && video)
    assert.match(ask.description, /text|coding/i)
    assert.match(ask.description, /grok_imagine_image/)
    assert.match(image.description, /image_gen/)
    assert.match(image.description, /still|picture|image/i)
    assert.match(video.description, /image_to_video/)
    assert.match(video.description, /no text-to-video|stages a still/i)
  })

  it('text tool execute drives the shipped runner and returns stub stdout', async () => {
    const registered: Registered[] = []
    apply(
      {
        tools: {
          register(tool: unknown) {
            registered.push(tool as Registered)
          },
        },
      },
      {
        grokPath: FIXTURE_GROK,
        home: makeHome(true),
        extraArgs: [],
      },
    )
    const ask = registered.find((tool) => tool.name === TOOL_ASK)
    assert.ok(ask)
    const previousStdout = process.env.DSH_GROK_STUB_STDOUT
    const previousKey = process.env.XAI_API_KEY
    process.env.DSH_GROK_STUB_STDOUT = TEXT_STDOUT
    delete process.env.XAI_API_KEY
    try {
      const result = await ask.execute({ prompt: 'Say hello from the tool.' })
      assert.equal(result.ok, true)
      if (!result.ok) return
      assert.equal(result.text, TEXT_STDOUT)
    } finally {
      if (previousStdout === undefined) delete process.env.DSH_GROK_STUB_STDOUT
      else process.env.DSH_GROK_STUB_STDOUT = previousStdout
      if (previousKey === undefined) delete process.env.XAI_API_KEY
      else process.env.XAI_API_KEY = previousKey
    }
  })
})
