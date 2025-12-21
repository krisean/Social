/**
 * Game Engine Interface for Supabase
 * All games must implement this interface
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  GameDescriptor,
  GameSessionDoc,
  GamePlayerDoc,
  GameAction,
  PhaseContext,
  PlayerScore,
  LeaderboardEntry,
} from './types';

export interface GameEngine<
  TPhaseId = string,
  TSettings = unknown,
  TState = unknown,
> {
  // Game metadata
  descriptor: GameDescriptor;

  // Lifecycle management
  createSession(
    client: SupabaseClient,
    sessionId: string,
    creator: Partial<GamePlayerDoc>,
    settings: Partial<TSettings>,
  ): Promise<GameSessionDoc<TPhaseId, TSettings, TState>>;

  startSession(
    client: SupabaseClient,
    sessionId: string,
    players: GamePlayerDoc[],
  ): Promise<void>;

  endSession(
    client: SupabaseClient,
    sessionId: string,
  ): Promise<void>;

  // Phase management
  advancePhase(
    client: SupabaseClient,
    sessionId: string,
    context: PhaseContext,
  ): Promise<void>;

  canAdvancePhase(
    client: SupabaseClient,
    sessionId: string,
  ): Promise<boolean>;

  // Player actions
  handlePlayerAction(
    client: SupabaseClient,
    sessionId: string,
    playerId: string,
    action: GameAction,
  ): Promise<void>;

  // Scoring & results
  calculateScores(
    client: SupabaseClient,
    sessionId: string,
  ): Promise<PlayerScore[]>;

  getLeaderboard(
    client: SupabaseClient,
    sessionId: string,
  ): Promise<LeaderboardEntry[]>;

  // Validation
  validateSettings(settings: unknown): TSettings;
}

// Base abstract class that games can extend
export abstract class BaseGameEngine<
  TPhaseId = string,
  TSettings = unknown,
  TState = unknown,
> implements GameEngine<TPhaseId, TSettings, TState>
{
  abstract descriptor: GameDescriptor;

  abstract createSession(
    client: SupabaseClient,
    sessionId: string,
    creator: Partial<GamePlayerDoc>,
    settings: Partial<TSettings>,
  ): Promise<GameSessionDoc<TPhaseId, TSettings, TState>>;

  abstract startSession(
    client: SupabaseClient,
    sessionId: string,
    players: GamePlayerDoc[],
  ): Promise<void>;

  abstract endSession(
    client: SupabaseClient,
    sessionId: string,
  ): Promise<void>;

  abstract advancePhase(
    client: SupabaseClient,
    sessionId: string,
    context: PhaseContext,
  ): Promise<void>;

  abstract canAdvancePhase(
    client: SupabaseClient,
    sessionId: string,
  ): Promise<boolean>;

  abstract handlePlayerAction(
    client: SupabaseClient,
    sessionId: string,
    playerId: string,
    action: GameAction,
  ): Promise<void>;

  abstract calculateScores(
    client: SupabaseClient,
    sessionId: string,
  ): Promise<PlayerScore[]>;

  abstract getLeaderboard(
    client: SupabaseClient,
    sessionId: string,
  ): Promise<LeaderboardEntry[]>;

  abstract validateSettings(settings: unknown): TSettings;

  // Helper methods
  protected now(): string {
    return new Date().toISOString();
  }

  protected futureTimestamp(seconds: number): string {
    return new Date(Date.now() + seconds * 1000).toISOString();
  }
}

