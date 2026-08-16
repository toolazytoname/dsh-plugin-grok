import type { GrokKind } from './types.js'

export const IMAGE_TOOLS = 'image_gen,image_edit'
export const VIDEO_TOOLS = 'image_gen,image_edit,image_to_video,reference_to_video'

export interface PromptInput {
  kind: GrokKind
  prompt: string
  aspectRatio?: string
  image?: string
  duration?: 6 | 10
  resolution?: '480p' | '720p'
}

export function buildPrompt(input: PromptInput): string {
  const task = input.prompt.trim()
  if (input.kind === 'text') {
    return [
      'You are Grok, invoked from DeepSeek Harness through the local Grok Build CLI.',
      'Complete the user task in the current working directory.',
      'Do not call https://api.x.ai. Do not use XAI_API_KEY.',
      '',
      `Task: ${task}`,
    ].join('\n')
  }

  if (input.kind === 'image') {
    return [
      'You are Grok Imagine, invoked from DeepSeek Harness through the local Grok Build CLI.',
      'Use only the allowed Imagine tools. Do not call https://api.x.ai. Do not use XAI_API_KEY.',
      'Generate exactly one still image.',
      input.image
        ? `This is an edit. Use image_edit on this file: ${input.image}`
        : 'Use image_gen.',
      `Prompt: ${task}`,
      `aspect_ratio: ${input.aspectRatio ?? 'auto'}`,
      'Print every output file as an absolute path on its own line.',
      'Do not describe the pixels at length.',
    ].join('\n')
  }

  const duration = input.duration ?? 6
  const resolution = input.resolution ?? '480p'
  return [
    'You are Grok Imagine, invoked from DeepSeek Harness through the local Grok Build CLI.',
    'Use only the allowed Imagine tools. Do not call https://api.x.ai. Do not use XAI_API_KEY.',
    'Grok has no text-to-video. Stage a still first, then animate it.',
    input.image
      ? `Start from this still with image_edit if needed: ${input.image}`
      : 'First use image_gen (or image_edit) to create the still.',
    'Then call image_to_video on that still.',
    `Motion prompt: ${task}`,
    `aspect_ratio: ${input.aspectRatio ?? '16:9'}`,
    `duration: ${duration}`,
    `resolution_name: ${resolution}`,
    'One motion only. Print every output file as an absolute path on its own line.',
    'Do not pretend a still image is a video.',
  ].join('\n')
}

export function toolsFor(kind: GrokKind): string | undefined {
  if (kind === 'image') return IMAGE_TOOLS
  if (kind === 'video') return VIDEO_TOOLS
  return undefined
}
