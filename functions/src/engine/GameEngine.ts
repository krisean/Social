/**
 * Backend Game Engine Interface
 * All games must implement this interface on the server side
 */

import type { Transaction } from "firebase-admin/firestore";
import type {
  GameDescriptor,
  GameSessionDoc,
  GamePlayerDoc,
  GameAction,
  PhaseContext,
  PlayerScore,
  LeaderboardEntry,
} from "./types";

export interface GameEngine<
  TPhaseId = string,
  TSettings = unknown,
  TState = unknown,
> {
  // Game metadata
  descriptor: GameDescriptor;

  // Lifecycle management
  createSession(
    sessionId: string,
    creator: GamePlayerDoc,
    settings: Partial<TSettings>,
    tx: Transaction,
  ): Promise<GameSessionDoc<TPhaseId, TSettings, TState>>;

  startSession(
    sessionId: string,
    players: GamePlayerDoc[],
    tx: Transaction,
  ): Promise<void>;

  endSession(sessionId: string, tx: Transaction): Promise<void>;

  // Phase management
  advancePhase(
    sessionId: string,
    context: PhaseContext,
    tx: Transaction,
  ): Promise<void>;

  canAdvancePhase(sessionId: string, tx: Transaction): Promise<boolean>;

  // Player actions
  handlePlayerAction(
    sessionId: string,
    playerId: string,
    action: GameAction,
    tx: Transaction,
  ): Promise<void>;

  // Scoring & results
  calculateScores(sessionId: string, tx: Transaction): Promise<PlayerScore[]>;

  getLeaderboard(
    sessionId: string,
    tx: Transaction,
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
    sessionId: string,
    creator: GamePlayerDoc,
    settings: Partial<TSettings>,
    tx: Transaction,
  ): Promise<GameSessionDoc<TPhaseId, TSettings, TState>>;

  abstract startSession(
    sessionId: string,
    players: GamePlayerDoc[],
    tx: Transaction,
  ): Promise<void>;

  abstract endSession(sessionId: string, tx: Transaction): Promise<void>;

  abstract advancePhase(
    sessionId: string,
    context: PhaseContext,
    tx: Transaction,
  ): Promise<void>;

  abstract canAdvancePhase(sessionId: string, tx: Transaction): Promise<boolean>;

  abstract handlePlayerAction(
    sessionId: string,
    playerId: string,
    action: GameAction,
    tx: Transaction,
  ): Promise<void>;

  abstract calculateScores(
    sessionId: string,
    tx: Transaction,
  ): Promise<PlayerScore[]>;

  abstract getLeaderboard(
    sessionId: string,
    tx: Transaction,
  ): Promise<LeaderboardEntry[]>;

  abstract validateSettings(settings: unknown): TSettings;

  // Helper methods
  protected now(): FirebaseFirestore.Timestamp {
    const Timestamp = require("firebase-admin/firestore").Timestamp;
    return Timestamp.now();
  }

  protected timestampFromSeconds(seconds: number): FirebaseFirestore.Timestamp {
    const Timestamp = require("firebase-admin/firestore").Timestamp;
    return Timestamp.fromMillis(Date.now() + seconds * 1000);
  }
}


