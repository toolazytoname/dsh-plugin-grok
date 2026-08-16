import type { GrokResult, PluginConfig } from './types.js';
export declare const TOOL_ASK = "grok_ask";
export declare const TOOL_IMAGE = "grok_imagine_image";
export declare const TOOL_VIDEO = "grok_imagine_video";
export declare const TOOL_NAMES: readonly ["grok_ask", "grok_imagine_image", "grok_imagine_video"];
type Exec = {
    signal?: AbortSignal;
};
declare function renderResult(_args: unknown, value: unknown): Array<{
    type: 'text';
    text: string;
}>;
export declare function createTools(config?: PluginConfig): ({
    name: string;
    description: string;
    parameters: {
        prompt: {
            type: string;
            required: boolean;
            description: string;
        };
        cwd: {
            type: string;
            description: string;
        };
        model: {
            type: string;
            description: string;
        };
        aspect_ratio?: undefined;
        image?: undefined;
        duration?: undefined;
        resolution?: undefined;
    };
    output: {
        schema: {
            type: string;
            additionalProperties: boolean;
        };
        render: typeof renderResult;
    };
    timeoutMs: number;
    execute(args: {
        prompt: string;
        cwd?: string;
        model?: string;
    }, exec?: Exec): Promise<GrokResult>;
} | {
    name: string;
    description: string;
    parameters: {
        prompt: {
            type: string;
            required: boolean;
            description: string;
        };
        aspect_ratio: {
            type: string;
            description: string;
        };
        image: {
            type: string;
            description: string;
        };
        cwd: {
            type: string;
            description: string;
        };
        model?: undefined;
        duration?: undefined;
        resolution?: undefined;
    };
    output: {
        schema: {
            type: string;
            additionalProperties: boolean;
        };
        render: typeof renderResult;
    };
    timeoutMs: number;
    execute(args: {
        prompt: string;
        aspect_ratio?: string;
        image?: string;
        cwd?: string;
    }, exec?: Exec): Promise<GrokResult>;
} | {
    name: string;
    description: string;
    parameters: {
        prompt: {
            type: string;
            required: boolean;
            description: string;
        };
        image: {
            type: string;
            description: string;
        };
        duration: {
            type: string;
            description: string;
        };
        resolution: {
            type: string;
            description: string;
        };
        aspect_ratio: {
            type: string;
            description: string;
        };
        cwd: {
            type: string;
            description: string;
        };
        model?: undefined;
    };
    output: {
        schema: {
            type: string;
            additionalProperties: boolean;
        };
        render: typeof renderResult;
    };
    timeoutMs: number;
    execute(args: {
        prompt: string;
        image?: string;
        duration?: number;
        resolution?: string;
        aspect_ratio?: string;
        cwd?: string;
    }, exec?: Exec): Promise<GrokResult>;
})[];
export {};
