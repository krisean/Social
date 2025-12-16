import Filter from "bad-words";
import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from "./config";

const profanityFilter = new Filter({ placeHolder: "*" });
profanityFilter.removeWords("hell", "damn");

export function generateRoomCode(): string {
  const chars = ROOM_CODE_ALPHABET;
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    const index = Math.floor(Math.random() * chars.length);
    code += chars[index];
  }
  return code;
}

export function cleanTeamName(value: string) {
  return profanityFilter.clean(value).trim();
}

// Keep cleanNickname for backward compatibility if needed
export const cleanNickname = cleanTeamName;

export function cleanAnswer(value: string) {
  return profanityFilter.clean(value).trim();
}
