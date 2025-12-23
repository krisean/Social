/**
 * Game Registry for Supabase
 * Manages registration and retrieval of available games
 */
import type { GameEngine } from './GameEngine';
import type { GameId, GameDescriptor } from './types';
export declare class GameRegistry {
    private static games;
    static register(game: GameEngine): void;
    static get(gameId: GameId): GameEngine | undefined;
    static getAll(): GameEngine[];
    static getAllDescriptors(): GameDescriptor[];
    static exists(gameId: GameId): boolean;
    static clear(): void;
}
//# sourceMappingURL=GameRegistry.d.ts.map