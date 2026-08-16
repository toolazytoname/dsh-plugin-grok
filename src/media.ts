const MEDIA_EXT = 'png|jpe?g|webp|gif|mp4|webm|mov'
const ABS_MEDIA = new RegExp(
  `(?:^|[\\s\`'"(\\[]|file://)(/[^\\s\`'")\\]]+\\.(?:${MEDIA_EXT}))`,
  'gi',
)

function isImagePath(path: string): boolean {
  return /\.(?:png|jpe?g|webp|gif)$/i.test(path)
}

function isVideoPath(path: string): boolean {
  return /\.(?:mp4|webm|mov)$/i.test(path)
}

export function parseGrokStdout(stdout: string): { text: string; sessionId?: string } {
  const trimmed = stdout.trim()
  if (!trimmed) return { text: '' }
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object') {
      const record = parsed as { text?: unknown; sessionId?: unknown }
      const text = typeof record.text === 'string' ? record.text : trimmed
      const sessionId = typeof record.sessionId === 'string' ? record.sessionId : undefined
      return { text, sessionId }
    }
  } catch {
    // plain grok -p output
  }
  return { text: stdout }
}

export function extractMediaPaths(text: string, kind: 'image' | 'video' | 'any' = 'any'): string[] {
  const found: string[] = []
  const seen = new Set<string>()
  for (const match of text.matchAll(ABS_MEDIA)) {
    const path = match[1]?.replace(/[.,;:]+$/, '')
    if (!path) continue
    if (kind === 'image' && !isImagePath(path)) continue
    if (kind === 'video' && !isVideoPath(path)) continue
    if (seen.has(path)) continue
    seen.add(path)
    found.push(path)
  }
  return found
}
