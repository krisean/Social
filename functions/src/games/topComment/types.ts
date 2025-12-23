/**
 * Top Comment Game Types
 * Shared between Event and Patron modes
 */

import type { Timestamp } from "firebase-admin/firestore";

export type TopCommentPhaseId = "lobby" | "answer" | "vote" | "results" | "ended";

export interface TopCommentSettings {
  answerSecs: number;
  voteSecs: number;
  resultsSecs: number;
  maxTeams: number;
  totalRounds: number;
  groupSize: number;
}

export interface RoundGroup {
  id: string;
  prompt: string;
  teamIds: string[];
}

export interface Round {
  prompt?: string;
  groups: RoundGroup[];
}

export interface TopCommentState {
  roundIndex: number;
  rounds: Round[];
  voteGroupIndex: number | null;
  promptDeck: string[];
  promptCursor: number;
  promptLibraryId?: string;
  venueName?: string;
  venueKey?: string;
}

export interface AnswerDoc {
  teamId: string;
  roundIndex: number;
  groupId: string;
  text: string;
  createdAt: Timestamp;
  masked?: boolean;
}

export interface VoteDoc {
  voterId: string;
  roundIndex: number;
  groupId: string;
  answerId: string;
  createdAt: Timestamp;
}

export interface AnalyticsDoc {
  joinedCount: number;
  answerRate: number;
  voteRate: number;
  duration: number;
}





