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
    delete env.XAI_API_KEY;
    return env;
}
