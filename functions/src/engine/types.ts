/**
 * Backend Game Engine Types
 * Server-side types for the game engine
 */

import type { Timestamp } from "firebase-admin/firestore";

// Game registry and identification
export type GameId = string;
export type GameMode = "event" | "patron";

// Game descriptor - metadata about a game
export interface GameDescriptor {
  id: GameId;
  name: string;
  mode: GameMode;
  description: string;
  minPlayers?: number;
  maxPlayers?: number;
}

// Phase system - games define their own phases
export interface GamePhase<TPhaseId = string, TData = unknown> {
  id: TPhaseId;
  data?: TData;
  endsAt?: Timestamp | null;
}

// Generic session document that any game can use
export interface GameSessionDoc<
  TPhaseId = string,
  TSettings = unknown,
  TState = unknown,
> {
  gameId: GameId;
  code?: string; // Only for event mode
  hostUid?: string; // Only for event mode
  phase: GamePhase<TPhaseId>;
  settings: TSettings;
  state: TState; // Game-specific state
  createdAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
}

// Player/Team document
export interface GamePlayerDoc {
  uid: string;
  name: string;
  score: number;
  isHost?: boolean;
  joinedAt: Timestamp;
  lastActiveAt?: Timestamp;
  metadata?: Record<string, unknown>; // Game-specific player data
}

// Scoring
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

// Actions
export interface GameAction<TType = string, TPayload = unknown> {
  type: TType;
  payload: TPayload;
}

// Context for phase transitions
export interface PhaseContext {
  currentPhase: GamePhase;
  players: GamePlayerDoc[];
  timestamp: Timestamp;
}

// Request/Response types for API
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




