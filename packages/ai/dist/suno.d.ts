/**
 * Suno API Integration
 * Music generation for VIBox game
 */
export interface SunoGenerationRequest {
    prompt: string;
    duration?: number;
    style?: string;
}
export interface SunoGenerationResult {
    id: string;
    url: string;
    status: 'processing' | 'completed' | 'failed';
    metadata?: {
        title?: string;
        duration?: number;
    };
}
export declare function generateSong(request: SunoGenerationRequest): Promise<SunoGenerationResult>;
export declare function getSongStatus(songId: string): Promise<SunoGenerationResult>;
//# sourceMappingURL=suno.d.ts.map