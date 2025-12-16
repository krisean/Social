import type { Timestamp } from "firebase-admin/firestore";

export type SessionStatus = "lobby" | "answer" | "vote" | "results" | "ended";

export interface SessionSettings {
  answerSecs: number;
  voteSecs: number;
  maxTeams: number;
}

export interface RoundGroupDoc {
  id: string;
  prompt: string;
  teamIds: string[];
}

export interface RoundDoc {
  prompt?: string;
  groups: RoundGroupDoc[];
}

export interface SessionDoc {
  code: string;
  hostUid: string;
  status: SessionStatus;
  roundIndex: number;
  rounds: RoundDoc[];
  voteGroupIndex?: number | null;
  promptDeck: string[];
  promptCursor: number;
  promptLibraryId: string;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  endsAt?: Timestamp;
  settings: SessionSettings;
  venueName?: string;
  venueKey?: string;
}

export interface TeamDoc {
  uid: string;
  teamName: string;
  isHost: boolean;
  score: number;
  joinedAt: Timestamp;
  lastActiveAt: Timestamp;
  mascotId?: number;
}

export interface AnswerDoc {
  teamId: string;
  roundIndex: number;
  groupId: string;
  text: string;
  masked: boolean;
  createdAt: Timestamp;
}

export interface VoteDoc {
  voterId: string;
  answerId: string;
  roundIndex: number;
  groupId: string;
  createdAt: Timestamp;
}

export interface AnalyticsDoc {
  joinedCount: number;
  answerRate: number;
  voteRate: number;
  duration: number;
}
