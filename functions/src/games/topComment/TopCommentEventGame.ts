/**
 * Top Comment Event Game
 * Host-controlled multiplayer game implementation
 */

import { HttpsError } from "firebase-functions/v2/https";
import type { Transaction } from "firebase-admin/firestore";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
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
  TopCommentState,
  AnswerDoc,
  VoteDoc,
} from "./types";
import {
  getDefaultSettings,
  createRoundDefinition,
  addTeamToRound,
  findGroupForTeam,
  cleanAnswer,
  shuffleArray,
} from "./sharedLogic";

const GAME_ID = "top-comment-event";
const SESSION_COLLECTION = "sessions";

export class TopCommentEventGame extends BaseGameEngine<
  TopCommentPhaseId,
  TopCommentSettings,
  TopCommentState
> {
  descriptor: GameDescriptor = {
    id: GAME_ID,
    name: "Top Comment (Event)",
    mode: "event",
    description: "Host-controlled multiplayer game where teams compete to write the funniest answers",
    minPlayers: 2,
    maxPlayers: 24,
  };

  async createSession(
    sessionId: string,
    creator: GamePlayerDoc,
    settings: Partial<TopCommentSettings>,
    tx: Transaction,
  ): Promise<GameSessionDoc<TopCommentPhaseId, TopCommentSettings, TopCommentState>> {
    const validatedSettings = this.validateSettings(settings);
    const promptLibrary = getPromptLibrary(DEFAULT_PROMPT_LIBRARY_ID);

    const initialRounds = Array.from(
      { length: validatedSettings.totalRounds },
      () => ({ prompt: undefined, groups: [] }),
    );

    const state: TopCommentState = {
      roundIndex: 0,
      rounds: initialRounds,
      voteGroupIndex: null,
      promptDeck: shuffleArray(promptLibrary.prompts),
      promptCursor: 0,
      promptLibraryId: promptLibrary.id,
    };

    const session: GameSessionDoc<TopCommentPhaseId, TopCommentSettings, TopCommentState> = {
      gameId: GAME_ID,
      phase: { id: "lobby" },
      settings: validatedSettings,
      state,
      createdAt: this.now(),
    };

    return session;
  }

  async startSession(sessionId: string, players: GamePlayerDoc[], tx: Transaction): Promise<void> {
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, TopCommentState>;

    if (session.phase.id !== "lobby") {
      throw new HttpsError("failed-precondition", "Game already started.");
    }

    // Get non-host players
    const nonHostPlayers = players.filter((p) => !p.isHost);
    const promptLibrary = getPromptLibrary(session.state.promptLibraryId);

    // Create first round
    const { round, promptDeck, promptCursor } = createRoundDefinition(
      nonHostPlayers.map((p) => p.uid),
      session.state.promptDeck,
      session.state.promptCursor,
      promptLibrary.prompts,
      session.settings.groupSize,
    );

    const rounds = [...session.state.rounds];
    rounds[0] = round;

    const endsAt = this.timestampFromSeconds(session.settings.answerSecs);

    tx.update(sessionRef, {
      "phase.id": "answer",
      "phase.endsAt": endsAt,
      "state.rounds": rounds,
      "state.promptDeck": promptDeck,
      "state.promptCursor": promptCursor,
      "state.voteGroupIndex": 0,
      startedAt: this.now(),
    });
  }

  async endSession(sessionId: string, tx: Transaction): Promise<void> {
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
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
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, TopCommentState>;

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
    // For event mode, host can always manually advance
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
      case "kick-player":
        await this.handleKickPlayer(sessionId, playerId, action.payload as { targetPlayerId: string }, tx);
        break;
      default:
        throw new HttpsError("invalid-argument", `Unknown action type: ${action.type}`);
    }
  }

  async calculateScores(sessionId: string, tx: Transaction): Promise<PlayerScore[]> {
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
    const playersSnap = await tx.get(sessionRef.collection("players"));

    const scores: PlayerScore[] = [];
    playersSnap.docs.forEach((doc, index) => {
      const player = doc.data() as GamePlayerDoc;
      scores.push({
        playerId: doc.id,
        score: player.score,
        rank: index + 1, // Will be properly ranked later
      });
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Assign ranks
    let currentRank = 1;
    for (let i = 0; i < scores.length; i++) {
      if (i > 0 && scores[i].score < scores[i - 1].score) {
        currentRank = i + 1;
      }
      scores[i].rank = currentRank;
    }

    return scores;
  }

  async getLeaderboard(sessionId: string, tx: Transaction): Promise<LeaderboardEntry[]> {
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
    const playersSnap = await tx.get(sessionRef.collection("players"));

    const entries: LeaderboardEntry[] = [];
    playersSnap.docs.forEach((doc) => {
      const player = doc.data() as GamePlayerDoc;
      entries.push({
        playerId: doc.id,
        playerName: player.name,
        score: player.score,
        rank: 0,
      });
    });

    // Sort by score descending
    entries.sort((a, b) => b.score - a.score);

    // Assign ranks
    let currentRank = 1;
    for (let i = 0; i < entries.length; i++) {
      if (i > 0 && entries[i].score < entries[i - 1].score) {
        currentRank = i + 1;
      }
      entries[i].rank = currentRank;
    }

    return entries;
  }

  validateSettings(settings: unknown): TopCommentSettings {
    const defaults = getDefaultSettings();
    const partial = settings as Partial<TopCommentSettings>;

    return {
      answerSecs: partial.answerSecs ?? defaults.answerSecs,
      voteSecs: partial.voteSecs ?? defaults.voteSecs,
      resultsSecs: partial.resultsSecs ?? defaults.resultsSecs,
      maxTeams: partial.maxTeams ?? defaults.maxTeams,
      totalRounds: partial.totalRounds ?? defaults.totalRounds,
      groupSize: partial.groupSize ?? defaults.groupSize,
    };
  }

  // Private helper methods

  private async advanceFromAnswer(
    sessionId: string,
    session: GameSessionDoc<TopCommentPhaseId, TopCommentSettings, TopCommentState>,
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
    const endsAt = this.timestampFromSeconds(session.settings.voteSecs);

    tx.update(sessionRef, {
      "phase.id": "vote",
      "phase.endsAt": endsAt,
      "state.voteGroupIndex": 0,
    });
  }

  private async advanceFromVote(
    sessionId: string,
    session: GameSessionDoc<TopCommentPhaseId, TopCommentSettings, TopCommentState>,
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
    const currentRound = session.state.rounds[session.state.roundIndex];
    const groupCount = currentRound?.groups?.length ?? 0;
    const currentGroupIndex = Math.max(0, session.state.voteGroupIndex ?? 0);

    // Check if there are more groups to vote on
    if (groupCount && currentGroupIndex < groupCount - 1) {
      const nextGroupIndex = currentGroupIndex + 1;
      const endsAt = this.timestampFromSeconds(session.settings.voteSecs);
      tx.update(sessionRef, {
        "state.voteGroupIndex": nextGroupIndex,
        "phase.endsAt": endsAt,
      });
      return;
    }

    // All groups voted, tally scores
    await this.tallyVotesAndAwardPoints(sessionId, session, tx);

    // Move to results phase
    const endsAt = this.timestampFromSeconds(session.settings.resultsSecs);
    tx.update(sessionRef, {
      "phase.id": "results",
      "phase.endsAt": endsAt,
      "state.voteGroupIndex": null,
    });
  }

  private async advanceFromResults(
    sessionId: string,
    session: GameSessionDoc<TopCommentPhaseId, TopCommentSettings, TopCommentState>,
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
    const isLastRound = session.state.roundIndex >= session.state.rounds.length - 1;

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
    const nextRoundIndex = session.state.roundIndex + 1;
    const playersSnap = await tx.get(sessionRef.collection("players"));
    const nonHostPlayers = playersSnap.docs
      .map((doc) => doc.data() as GamePlayerDoc)
      .filter((p) => !p.isHost);

    const promptLibrary = getPromptLibrary(session.state.promptLibraryId);
    const { round, promptDeck, promptCursor } = createRoundDefinition(
      nonHostPlayers.map((p) => p.uid),
      session.state.promptDeck,
      session.state.promptCursor,
      promptLibrary.prompts,
      session.settings.groupSize,
    );

    const rounds = [...session.state.rounds];
    rounds[nextRoundIndex] = round;

    const endsAt = this.timestampFromSeconds(session.settings.answerSecs);

    tx.update(sessionRef, {
      "phase.id": "answer",
      "phase.endsAt": endsAt,
      "state.roundIndex": nextRoundIndex,
      "state.rounds": rounds,
      "state.promptDeck": promptDeck,
      "state.promptCursor": promptCursor,
      "state.voteGroupIndex": 0,
    });
  }

  private async handleSubmitAnswer(
    sessionId: string,
    playerId: string,
    payload: { text: string },
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, TopCommentState>;

    if (session.phase.id !== "answer") {
      throw new HttpsError("failed-precondition", "Answer phase is closed.");
    }

    const playerRef = sessionRef.collection("players").doc(playerId);
    const playerSnap = await tx.get(playerRef);
    if (!playerSnap.exists) {
      throw new HttpsError("permission-denied", "Join the session before answering.");
    }

    const player = playerSnap.data() as GamePlayerDoc;
    if (player.isHost) {
      throw new HttpsError("failed-precondition", "Hosts cannot submit answers.");
    }

    // Find player's group
    const currentRound = session.state.rounds[session.state.roundIndex];
    let targetGroup = findGroupForTeam(currentRound, playerId);

    // If not in a group yet, add them
    if (!targetGroup) {
      const promptLibrary = getPromptLibrary(session.state.promptLibraryId);
      const updated = addTeamToRound(
        currentRound,
        playerId,
        session.state.promptDeck,
        session.state.promptCursor,
        promptLibrary.prompts,
        session.settings.groupSize,
      );

      if (updated) {
        const rounds = [...session.state.rounds];
        rounds[session.state.roundIndex] = updated.round;
        tx.update(sessionRef, {
          "state.rounds": rounds,
          "state.promptDeck": updated.promptDeck,
          "state.promptCursor": updated.promptCursor,
        });
        targetGroup = findGroupForTeam(updated.round, playerId);
      }
    }

    if (!targetGroup) {
      throw new HttpsError("failed-precondition", "Group assignment missing.");
    }

    // Save answer
    const answerRef = sessionRef
      .collection("answers")
      .doc(`${playerId}_${session.state.roundIndex}`);

    const sanitized = cleanAnswer(payload.text);
    const answerDoc: AnswerDoc = {
      teamId: playerId,
      roundIndex: session.state.roundIndex,
      groupId: targetGroup.id,
      text: sanitized,
      createdAt: this.now(),
      masked: sanitized !== payload.text.trim(),
    };

    tx.set(answerRef, answerDoc, { merge: true });
    tx.update(playerRef, { lastActiveAt: this.now() });
  }

  private async handleSubmitVote(
    sessionId: string,
    playerId: string,
    payload: { answerId: string },
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, TopCommentState>;

    if (session.phase.id !== "vote") {
      throw new HttpsError("failed-precondition", "Voting phase is closed.");
    }

    const currentRound = session.state.rounds[session.state.roundIndex];
    const voteGroupIndex = Math.max(0, session.state.voteGroupIndex ?? 0);
    const targetGroup = currentRound?.groups?.[voteGroupIndex];

    if (!targetGroup) {
      throw new HttpsError("failed-precondition", "Voting group not available.");
    }

    // Verify answer exists and is in the correct group
    const answerRef = sessionRef.collection("answers").doc(payload.answerId);
    const answerSnap = await tx.get(answerRef);
    if (!answerSnap.exists) {
      throw new HttpsError("not-found", "Answer not found.");
    }

    const answer = answerSnap.data() as AnswerDoc;
    if (answer.groupId !== targetGroup.id) {
      throw new HttpsError("failed-precondition", "Answer not in active voting group.");
    }

    if (answer.teamId === playerId) {
      throw new HttpsError("failed-precondition", "Cannot vote for your own answer.");
    }

    // Save vote
    const voteRef = sessionRef
      .collection("votes")
      .doc(`${playerId}_${session.state.roundIndex}_${targetGroup.id}`);

    const voteDoc: VoteDoc = {
      voterId: playerId,
      answerId: payload.answerId,
      roundIndex: session.state.roundIndex,
      groupId: targetGroup.id,
      createdAt: this.now(),
    };

    tx.set(voteRef, voteDoc, { merge: true });

    const playerRef = sessionRef.collection("players").doc(playerId);
    tx.update(playerRef, { lastActiveAt: this.now() });
  }

  private async handleKickPlayer(
    sessionId: string,
    kickerId: string,
    payload: { targetPlayerId: string },
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as GameSessionDoc<TopCommentPhaseId, TopCommentSettings, TopCommentState>;

    if (session.hostUid !== kickerId) {
      throw new HttpsError("permission-denied", "Only the host can kick players.");
    }

    if (session.hostUid === payload.targetPlayerId) {
      throw new HttpsError("failed-precondition", "Cannot kick the host.");
    }

    const targetRef = sessionRef.collection("players").doc(payload.targetPlayerId);
    const targetSnap = await tx.get(targetRef);
    if (!targetSnap.exists) {
      throw new HttpsError("not-found", "Player not found.");
    }

    tx.delete(targetRef);
  }

  private async tallyVotesAndAwardPoints(
    sessionId: string,
    session: GameSessionDoc<TopCommentPhaseId, TopCommentSettings, TopCommentState>,
    tx: Transaction,
  ): Promise<void> {
    const sessionRef = firestore.collection(SESSION_COLLECTION).doc(sessionId);
    const roundIndex = session.state.roundIndex;

    // Get all answers and votes for this round
    const answersQuery = sessionRef
      .collection("answers")
      .where("roundIndex", "==", roundIndex);
    const votesQuery = sessionRef
      .collection("votes")
      .where("roundIndex", "==", roundIndex);

    const [answersSnap, votesSnap] = await Promise.all([
      tx.get(answersQuery),
      tx.get(votesQuery),
    ]);

    // Count votes per answer
    const voteCounts = new Map<string, number>();
    votesSnap.docs.forEach((doc) => {
      const vote = doc.data() as VoteDoc;
      voteCounts.set(vote.answerId, (voteCounts.get(vote.answerId) ?? 0) + 1);
    });

    // Group answers by group
    const answersByGroup = new Map<string, Array<{ id: string; teamId: string; votes: number }>>();
    answersSnap.docs.forEach((doc) => {
      const answer = doc.data() as AnswerDoc;
      const votes = voteCounts.get(doc.id) ?? 0;
      const list = answersByGroup.get(answer.groupId) ?? [];
      list.push({ id: doc.id, teamId: answer.teamId, votes });
      answersByGroup.set(answer.groupId, list);
    });

    // Award points
    const now = this.now();
    answersByGroup.forEach((answers) => {
      // Sort by votes
      answers.sort((a, b) => b.votes - a.votes);

      // Award 100 points per vote
      answers.forEach(({ teamId, votes }) => {
        if (votes > 0) {
          const playerRef = sessionRef.collection("players").doc(teamId);
          tx.update(playerRef, {
            score: FieldValue.increment(votes * 100),
            lastActiveAt: now,
          });
        }
      });

      // Award 1000 bonus to winner(s)
      if (answers.length > 0 && answers[0].votes > 0) {
        const maxVotes = answers[0].votes;
        const winners = answers.filter((a) => a.votes === maxVotes);
        winners.forEach(({ teamId }) => {
          const playerRef = sessionRef.collection("players").doc(teamId);
          tx.update(playerRef, {
            score: FieldValue.increment(1000),
            lastActiveAt: now,
          });
        });
      }
    });
  }
}




