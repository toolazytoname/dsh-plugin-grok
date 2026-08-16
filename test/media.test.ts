import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { extractMediaPaths, parseGrokStdout } from '../src/media.ts'

const imageFixture = readFileSync(
  fileURLToPath(new URL('./fixtures/image-stdout.txt', import.meta.url)),
  'utf8',
)
const videoFixture = readFileSync(
  fileURLToPath(new URL('./fixtures/video-stdout.txt', import.meta.url)),
  'utf8',
)

describe('extractMediaPaths', () => {
  it('parses absolute image and video paths from real grok-shaped stdout', () => {
    const images = extractMediaPaths(imageFixture, 'image')
    const videos = extractMediaPaths(videoFixture, 'video')
    const both = extractMediaPaths(videoFixture, 'any')

    assert.deepEqual(images, ['/Users/demo/.grok/sessions/abc/images/foo.png'])
    assert.deepEqual(videos, ['/Users/demo/.grok/sessions/abc/videos/bar.mp4'])
    assert.deepEqual(both, [
      '/Users/demo/.grok/sessions/abc/images/foo.png',
      '/Users/demo/.grok/sessions/abc/videos/bar.mp4',
    ])
  })
})

describe('parseGrokStdout', () => {
  it('returns plain stdout as text and unwraps json.text when present', () => {
    assert.equal(parseGrokStdout('hello-from-stub').text, 'hello-from-stub')
    assert.equal(parseGrokStdout('{"text":"wrapped","sessionId":"s1"}').text, 'wrapped')
    assert.equal(parseGrokStdout('{"text":"wrapped","sessionId":"s1"}').sessionId, 's1')
  })
})
