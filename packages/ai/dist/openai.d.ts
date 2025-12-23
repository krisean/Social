/**
 * OpenAI Moderation Service
 * Content moderation using OpenAI API
 */
export interface ModerationResult {
    flagged: boolean;
    categories: {
        hate: boolean;
        harassment: boolean;
        self_harm: boolean;
        sexual: boolean;
        violence: boolean;
    };
    confidence: number;
}
export declare function moderateContent(content: string): Promise<ModerationResult>;
export declare function moderateMultiple(contents: string[]): Promise<ModerationResult[]>;
//# sourceMappingURL=openai.d.ts.map