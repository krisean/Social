/**
 * Top Comment Solo/Patron Game
 * Self-service solo play mode where a patron plays against historical answers
 */

import { HttpsError } from "firebase-functions/v2/https";
import type { Transaction } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { BaseGameEngine } from "../../engine/GameEngine";
import type {
  GameDescriptor,
  GameSessionDoc,
  GamePlayerDoc,
  GameAction,
  PhaseContext,
  PlayerScore,
  LeaderboardEntry,
} from "../../engine/types";
import { firestore } from "../../firebase";
import { getPromptLibrary, DEFAULT_PROMPT_LIBRARY_ID } from "../../shared/promptLibraries";
import type {
  TopCommentPhaseId,
  TopCommentSettings,
  AnswerDoc,
} from "./types";
import {
  getDefaultSettings,
  cleanAnswer,
  shuffleArray,
} from "./sharedLogic";

const GAME_ID = "top-comment-solo";
const SOLO_SESSION_COLLECTION = "soloSessions";
const HISTORICAL_ANSWERS_COLLECTION = "historicalAnswers";

interface SoloGameState {
  currentPromptIndex: number;
  prompts: string[];
  playerAnswers: string[];
  historicalAnswers: Array<{ answerId: string; text: string }>;
  currentRound: number;
  totalRounds: number;
  score: number;
}

export class TopCommentSoloGame extends BaseGameEngine<
  TopCommentPhaseId,
  TopCommentSettings,
  SoloGameState
> {
  descriptor: GameDescriptor = {
    id: GAME_ID,
    name: "Top Comment (Solo)",
    mode: "patron",
    description: "Play Top Comment on your own, compete against previous answers from other patrons",
    minPlayers: 1,
    maxPlayers: 1,
  };

  async createSession(
    sessionId: string,
    creator: GamePlayerDoc,
    settings: Partial<TopCommentSettings>,
    tx: Transaction,
  ): Promise<GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState>> {
    const validatedSettings = this.validateSettings(settings);
    const promptLibrary = getPromptLibrary(DEFAULT_PROMPT_LIBRARY_ID);

    // Select random prompts for this solo session
    const totalRounds = 5; // Solo mode: 5 quick rounds
    const shuffledPrompts = shuffleArray(promptLibrary.prompts);
    const selectedPrompts = shuffledPrompts.slice(0, totalRounds);

    const state: SoloGameState = {
      currentPromptIndex: 0,
      prompts: selectedPrompts,
      playerAnswers: [],
      historicalAnswers: [],
      currentRound: 0,
      totalRounds,
      score: 0,
    };

    const session: GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState> = {
      gameId: GAME_ID,
      phase: { id: "lobby" },
      settings: validatedSettings,
      state,
      createdAt: this.now(),
    };

    return session;
  }

  async startSession(sessionId: string, players: GamePlayerDoc[], tx: Transaction): Promise<void> {
    const sessionRef = firestore.collection(SOLO_SESSION_COLLECTION).doc(sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState>;

    if (session.phase.id !== "lobby") {
      throw new HttpsError("failed-precondition", "Game already started.");
    }

    // Start first answer phase
    const endsAt = this.timestampFromSeconds(session.settings.answerSecs);

    tx.update(sessionRef, {
      "phase.id": "answer",
      "phase.endsAt": endsAt,
      startedAt: this.now(),
    });
  }

  async endSession(sessionId: string, tx: Transaction): Promise<void> {
    const sessionRef = firestore.collection(SOLO_SESSION_COLLECTION).doc(sessionId);
    tx.update(sessionRef, {
      "phase.id": "ended",
      endedAt: this.now(),
    });
  }

  async advancePhase(
    sessionId: string,
    context: PhaseContext,
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SOLO_SESSION_COLLECTION).doc(sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState>;

    switch (session.phase.id) {
      case "answer":
        await this.advanceFromAnswer(sessionId, session, tx);
        break;
      case "vote":
        await this.advanceFromVote(sessionId, session, tx);
        break;
      case "results":
        await this.advanceFromResults(sessionId, session, tx);
        break;
      default:
        throw new HttpsError("failed-precondition", "Cannot advance from this phase.");
    }
  }

  async canAdvancePhase(sessionId: string, tx: Transaction): Promise<boolean> {
    const sessionRef = firestore.collection(SOLO_SESSION_COLLECTION).doc(sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState>;

    // Can advance from answer if player has submitted an answer
    if (session.phase.id === "answer") {
      return session.state.playerAnswers.length > session.state.currentRound;
    }

    return true;
  }

  async handlePlayerAction(
    sessionId: string,
    playerId: string,
    action: GameAction,
    tx: Transaction,
  ): Promise<void> {
    switch (action.type) {
      case "submit-answer":
        await this.handleSubmitAnswer(sessionId, playerId, action.payload as { text: string }, tx);
        break;
      case "submit-vote":
        await this.handleSubmitVote(sessionId, playerId, action.payload as { answerId: string }, tx);
        break;
      default:
        throw new HttpsError("invalid-argument", `Unknown action type: ${action.type}`);
    }
  }

  async calculateScores(sessionId: string, tx: Transaction): Promise<PlayerScore[]> {
    const sessionRef = firestore.collection(SOLO_SESSION_COLLECTION).doc(sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState>;

    const playersSnap = await tx.get(sessionRef.collection("players"));
    if (playersSnap.empty) return [];

    const player = playersSnap.docs[0].data() as GamePlayerDoc;

    return [{
      playerId: playersSnap.docs[0].id,
      score: session.state.score,
      rank: 1,
    }];
  }

  async getLeaderboard(sessionId: string, tx: Transaction): Promise<LeaderboardEntry[]> {
    const sessionRef = firestore.collection(SOLO_SESSION_COLLECTION).doc(sessionId);
    const playersSnap = await tx.get(sessionRef.collection("players"));
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState>;

    if (playersSnap.empty) return [];

    const player = playersSnap.docs[0].data() as GamePlayerDoc;

    return [{
      playerId: playersSnap.docs[0].id,
      playerName: player.name,
      score: session.state.score,
      rank: 1,
    }];
  }

  validateSettings(settings: unknown): TopCommentSettings {
    const defaults = getDefaultSettings();
    const partial = settings as Partial<TopCommentSettings>;

    return {
      answerSecs: partial.answerSecs ?? 45, // Shorter for solo mode
      voteSecs: partial.voteSecs ?? 20, // Shorter voting
      resultsSecs: partial.resultsSecs ?? 5, // Quick results
      maxTeams: 1, // Always 1 for solo
      totalRounds: 5, // Fixed rounds for solo
      groupSize: 1, // Not applicable for solo
    };
  }

  // Private helper methods

  private async advanceFromAnswer(
    sessionId: string,
    session: GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState>,
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SOLO_SESSION_COLLECTION).doc(sessionId);

    // Load historical answers for voting
    const historicalAnswers = await this.loadHistoricalAnswers(
      session.state.prompts[session.state.currentRound],
      tx,
    );

    const endsAt = this.timestampFromSeconds(session.settings.voteSecs);

    tx.update(sessionRef, {
      "phase.id": "vote",
      "phase.endsAt": endsAt,
      "state.historicalAnswers": historicalAnswers,
    });
  }

  private async advanceFromVote(
    sessionId: string,
    session: GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState>,
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SOLO_SESSION_COLLECTION).doc(sessionId);

    // Calculate score for this round (in solo mode, just showing results)
    const endsAt = this.timestampFromSeconds(session.settings.resultsSecs);

    tx.update(sessionRef, {
      "phase.id": "results",
      "phase.endsAt": endsAt,
    });
  }

  private async advanceFromResults(
    sessionId: string,
    session: GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState>,
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SOLO_SESSION_COLLECTION).doc(sessionId);

    // Save player's answer to historical collection
    const playerAnswer = session.state.playerAnswers[session.state.currentRound];
    if (playerAnswer) {
      await this.saveToHistoricalAnswers(
        session.state.prompts[session.state.currentRound],
        playerAnswer,
        tx,
      );
    }

    const nextRound = session.state.currentRound + 1;
    const isLastRound = nextRound >= session.state.totalRounds;

    if (isLastRound) {
      // End game
      const endedAt = this.now();
      tx.update(sessionRef, {
        "phase.id": "ended",
        "phase.endsAt": endedAt,
        endedAt,
      });
      return;
    }

    // Start next round
    const endsAt = this.timestampFromSeconds(session.settings.answerSecs);

    tx.update(sessionRef, {
      "phase.id": "answer",
      "phase.endsAt": endsAt,
      "state.currentRound": nextRound,
      "state.currentPromptIndex": nextRound,
      "state.historicalAnswers": [],
    });
  }

  private async handleSubmitAnswer(
    sessionId: string,
    playerId: string,
    payload: { text: string },
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SOLO_SESSION_COLLECTION).doc(sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState>;

    if (session.phase.id !== "answer") {
      throw new HttpsError("failed-precondition", "Answer phase is closed.");
    }

    const sanitized = cleanAnswer(payload.text);
    const playerAnswers = [...session.state.playerAnswers];
    playerAnswers[session.state.currentRound] = sanitized;

    tx.update(sessionRef, {
      "state.playerAnswers": playerAnswers,
    });

    const playerRef = sessionRef.collection("players").doc(playerId);
    tx.update(playerRef, { lastActiveAt: this.now() });
  }

  private async handleSubmitVote(
    sessionId: string,
    playerId: string,
    payload: { answerId: string },
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SOLO_SESSION_COLLECTION).doc(sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, SoloGameState>;

    if (session.phase.id !== "vote") {
      throw new HttpsError("failed-precondition", "Voting phase is closed.");
    }

    // In solo mode, voting is just for engagement/comparison
    // Award points based on whether they voted for a historical answer or their own
    const isPlayerAnswer = payload.answerId === "player";
    const pointsEarned = isPlayerAnswer ? 0 : 100; // Reward for voting for historical answers

    tx.update(sessionRef, {
      "state.score": session.state.score + pointsEarned,
    });

    const playerRef = sessionRef.collection("players").doc(playerId);
    tx.update(playerRef, { 
      lastActiveAt: this.now(),
      score: (session.state.score + pointsEarned),
    });
  }

  private async loadHistoricalAnswers(
    prompt: string,
    tx: Transaction,
  ): Promise<Array<{ answerId: string; text: string }>> {
    // Load up to 3 historical answers for this prompt
    const historicalRef = firestore
      .collection(HISTORICAL_ANSWERS_COLLECTION)
      .where("prompt", "==", prompt)
      .orderBy("createdAt", "desc")
      .limit(3);

    const snapshot = await tx.get(historicalRef);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data() as { text: string };
      return {
        answerId: doc.id,
        text: data.text,
      };
    });
  }

  private async saveToHistoricalAnswers(
    prompt: string,
    answer: string,
    tx: Transaction,
  ): Promise<void> {
    const historicalRef = firestore.collection(HISTORICAL_ANSWERS_COLLECTION).doc();
    
    tx.set(historicalRef, {
      prompt,
      text: answer,
      createdAt: this.now(),
    });
  }
}




