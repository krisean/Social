/**
 * Game Engine Types for Supabase
 * Database-agnostic types for the modular game engine
 */
export type GameId = string;
export type GameMode = 'event' | 'patron';
export interface GameDescriptor {
    id: GameId;
    name: string;
    mode: GameMode;
    description: string;
    minPlayers?: number;
    maxPlayers?: number;
}
export interface GamePhase<TPhaseId = string, TData = unknown> {
    id: TPhaseId;
    data?: TData;
    endsAt?: string | null;
}
export interface GameSessionDoc<TPhaseId = string, TSettings = unknown, TState = unknown> {
    id: string;
    gameId: GameId;
    mode: GameMode;
    code?: string;
    hostId?: string;
    phase: GamePhase<TPhaseId>;
    settings: TSettings;
    state: TState;
    createdAt: string;
    startedAt?: string;
    endedAt?: string;
}
export interface GamePlayerDoc {
    id: string;
    sessionId: string;
    userId: string;
    displayName: string;
    teamName?: string;
    score: number;
    isActive: boolean;
    joinedAt: string;
    metadata?: Record<string, unknown>;
}
export interface PlayerScore {
    playerId: string;
    score: number;
    rank: number;
    metadata?: Record<string, unknown>;
}
export interface LeaderboardEntry {
    playerId: string;
    playerName: string;
    score: number;
    rank: number;
    metadata?: Record<string, unknown>;
}
export interface GameAction<TType = string, TPayload = unknown> {
    type: TType;
    payload: TPayload;
}
export interface PhaseContext {
    currentPhase: GamePhase;
    players: GamePlayerDoc[];
    timestamp: string;
}
export interface CreateSessionRequest {
    gameId: GameId;
    creatorName: string;
    venueName?: string;
    settings?: Record<string, unknown>;
}
export interface JoinSessionRequest {
    code: string;
    playerName: string;
}
export interface SessionActionRequest {
    sessionId: string;
}
export interface PlayerActionRequest {
    sessionId: string;
    action: GameAction;
}
export interface GamePluginDefinition {
    id: GameId;
    name: string;
    description?: string;
    EventMode?: any;
    PatronMode?: any;
    components: {
        HostView?: React.ComponentType<any>;
        PlayerView?: React.ComponentType<any>;
        TVDisplay?: React.ComponentType<any>;
        PatronView?: React.ComponentType<any>;
    };
    settings: any;
}
//# sourceMappingURL=types.d.ts.map