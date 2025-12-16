import { Filter } from "bad-words";

const filter = new Filter({ placeHolder: "*" });
filter.removeWords("hell", "damn");

export function maskProfanity(text: string) {
  if (!text) return text;
  return filter.clean(text);
}

export function containsProfanity(text: string) {
  if (!text) return false;
  return filter.isProfane(text);
}
