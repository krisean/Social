/**
 * Game Manager
 * Routes game operations to the appropriate game implementation
 */

import { HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { firestore } from "../firebase";
import { GameRegistry } from "./GameRegistry";
import type {
  GameId,
  CreateSessionRequest,
  JoinSessionRequest,
  GameSessionDoc,
  GamePlayerDoc,
  GameAction,
} from "./types";
import { Timestamp } from "firebase-admin/firestore";

const SESSION_COLLECTION = "sessions";

export class GameManager {
  /**
   * Create a new game session
   */
  static async createSession(
    uid: string,
    request: CreateSessionRequest,
  ): Promise<{
    sessionId: string;
    code?: string;
    session: unknown;
    player: unknown;
  }> {
    const { gameId, creatorName, venueName, settings } = request;

    const game = GameRegistry.get(gameId);
    if (!game) {
      throw new HttpsError("not-found", `Game "${gameId}" not found.`);
    }

    logger.info("GameManager.createSession", { gameId, uid });

    // Generate session ID
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc();
    const sessionId = sessionRef.id;

    // Create player document
    const creator: GamePlayerDoc = {
      uid,
      name: this.cleanName(creatorName),
      score: 0,
      isHost: game.descriptor.mode === "event",
      joinedAt: Timestamp.now(),
      lastActiveAt: Timestamp.now(),
    };

    // Create session within transaction
    const result = await firestore.runTransaction(async (tx) => {
      const sessionDoc = await game.createSession(
        sessionId,
        creator,
        settings || {},
        tx,
      );

      // Generate code for event mode
      let code: string | undefined;
      if (game.descriptor.mode === "event") {
        code = await this.generateUniqueCode();
        sessionDoc.code = code;
        sessionDoc.hostUid = uid;
      }

      // Write session document
      tx.set(sessionRef, sessionDoc);

      // Write player document
      const playerRef = sessionRef.collection("players").doc(uid);
      tx.set(playerRef, creator);

      return { sessionDoc, code, creator };
    });

    logger.info("GameManager.createSession success", { sessionId, gameId });

    return {
      sessionId,
      code: result.code,
      session: this.serializeSession(result.sessionDoc, sessionId),
      player: this.serializePlayer(result.creator, uid),
    };
  }

  /**
   * Join an existing session
   */
  static async joinSession(
    uid: string,
    request: JoinSessionRequest,
  ): Promise<{
    sessionId: string;
    session: unknown;
    player: unknown;
  }> {
    const { code, playerName } = request;

    logger.info("GameManager.joinSession", { code, uid });

    // Find session by code
    const sessionsQuery = await firestore
      .collection(SESSION_COLLECTION)
      .where("code", "==", code.toUpperCase())
      .limit(1)
      .get();

    if (sessionsQuery.empty) {
      throw new HttpsError("not-found", "Room code not found.");
    }

    const sessionSnap = sessionsQuery.docs[0];
    const sessionRef = sessionSnap.ref;
    const sessionId = sessionSnap.id;
    const sessionData = sessionSnap.data() as GameSessionDoc;

    const game = GameRegistry.get(sessionData.gameId);
    if (!game) {
      throw new HttpsError("not-found", "Game no longer available.");
    }

    // Join session within transaction
    const result = await firestore.runTransaction(async (tx) => {
      const playerRef = sessionRef.collection("players").doc(uid);
      const existingPlayer = await tx.get(playerRef);

      const now = Timestamp.now();
      const cleanedName = this.cleanName(playerName);

      if (existingPlayer.exists) {
        // Update existing player
        tx.update(playerRef, {
          name: cleanedName,
          lastActiveAt: now,
        });
        const updatedPlayer = {
          ...(existingPlayer.data() as GamePlayerDoc),
          name: cleanedName,
          lastActiveAt: now,
        };
        return { player: updatedPlayer };
      } else {
        // Create new player
        const player: GamePlayerDoc = {
          uid,
          name: cleanedName,
          score: 0,
          isHost: false,
          joinedAt: now,
          lastActiveAt: now,
        };
        tx.set(playerRef, player);
        return { player };
      }
    });

    logger.info("GameManager.joinSession success", { sessionId, uid });

    return {
      sessionId,
      session: this.serializeSession(sessionData, sessionId),
      player: this.serializePlayer(result.player, uid),
    };
  }

  /**
   * Start a game session
   */
  static async startSession(
    sessionId: string,
    uid: string,
  ): Promise<{ session: unknown }> {
    logger.info("GameManager.startSession", { sessionId, uid });

    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);

    const result = await firestore.runTransaction(async (tx) => {
      const sessionSnap = await tx.get(sessionRef);
      if (!sessionSnap.exists) {
        throw new HttpsError("not-found", "Session not found.");
      }

      const sessionData = sessionSnap.data() as GameSessionDoc;
      this.requireHost(sessionData, uid);

      const game = GameRegistry.get(sessionData.gameId);
      if (!game) {
        throw new HttpsError("not-found", "Game not found.");
      }

      // Get all players
      const playersSnap = await tx.get(sessionRef.collection("players"));
      const players = playersSnap.docs.map(
        (doc) => doc.data() as GamePlayerDoc,
      );

      await game.startSession(sessionId, players, tx);

      return { sessionData };
    });

    logger.info("GameManager.startSession success", { sessionId });

    return {
      session: this.serializeSession(result.sessionData, sessionId),
    };
  }

  /**
   * Advance to the next phase
   */
  static async advancePhase(
    sessionId: string,
    uid: string,
  ): Promise<{ session: unknown }> {
    logger.info("GameManager.advancePhase", { sessionId, uid });

    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);

    const result = await firestore.runTransaction(async (tx) => {
      const sessionSnap = await tx.get(sessionRef);
      if (!sessionSnap.exists) {
        throw new HttpsError("not-found", "Session not found.");
      }

      const sessionData = sessionSnap.data() as GameSessionDoc;
      this.requireHost(sessionData, uid);

      const game = GameRegistry.get(sessionData.gameId);
      if (!game) {
        throw new HttpsError("not-found", "Game not found.");
      }

      // Get all players
      const playersSnap = await tx.get(sessionRef.collection("players"));
      const players = playersSnap.docs.map(
        (doc) => doc.data() as GamePlayerDoc,
      );

      const context = {
        currentPhase: sessionData.phase,
        players,
        timestamp: Timestamp.now(),
      };

      await game.advancePhase(sessionId, context, tx);

      return { sessionData };
    });

    logger.info("GameManager.advancePhase success", { sessionId });

    return {
      session: this.serializeSession(result.sessionData, sessionId),
    };
  }

  /**
   * End a session
   */
  static async endSession(
    sessionId: string,
    uid: string,
  ): Promise<{ session: unknown }> {
    logger.info("GameManager.endSession", { sessionId, uid });

    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);

    const result = await firestore.runTransaction(async (tx) => {
      const sessionSnap = await tx.get(sessionRef);
      if (!sessionSnap.exists) {
        throw new HttpsError("not-found", "Session not found.");
      }

      const sessionData = sessionSnap.data() as GameSessionDoc;
      this.requireHost(sessionData, uid);

      const game = GameRegistry.get(sessionData.gameId);
      if (!game) {
        throw new HttpsError("not-found", "Game not found.");
      }

      await game.endSession(sessionId, tx);

      return { sessionData };
    });

    logger.info("GameManager.endSession success", { sessionId });

    return {
      session: this.serializeSession(result.sessionData, sessionId),
    };
  }

  /**
   * Handle a player action
   */
  static async handlePlayerAction(
    sessionId: string,
    uid: string,
    action: GameAction,
  ): Promise<{ success: boolean }> {
    logger.info("GameManager.handlePlayerAction", {
      sessionId,
      uid,
      actionType: action.type,
    });

    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);

    await firestore.runTransaction(async (tx) => {
      const sessionSnap = await tx.get(sessionRef);
      if (!sessionSnap.exists) {
        throw new HttpsError("not-found", "Session not found.");
      }

      const sessionData = sessionSnap.data() as GameSessionDoc;

      const game = GameRegistry.get(sessionData.gameId);
      if (!game) {
        throw new HttpsError("not-found", "Game not found.");
      }

      await game.handlePlayerAction(sessionId, uid, action, tx);
    });

    logger.info("GameManager.handlePlayerAction success", { sessionId, uid });

    return { success: true };
  }

  // Helper methods
  private static requireHost(session: GameSessionDoc, uid: string): void {
    if (session.hostUid !== uid) {
      throw new HttpsError(
        "permission-denied",
        "Only the host can perform this action.",
      );
    }
  }

  private static cleanName(name: string): string {
    return name.trim().slice(0, 50);
  }

  private static async generateUniqueCode(): Promise<string> {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let attempt = 0; attempt < 10; attempt++) {
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }

      const existing = await firestore
        .collection(SESSION_COLLECTION)
        .where("code", "==", code)
        .limit(1)
        .get();

      if (existing.empty) {
        return code;
      }
    }

    throw new HttpsError("internal", "Failed to generate unique code.");
  }

  private static serializeSession(
    sessionDoc: GameSessionDoc,
    sessionId: string,
  ): unknown {
    return {
      id: sessionId,
      gameId: sessionDoc.gameId,
      code: sessionDoc.code,
      hostUid: sessionDoc.hostUid,
      phase: {
        id: sessionDoc.phase.id,
        data: sessionDoc.phase.data,
        endsAt: sessionDoc.phase.endsAt?.toDate().toISOString(),
      },
      settings: sessionDoc.settings,
      state: sessionDoc.state,
      createdAt: sessionDoc.createdAt.toDate().toISOString(),
      startedAt: sessionDoc.startedAt?.toDate().toISOString(),
      endedAt: sessionDoc.endedAt?.toDate().toISOString(),
    };
  }

  private static serializePlayer(
    playerDoc: GamePlayerDoc,
    playerId: string,
  ): unknown {
    return {
      id: playerId,
      uid: playerDoc.uid,
      name: playerDoc.name,
      score: playerDoc.score,
      isHost: playerDoc.isHost,
      joinedAt: playerDoc.joinedAt.toDate().toISOString(),
      lastActiveAt: playerDoc.lastActiveAt?.toDate().toISOString(),
      metadata: playerDoc.metadata,
    };
  }
}


