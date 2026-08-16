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
