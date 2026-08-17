import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
export function resolveHome(home) {
    return home?.trim() || process.env.GROK_HOME?.trim() || homedir();
}
export function authPath(home) {
    return join(resolveHome(home), '.grok', 'auth.json');
}
export function isLoggedIn(home) {
    return existsSync(authPath(home));
}
export function resolveApiKey(explicit, env = process.env) {
    const key = explicit?.trim() || env.XAI_API_KEY?.trim();
    return key || undefined;
}
export function resolveAuth(input) {
    if (isLoggedIn(input.home)) {
        return { mode: 'login' };
    }
    const apiKey = resolveApiKey(input.apiKey, input.env ?? process.env);
    if (apiKey) {
        return { mode: 'api_key', apiKey };
    }
    return {
        error: 'No Grok credentials. Run `grok login` (writes ~/.grok/auth.json) or set XAI_API_KEY from https://console.x.ai.',
    };
}
export function defaultGrokBin(home) {
    return join(resolveHome(home), '.grok', 'bin', 'grok');
}
export function resolveGrokBin(explicit, home, pathEnv) {
    const candidates = [
        explicit?.trim(),
        process.env.DSH_PLUGIN_GROK_BIN?.trim(),
        'grok',
        defaultGrokBin(home),
    ].filter((value) => Boolean(value));
    const pathDirs = (pathEnv ?? process.env.PATH ?? '').split(':').filter(Boolean);
    for (const candidate of candidates) {
        if (candidate.includes('/') || candidate.includes('\\')) {
            if (existsSync(candidate))
                return candidate;
            continue;
        }
        for (const dir of pathDirs) {
            const full = join(dir, candidate);
            if (existsSync(full))
                return full;
        }
    }
    return null;
}
