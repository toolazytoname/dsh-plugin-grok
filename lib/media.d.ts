export declare function parseGrokStdout(stdout: string): {
    text: string;
    sessionId?: string;
};
export declare function extractMediaPaths(text: string, kind?: 'image' | 'video' | 'any'): string[];
