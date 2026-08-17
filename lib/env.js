import { dirname } from 'node:path';
import { defaultGrokBin, resolveHome } from './detect.js';
export function buildGrokEnv(input = {}) {
    const base = input.base ?? process.env;
    const env = { ...base };
    const home = resolveHome(input.home);
    env.HOME = home;
    const grokBinDir = dirname(defaultGrokBin(home));
    const pathParts = [input.pathExtra, grokBinDir, env.PATH].filter(Boolean);
    env.PATH = pathParts.join(':');
    if (input.auth?.mode === 'api_key' && input.auth.apiKey) {
        env.XAI_API_KEY = input.auth.apiKey;
    }
    else {
        // Login sessions must not inherit a leftover API key (CLI prefers
        // auth.json, but a stray key can still confuse billing or Imagine).
        delete env.XAI_API_KEY;
    }
    return env;
}
