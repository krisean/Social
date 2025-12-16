// Updated limits for tomorrow's test
export const ANSWER_SECONDS = 45;
export const VOTE_SECONDS = 20;
export const RESULTS_SECONDS = 10;
export const MAX_TEAMS = 36;
export const TOTAL_ROUNDS = 1;
export const GROUP_SIZE = 6;

// Import prompts from shared JSON file
import {
  getPromptLibrary,
  DEFAULT_PROMPT_LIBRARY_ID,
} from "./shared/promptLibraries";

const defaultLibrary = getPromptLibrary(DEFAULT_PROMPT_LIBRARY_ID);
export const PROMPTS: string[] = defaultLibrary.prompts;

export const ROOM_CODE_LENGTH = 6;
export const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const SESSION_COLLECTION = "sessions";
export const ANALYTICS_COLLECTION = "analytics";
