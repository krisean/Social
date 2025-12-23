import type { Session } from "./types";

export const phaseCopy: Record<Session["status"], string> = {
  lobby: "Gather your teams and share the code.",
  answer: "Teams are writing their responses.",
  vote: "Votes are coming in.",
  results: "Review the winning answer.",
  ended: "Session complete.",
};

export const actionLabel: Record<Session["status"], string> = {
  lobby: "Start Game",
  answer: "Lock Answers",
  vote: "Lock Votes",
  results: "Next Round",
  ended: "Session Ended",
};

export {
  promptLibraries,
  defaultPromptLibrary,
  defaultPromptLibraryId,
} from "./promptLibraries";
import { defaultPromptLibrary } from "./promptLibraries";

export const prompts: string[] = defaultPromptLibrary?.prompts ?? [];

export function formatCode(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

export const statusHeadline: Record<Session["status"], string> = {
  lobby: "Waiting for the host to start...",
  answer: "Answer the prompt!",
  vote: "Time to vote!",
  results: "Round results are in",
  ended: "Game over - thanks for playing!",
};

export const phaseHeadline: Record<Session["status"], string> = {
  lobby: "Scan the QR to join",
  answer: "Answer the prompt",
  vote: "Vote for your favorite idea",
  results: "Round results",
  ended: "Final leaderboard",
};

export const phaseSubtitle: Record<Session["status"], string> = {
  lobby: "Or visit game.barscores.ca and enter the room code.",
  answer: "Type fast! You have 90 seconds to drop your best answer.",
  vote: "Pick the funniest or boldest idea. No voting for your own team.",
  results: "Celebrate the winner! Next round starts soon.",
  ended: "Thanks for playing. Ask your host for the next code.",
};
