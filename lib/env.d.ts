export declare function buildGrokEnv(input?: {
    home?: string;
    pathExtra?: string;
    base?: NodeJS.ProcessEnv;
    auth?: {
        mode: 'login' | 'api_key';
        apiKey?: string;
    };
}): NodeJS.ProcessEnv;
