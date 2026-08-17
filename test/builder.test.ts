import assert from 'node:assert/strict'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { buildArgv } from '../src/argv.ts'
import { buildGrokEnv } from '../src/env.ts'
import { buildPrompt, IMAGE_TOOLS, VIDEO_TOOLS } from '../src/prompt.ts'

describe('buildArgv', () => {
  it('uses headless --prompt-file and Imagine tools for image and video', () => {
    const image = buildArgv({
      kind: 'image',
      promptFile: '/tmp/image.txt',
      cwd: '/work',
    })
    const video = buildArgv({
      kind: 'video',
      promptFile: '/tmp/video.txt',
      cwd: '/work',
    })

    assert.equal(image[0], '--prompt-file')
    assert.ok(image.includes('--always-approve'))
    const imageTools = image[image.indexOf('--tools') + 1]
    assert.ok(imageTools.includes('image_gen'))
    assert.equal(imageTools, IMAGE_TOOLS)

    assert.equal(video[0], '--prompt-file')
    const videoTools = video[video.indexOf('--tools') + 1]
    assert.ok(videoTools.includes('image_gen'))
    assert.ok(videoTools.includes('image_to_video'))
    assert.equal(videoTools, VIDEO_TOOLS)
  })

  it('does not restrict tools for text work', () => {
    const argv = buildArgv({ kind: 'text', promptFile: '/tmp/ask.txt', cwd: '/work' })
    assert.ok(!argv.includes('--tools'))
    assert.ok(argv.includes('--prompt-file'))
  })
})

describe('buildPrompt', () => {
  it('tells video runs to stage a still then animate', () => {
    const prompt = buildPrompt({ kind: 'video', prompt: 'slow push-in on a red cube' })
    assert.match(prompt, /no text-to-video/i)
    assert.match(prompt, /image_gen/)
    assert.match(prompt, /image_to_video/)
    assert.match(prompt, /slow push-in on a red cube/)
  })
})

describe('buildGrokEnv', () => {
  it('unsets XAI_API_KEY on the login path so a leftover key cannot take over', () => {
    const env = buildGrokEnv({
      home: '/tmp/fake-home',
      auth: { mode: 'login' },
      base: {
        PATH: '/usr/bin',
        XAI_API_KEY: 'xai-secret',
        https_proxy: 'http://127.0.0.1:7891',
      },
    })
    assert.equal(env.XAI_API_KEY, undefined)
    assert.ok(!('XAI_API_KEY' in env))
    assert.equal(env.HOME, '/tmp/fake-home')
    assert.equal(env.https_proxy, 'http://127.0.0.1:7891')
    assert.ok(env.PATH?.includes(join('/tmp/fake-home', '.grok', 'bin')))
  })

  it('forwards XAI_API_KEY on the api_key path', () => {
    const env = buildGrokEnv({
      home: '/tmp/fake-home',
      auth: { mode: 'api_key', apiKey: 'xai-from-config' },
      base: { PATH: '/usr/bin' },
    })
    assert.equal(env.XAI_API_KEY, 'xai-from-config')
  })
})
