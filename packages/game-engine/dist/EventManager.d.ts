/**
 * Event Manager for Multi-Game Events
 * Orchestrates events that combine multiple games
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { GameRegistry } from './GameRegistry';
import type { GameId } from './types';
export interface EventRound {
    gameId: GameId;
    duration: number;
    settings?: Record<string, unknown>;
}
export interface EventConfig {
    name: string;
    venueId?: string;
    rounds: EventRound[];
}
export declare class EventManager {
    private registry;
    constructor(registry: GameRegistry);
    createEvent(client: SupabaseClient, config: EventConfig): Promise<string>;
    startEvent(client: SupabaseClient, sessionId: string): Promise<void>;
    advanceToNextRound(client: SupabaseClient, sessionId: string, currentRound: number): Promise<void>;
}
//# sourceMappingURL=EventManager.d.ts.map