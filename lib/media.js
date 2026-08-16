const MEDIA_EXT = 'png|jpe?g|webp|gif|mp4|webm|mov';
const ABS_MEDIA = new RegExp(`(?:^|[\\s\`'"(\\[]|file://)(/[^\\s\`'")\\]]+\\.(?:${MEDIA_EXT}))`, 'gi');
function isImagePath(path) {
    return /\.(?:png|jpe?g|webp|gif)$/i.test(path);
}
function isVideoPath(path) {
    return /\.(?:mp4|webm|mov)$/i.test(path);
}
export function parseGrokStdout(stdout) {
    const trimmed = stdout.trim();
    if (!trimmed)
        return { text: '' };
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
            const record = parsed;
            const text = typeof record.text === 'string' ? record.text : trimmed;
            const sessionId = typeof record.sessionId === 'string' ? record.sessionId : undefined;
            return { text, sessionId };
        }
    }
    catch {
        // plain grok -p output
    }
    return { text: stdout };
}
export function extractMediaPaths(text, kind = 'any') {
    const found = [];
    const seen = new Set();
    for (const match of text.matchAll(ABS_MEDIA)) {
        const path = match[1]?.replace(/[.,;:]+$/, '');
        if (!path)
            continue;
        if (kind === 'image' && !isImagePath(path))
            continue;
        if (kind === 'video' && !isVideoPath(path))
            continue;
        if (seen.has(path))
            continue;
        seen.add(path);
        found.push(path);
    }
    return found;
}
