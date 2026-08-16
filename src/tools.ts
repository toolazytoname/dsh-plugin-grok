import { grokAsk, grokImagineImage, grokImagineVideo } from './api.js'
import type { GrokResult, PluginConfig } from './types.js'

export const TOOL_ASK = 'grok_ask'
export const TOOL_IMAGE = 'grok_imagine_image'
export const TOOL_VIDEO = 'grok_imagine_video'
export const TOOL_NAMES = [TOOL_ASK, TOOL_IMAGE, TOOL_VIDEO] as const

type Exec = { signal?: AbortSignal }

function renderResult(_args: unknown, value: unknown): Array<{ type: 'text'; text: string }> {
  const result = value as GrokResult
  if (!result.ok) {
    return [{ type: 'text', text: `ERROR (${result.code}): ${result.error}` }]
  }
  if (result.kind === 'text') {
    return [{ type: 'text', text: result.text }]
  }
  const lines = [
    result.paths.map((path) => path).join('\n'),
    result.text.trim() ? `\n${result.text.trim()}` : '',
  ]
  return [{ type: 'text', text: lines.join('').trim() }]
}

function baseConfig(config: PluginConfig, args: { cwd?: string }, exec?: Exec) {
  return {
    grokPath: config.grokPath,
    home: config.home,
    timeoutMs: config.timeoutMs,
    extraArgs: config.extraArgs,
    cwd: args.cwd,
    signal: exec?.signal,
  }
}

export function createTools(config: PluginConfig = {}) {
  return [
    {
      name: TOOL_ASK,
      description:
        'Send a text or coding task to the local Grok Build CLI (logged-in `grok`, headless). Use for writing, review, planning, or code edits. Do not use this for generating images or videos — call grok_imagine_image or grok_imagine_video instead.',
      parameters: {
        prompt: {
          type: 'string',
          required: true,
          description: 'The task for Grok to complete in the workspace.',
        },
        cwd: {
          type: 'string',
          description: 'Working directory. Defaults to the current workspace.',
        },
        model: {
          type: 'string',
          description: 'Optional Grok model id.',
        },
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: renderResult,
      },
      timeoutMs: config.timeoutMs ?? 300_000,
      async execute(args: { prompt: string; cwd?: string; model?: string }, exec?: Exec) {
        return grokAsk({
          ...baseConfig(config, args, exec),
          prompt: args.prompt,
          model: args.model,
        })
      },
    },
    {
      name: TOOL_IMAGE,
      description:
        'Generate or edit a still image with the local Grok Imagine tools (`image_gen` / `image_edit`) via the logged-in `grok` CLI. Use when the user wants a picture, poster, cover, illustration, or image edit. Do not use for video clips or for ordinary text/code work.',
      parameters: {
        prompt: {
          type: 'string',
          required: true,
          description: 'Image description, or the edit to apply.',
        },
        aspect_ratio: {
          type: 'string',
          description: 'Aspect ratio such as 1:1, 16:9, 9:16. Defaults to auto.',
        },
        image: {
          type: 'string',
          description: 'Optional absolute path of a reference image to edit.',
        },
        cwd: {
          type: 'string',
          description: 'Working directory. Defaults to the current workspace.',
        },
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: renderResult,
      },
      timeoutMs: config.timeoutMs ?? 300_000,
      async execute(
        args: { prompt: string; aspect_ratio?: string; image?: string; cwd?: string },
        exec?: Exec,
      ) {
        return grokImagineImage({
          ...baseConfig(config, args, exec),
          prompt: args.prompt,
          aspectRatio: args.aspect_ratio,
          image: args.image,
        })
      },
    },
    {
      name: TOOL_VIDEO,
      description:
        'Generate a short video with the local Grok Imagine tools. Grok has no text-to-video: this stages a still (`image_gen` / `image_edit`) then animates it (`image_to_video`). Use when the user wants a clip, animation, or image-to-video. Do not use for stills only or for text/code work.',
      parameters: {
        prompt: {
          type: 'string',
          required: true,
          description: 'Motion / scene description for the clip.',
        },
        image: {
          type: 'string',
          description: 'Optional absolute path of a still to animate.',
        },
        duration: {
          type: 'number',
          description: 'Clip length in seconds: 6 or 10. Defaults to 6.',
        },
        resolution: {
          type: 'string',
          description: '480p or 720p. Defaults to 480p.',
        },
        aspect_ratio: {
          type: 'string',
          description: 'Aspect ratio for the staged still. Defaults to 16:9.',
        },
        cwd: {
          type: 'string',
          description: 'Working directory. Defaults to the current workspace.',
        },
      },
      output: {
        schema: { type: 'object', additionalProperties: true },
        render: renderResult,
      },
      timeoutMs: config.timeoutMs ?? 600_000,
      async execute(
        args: {
          prompt: string
          image?: string
          duration?: number
          resolution?: string
          aspect_ratio?: string
          cwd?: string
        },
        exec?: Exec,
      ) {
        const duration = args.duration === 10 ? 10 : 6
        const resolution = args.resolution === '720p' ? '720p' : '480p'
        return grokImagineVideo({
          ...baseConfig(config, args, exec),
          prompt: args.prompt,
          image: args.image,
          duration,
          resolution,
          aspectRatio: args.aspect_ratio,
        })
      },
    },
  ]
}
