import type { GrokKind } from './types.js';
export declare const IMAGE_TOOLS = "image_gen,image_edit";
export declare const VIDEO_TOOLS = "image_gen,image_edit,image_to_video,reference_to_video";
export interface PromptInput {
    kind: GrokKind;
    prompt: string;
    aspectRatio?: string;
    image?: string;
    duration?: 6 | 10;
    resolution?: '480p' | '720p';
}
export declare function buildPrompt(input: PromptInput): string;
export declare function toolsFor(kind: GrokKind): string | undefined;
