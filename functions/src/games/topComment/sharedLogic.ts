/**
 * Top Comment Shared Logic
 * Common game logic used by both Event and Patron modes
 */

import type { Round, RoundGroup, TopCommentSettings } from "./types";

export function shuffleArray<T>(values: readonly T[]): T[] {
  const array = [...values];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function normalizePromptDeck(
  deck: string[] | undefined,
  fallback: string[],
): string[] {
  if (deck && deck.length) {
    return [...deck];
  }
  return shuffleArray(fallback.length ? fallback : []);
}

export function drawPromptsForGroups(
  deck: string[] | undefined,
  cursor: number | undefined,
  count: number,
  promptPool: string[],
): {
  prompts: string[];
  promptDeck: string[];
  promptCursor: number;
} {
  if (count <= 0) {
    return {
      prompts: [],
      promptDeck: normalizePromptDeck(deck, promptPool),
      promptCursor: cursor ?? 0,
    };
  }

  let promptDeck = normalizePromptDeck(deck, promptPool);
  let promptCursor = Math.max(0, cursor ?? 0);

  if (promptDeck.length === 0) {
    promptDeck = shuffleArray(promptPool.length ? promptPool : []);
  }

  if (promptDeck.length === 0) {
    return { prompts: [], promptDeck, promptCursor: 0 };
  }

  const prompts: string[] = [];
  const usedThisRound = new Set<string>();
  const maxUnique = promptPool.length || promptDeck.length;

  const nextPrompt = () => {
    if (!promptDeck.length) {
      promptDeck = shuffleArray(promptPool.length ? promptPool : []);
      promptCursor = 0;
    }
    if (promptCursor >= promptDeck.length) {
      promptDeck = shuffleArray(promptPool.length ? promptPool : []);
      promptCursor = 0;
    }
    const value = promptDeck[promptCursor];
    promptCursor += 1;
    return value;
  };

  while (prompts.length < count) {
    let prompt = nextPrompt();
    let attempts = 0;
    while (usedThisRound.has(prompt) && attempts < maxUnique) {
      prompt = nextPrompt();
      attempts += 1;
    }
    usedThisRound.add(prompt);
    prompts.push(prompt);
  }

  return { prompts, promptDeck, promptCursor };
}

export function createRoundDefinition(
  teamIds: string[],
  deck: string[] | undefined,
  cursor: number | undefined,
  promptPool: string[],
  groupSize: number,
): { round: Round; promptDeck: string[]; promptCursor: number } {
  const shuffled = shuffleArray(teamIds);
  const groupCount = shuffled.length
    ? Math.ceil(shuffled.length / groupSize)
    : 0;

  const { prompts, promptDeck, promptCursor } = drawPromptsForGroups(
    deck,
    cursor,
    groupCount,
    promptPool,
  );

  const groups: RoundGroup[] = [];
  for (let index = 0; index < groupCount; index += 1) {
    const start = index * groupSize;
    const members = shuffled.slice(start, start + groupSize);
    if (!members.length) {
      continue;
    }
    groups.push({
      id: `g${index}`,
      prompt: prompts[index] ?? prompts[prompts.length - 1] ?? "",
      teamIds: members,
    });
  }

  const round: Round = {
    prompt: groups[0]?.prompt,
    groups,
  };

  return { round, promptDeck, promptCursor };
}

export function addTeamToRound(
  round: Round | undefined,
  teamId: string,
  deck: string[] | undefined,
  cursor: number | undefined,
  promptPool: string[],
  groupSize: number,
): { round: Round; promptDeck: string[]; promptCursor: number } | null {
  if (!round) return null;

  const cloned: Round = {
    prompt: round.prompt,
    groups: round.groups.map((group) => ({
      id: group.id,
      prompt: group.prompt,
      teamIds: [...group.teamIds],
    })),
  };

  if (cloned.groups.some((group) => group.teamIds.includes(teamId))) {
    return {
      round: cloned,
      promptDeck: deck ? [...deck] : normalizePromptDeck(deck, promptPool),
      promptCursor: cursor ?? 0,
    };
  }

  let targetGroup = cloned.groups.reduce<RoundGroup | null>((best, group) => {
    if (!best) return group;
    if (group.teamIds.length < best.teamIds.length) {
      return group;
    }
    return best;
  }, null);

  if (!targetGroup || targetGroup.teamIds.length >= groupSize) {
    const {
      prompts: [newPrompt],
      promptDeck,
      promptCursor,
    } = drawPromptsForGroups(deck, cursor, 1, promptPool);
    const promptValue = newPrompt ?? cloned.groups[0]?.prompt ?? "";
    targetGroup = {
      id: `g${cloned.groups.length}`,
      prompt: promptValue,
      teamIds: [],
    };
    cloned.groups.push(targetGroup);
    cloned.prompt = cloned.prompt ?? promptValue;
    targetGroup.teamIds.push(teamId);
    return { round: cloned, promptDeck, promptCursor };
  }

  targetGroup.teamIds.push(teamId);
  return {
    round: cloned,
    promptDeck: deck ? [...deck] : normalizePromptDeck(deck, promptPool),
    promptCursor: cursor ?? 0,
  };
}

export function findGroupForTeam(
  round: Round | undefined,
  teamId: string,
): RoundGroup | null {
  if (!round) return null;
  return round.groups.find((group) => group.teamIds.includes(teamId)) ?? null;
}

export function cleanTeamName(name: string): string {
  return name
    .trim()
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")
    .slice(0, 15);
}

export function cleanAnswer(text: string): string {
  const cleaned = text.trim();
  // Basic profanity filter could go here
  return cleaned.slice(0, 120);
}

export function getDefaultSettings(): TopCommentSettings {
  return {
    answerSecs: 45,
    voteSecs: 25,
    resultsSecs: 10,
    maxTeams: 24,
    totalRounds: 5,
    groupSize: 4,
  };
}





