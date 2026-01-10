import type { PromptLibraryId } from "./promptLibraries";

export interface CreateSessionRequest {
  teamName: string;
  venueName?: string;
  promptLibraryId?: PromptLibraryId;
  gameMode?: "classic" | "jeopardy";
  selectedCategories?: PromptLibraryId[];
}

export interface CreateSessionResponse {
  sessionId: string;
  code: string;
  session: Session;
}

export interface JoinSessionRequest {
  code: string;
  teamName: string;
}

export interface JoinSessionResponse {
  sessionId: string;
  team: Team;
  session: Session;
}

export interface StartGameRequest {
  sessionId: string;
}

export interface TransitionPhaseRequest {
  sessionId: string;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  text: string;
}

export interface SubmitVoteRequest {
  sessionId: string;
  answerId: string;
}

export interface KickTeamRequest {
  sessionId: string;
  teamId: string;
}

export interface SessionAnalyticsResponse {
  analytics: SessionAnalytics;
}

export type SessionStatus = "lobby" | "category-select" | "answer" | "vote" | "results" | "ended";

export interface SessionSettings {
  answerSecs: number;
  voteSecs: number;
  resultsSecs: number;
  maxTeams: number;
  gameMode?: "classic" | "jeopardy";
  categorySelectSecs?: number;
  selectedCategories?: PromptLibraryId[];
}

export interface RoundGroup {
  id: string;
  prompt: string;
  teamIds: string[];
  promptLibraryId?: PromptLibraryId;
  selectingTeamId?: string;
  selectedBonus?: {
    bonusType: 'points' | 'multiplier';
    bonusValue: number;
  };
}

export interface RoundDefinition {
  prompt?: string;
  groups: RoundGroup[];
}

export interface Session {
  id: string;
  code: string;
  hostUid: string;
  status: SessionStatus;
  roundIndex: number;
  rounds: RoundDefinition[];
  voteGroupIndex: number | null;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  endsAt?: string;
  settings: SessionSettings;
  venueName?: string;
  promptLibraryId?: PromptLibraryId;
  paused?: boolean;
  pausedAt?: string;
  totalPausedMs?: number;
  endedByHost?: boolean;
  categoryGrid?: {
    categories: Array<{
      id: PromptLibraryId;
      usedPrompts: number[];
    }>;
    totalSlots: number;
  };
}

export interface Team {
  id: string;
  uid: string;
  teamName: string;
  isHost: boolean;
  score: number;
  joinedAt: string;
  lastActiveAt?: string;
  mascotId?: number;
}

export interface Answer {
  id: string;
  teamId: string;
  roundIndex: number;
  groupId: string;
  text: string;
  createdAt: string;
  masked?: boolean;
}

export interface Vote {
  id: string;
  voterId: string;
  roundIndex: number;
  groupId: string;
  answerId: string;
  createdAt: string;
}

export interface RoundResults {
  roundIndex: number;
  winningAnswerId?: string;
  voteCounts: Record<string, number>;
  leaderboard: TeamLeaderboardEntry[];
}

export interface TeamLeaderboardEntry {
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
}

export interface SessionAnalytics {
  joinedCount: number;
  answerRate: number;
  voteRate: number;
  duration?: number;
}

export interface SetPromptLibraryRequest {
  sessionId: string;
  promptLibraryId: PromptLibraryId;
}

export interface SetPromptLibraryResponse {
  session: Session;
}

export interface PauseSessionRequest {
  sessionId: string;
  pause: boolean;
}

export interface CategorySelectionRequest {
  sessionId: string;
  groupId: string;
  categoryId: PromptLibraryId;
  promptIndex: number;
}

export interface CategorySelectionResponse {
  session: Session;
}
