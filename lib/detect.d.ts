export declare function resolveHome(home?: string): string;
export declare function authPath(home?: string): string;
export declare function isLoggedIn(home?: string): boolean;
export type AuthMode = 'login' | 'api_key';
export interface ResolvedAuth {
    mode: AuthMode;
    apiKey?: string;
}
export declare function resolveApiKey(explicit?: string, env?: NodeJS.ProcessEnv): string | undefined;
export declare function resolveAuth(input: {
    home?: string;
    apiKey?: string;
    env?: NodeJS.ProcessEnv;
}): ResolvedAuth | {
    error: string;
};
export declare function defaultGrokBin(home?: string): string;
export declare function resolveGrokBin(explicit?: string, home?: string, pathEnv?: string): string | null;
