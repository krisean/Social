import { HttpsError } from "firebase-functions/v2/https";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { firestore } from "./firebase";
import {
  ANSWER_SECONDS,
  VOTE_SECONDS,
  RESULTS_SECONDS,
  MAX_TEAMS,
  PROMPTS,
  SESSION_COLLECTION,
  ANALYTICS_COLLECTION,
  TOTAL_ROUNDS,
  GROUP_SIZE,
} from "./config";
import { generateRoomCode, cleanTeamName, cleanAnswer } from "./utils";
import {
  getPromptLibrary,
  DEFAULT_PROMPT_LIBRARY_ID,
} from "./shared/promptLibraries";
import type {
  TeamDoc,
  SessionDoc,
  SessionStatus,
  RoundDoc,
  RoundGroupDoc,
  AnswerDoc,
  VoteDoc,
} from "./types";
import { getNextMascotId } from "./shared/mascots";

const activeStatuses: SessionStatus[] = ["lobby", "answer", "vote", "results"];

const sessionsCollection = firestore.collection(SESSION_COLLECTION);

const CHRISTIES_VENUE_KEY = "christies";
const CHRISTIES_ROOM_CODE = "CRSTYS";

const MAX_TRANSACTION_ATTEMPTS = 5;
const RETRYABLE_FIRESTORE_CODES = new Set([
  "aborted",
  "deadline-exceeded",
  "internal",
]);
type FirebaseHttpsErrorCode =
  | "cancelled"
  | "unknown"
  | "invalid-argument"
  | "deadline-exceeded"
  | "not-found"
  | "already-exists"
  | "permission-denied"
  | "resource-exhausted"
  | "failed-precondition"
  | "aborted"
  | "out-of-range"
  | "unimplemented"
  | "internal"
  | "unavailable"
  | "data-loss"
  | "unauthenticated";

const HTTPS_ERROR_CODES = new Set<FirebaseHttpsErrorCode>([
  "cancelled",
  "unknown",
  "invalid-argument",
  "deadline-exceeded",
  "not-found",
  "already-exists",
  "permission-denied",
  "resource-exhausted",
  "failed-precondition",
  "aborted",
  "out-of-range",
  "unimplemented",
  "internal",
  "unavailable",
  "data-loss",
  "unauthenticated",
]);

function extractFirestoreError(error: unknown) {
  if (error && typeof error === "object") {
    const withCode = error as { code?: unknown; message?: unknown };
    const code = typeof withCode.code === "string" ? withCode.code : null;
    const message =
      typeof withCode.message === "string" ? withCode.message : String(error);
    return { code, message };
  }
  return { code: null, message: String(error) };
}

function toHttpsErrorCode(code: string | null): FirebaseHttpsErrorCode | null {
  if (!code) return null;
  return HTTPS_ERROR_CODES.has(code as FirebaseHttpsErrorCode)
    ? (code as FirebaseHttpsErrorCode)
    : null;
}

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeWithRetry<T>(
  description: string,
  operation: () => Promise<T>,
): Promise<T> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const { code, message } = extractFirestoreError(error);

      if (code && RETRYABLE_FIRESTORE_CODES.has(code)) {
        logger.warn(`${description}: transient Firestore error`, {
          attempt,
          code,
          message,
        });
        if (attempt < MAX_TRANSACTION_ATTEMPTS) {
          const backoffMs = Math.pow(2, attempt - 1) * 100;
          await delay(backoffMs);
          continue;
        }
        logger.error(`${description}: retries exhausted`, {
          attempts: attempt,
          code,
          message,
        });
        throw new HttpsError(
          "unavailable",
          "Server is busy. Please retry shortly.",
        );
      }

      if (error instanceof HttpsError) {
        throw error;
      }

      const httpsCode = toHttpsErrorCode(code);
      if (httpsCode) {
        logger.warn(`${description}: Firestore error`, {
          code: httpsCode,
          message,
        });
        throw new HttpsError(httpsCode, message || "Request failed.");
      }

      logger.error(`${description}: unexpected failure`, {
        message,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new HttpsError("internal", "Unexpected server error.");
    }
  }

  logger.error(`${description}: retry loop exited without success`, {
    attempts: MAX_TRANSACTION_ATTEMPTS,
    error:
      lastError instanceof Error
        ? { message: lastError.message, stack: lastError.stack }
        : lastError,
  });
  throw new HttpsError("internal", "Unexpected server error.");
}

async function runTransactionWithRetry<T>(
  description: string,
  handler: (tx: FirebaseFirestore.Transaction) => Promise<T>,
): Promise<T> {
  return executeWithRetry(description, () => firestore.runTransaction(handler));
}

function nonHostTeamIds(
  docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[],
) {
  return docs
    .map((doc) => {
      const data = doc.data() as TeamDoc | undefined;
      if (data?.isHost) {
        return null;
      }
      return doc.id;
    })
    .filter((id): id is string => Boolean(id));
}

function shuffleArray<T>(values: readonly T[]): T[] {
  const array = [...values];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getPromptsForSession(session?: SessionDoc) {
  return getPromptLibrary(session?.promptLibraryId).prompts;
}

function normalizePromptDeck(deck: string[] | undefined, fallback: string[]) {
  if (deck && deck.length) {
    return [...deck];
  }
  return shuffleArray(fallback.length ? fallback : PROMPTS);
}

function drawPromptsForGroups(
  deck: string[] | undefined,
  cursor: number | undefined,
  count: number,
  promptPool: string[],
) {
  if (count <= 0) {
    return {
      prompts: [] as string[],
      promptDeck: normalizePromptDeck(deck, promptPool),
      promptCursor: cursor ?? 0,
    };
  }

  let promptDeck = normalizePromptDeck(deck, promptPool);
  let promptCursor = Math.max(0, cursor ?? 0);
  if (promptDeck.length === 0) {
    promptDeck = shuffleArray(promptPool.length ? promptPool : PROMPTS);
  }
  if (promptDeck.length === 0) {
    return { prompts: [] as string[], promptDeck, promptCursor: 0 };
  }

  const prompts: string[] = [];
  const usedThisRound = new Set<string>();
  const maxUnique = promptPool.length || promptDeck.length || PROMPTS.length;

  const nextPrompt = () => {
    if (!promptDeck.length) {
      promptDeck = shuffleArray(promptPool.length ? promptPool : PROMPTS);
      promptCursor = 0;
    }
    if (promptCursor >= promptDeck.length) {
      promptDeck = shuffleArray(promptPool.length ? promptPool : PROMPTS);
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

function createRoundDefinition(
  teamIds: string[],
  deck: string[] | undefined,
  cursor: number | undefined,
  promptPool: string[],
): { round: RoundDoc; promptDeck: string[]; promptCursor: number } {
  const shuffled = shuffleArray(teamIds);
  const groupCount = shuffled.length
    ? Math.ceil(shuffled.length / GROUP_SIZE)
    : 0;
  const { prompts, promptDeck, promptCursor } = drawPromptsForGroups(
    deck,
    cursor,
    groupCount,
    promptPool,
  );

  const groups: RoundGroupDoc[] = [];
  for (let index = 0; index < groupCount; index += 1) {
    const start = index * GROUP_SIZE;
    const members = shuffled.slice(start, start + GROUP_SIZE);
    if (!members.length) {
      continue;
    }
    groups.push({
      id: `g${index}`,
      prompt: prompts[index] ?? prompts[prompts.length - 1] ?? "",
      teamIds: members,
    });
  }

  const round: RoundDoc = {
    prompt: groups[0]?.prompt,
    groups,
  };

  return { round, promptDeck, promptCursor };
}

function cloneRound(round: RoundDoc | undefined): RoundDoc | null {
  if (!round) return null;
  return {
    prompt: round.prompt,
    groups: round.groups.map((group) => ({
      id: group.id,
      prompt: group.prompt,
      teamIds: [...group.teamIds],
    })),
  };
}

function addTeamToRound(
  round: RoundDoc | undefined,
  teamId: string,
  deck: string[] | undefined,
  cursor: number | undefined,
  promptPool: string[],
): { round: RoundDoc; promptDeck: string[]; promptCursor: number } | null {
  const cloned = cloneRound(round);
  if (!cloned) return null;

  if (cloned.groups.some((group) => group.teamIds.includes(teamId))) {
    return {
      round: cloned,
      promptDeck: deck ? [...deck] : normalizePromptDeck(deck, promptPool),
      promptCursor: cursor ?? 0,
    };
  }

  let targetGroup = cloned.groups.reduce<RoundGroupDoc | null>(
    (best, group) => {
      if (!best) return group;
      if (group.teamIds.length < best.teamIds.length) {
        return group;
      }
      return best;
    },
    null,
  );

  if (!targetGroup || targetGroup.teamIds.length >= GROUP_SIZE) {
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

function findGroupForTeam(round: RoundDoc | undefined, teamId: string) {
  if (!round) return null;
  return round.groups.find((group) => group.teamIds.includes(teamId)) ?? null;
}

function toIso(timestamp?: Timestamp | null) {
  return timestamp ? timestamp.toDate().toISOString() : undefined;
}

function serializeSession(
  snapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
) {
  const data = snapshot.data() as SessionDoc | undefined;
  if (!data) return null;
  return {
    id: snapshot.id,
    code: data.code,
    hostUid: data.hostUid,
    status: data.status,
    roundIndex: data.roundIndex,
    rounds: Array.isArray(data.rounds)
      ? (data.rounds as unknown[]).map((round) => {
          if (
            round &&
            typeof round === "object" &&
            Array.isArray((round as { groups?: unknown }).groups)
          ) {
            return round as RoundDoc;
          }
          if (
            round &&
            typeof round === "object" &&
            "prompt" in round &&
            typeof (round as { prompt?: unknown }).prompt === "string"
          ) {
            return {
              prompt: (round as { prompt?: string }).prompt,
              groups: [],
            } satisfies RoundDoc;
          }
          if (typeof round === "string") {
            return { prompt: round, groups: [] } satisfies RoundDoc;
          }
          return { prompt: undefined, groups: [] } satisfies RoundDoc;
        })
      : [],
    voteGroupIndex:
      typeof data.voteGroupIndex === "number" ? data.voteGroupIndex : null,
    createdAt: toIso(data.createdAt)!,
    startedAt: toIso(data.startedAt),
    endedAt: toIso(data.endedAt),
    endsAt: toIso(data.endsAt),
    settings: data.settings,
    venueName: data.venueName,
    promptLibraryId: data.promptLibraryId ?? DEFAULT_PROMPT_LIBRARY_ID,
  };
}

function serializeTeam(
  snapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
) {
  const data = snapshot.data() as TeamDoc | undefined;
  if (!data) return null;
  return {
    id: snapshot.id,
    uid: data.uid,
    teamName: data.teamName,
    isHost: data.isHost,
    score: data.score,
    joinedAt: toIso(data.joinedAt)!,
    lastActiveAt: toIso(data.lastActiveAt),
    mascotId: data.mascotId,
  };
}

async function ensureUniqueCode(): Promise<string> {
  logger.debug("ensureUniqueCode: attempting to generate code");
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateRoomCode();
    const existing = await sessionsCollection
      .where("code", "==", code)
      .limit(1)
      .get();
    if (existing.empty) {
      logger.debug("ensureUniqueCode: generated unique code", {
        code,
        attempt,
      });
      return code;
    }
  }
  logger.error("ensureUniqueCode: exhausted attempts to generate unique code");
  throw new HttpsError("internal", "Failed to generate unique room code.");
}

function createVenueKey(name: string) {
  return name.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

async function endActiveSessionsForVenue(
  venueKey: string,
  fallbackName?: string,
) {
  const sessionDocs = new Map<
    string,
    FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
  >();
  const queries = [sessionsCollection.where("venueKey", "==", venueKey)];
  if (fallbackName) {
    queries.push(sessionsCollection.where("venueName", "==", fallbackName));
  }

  for (const query of queries) {
    const snapshot = await query.limit(10).get();
    snapshot.docs.forEach((doc) => {
      sessionDocs.set(doc.id, doc);
    });
  }

  const activeSessions = Array.from(sessionDocs.values()).filter((doc) => {
    const data = doc.data() as SessionDoc | undefined;
    return data ? activeStatuses.includes(data.status) : false;
  });

  for (const doc of activeSessions) {
    const data = doc.data() as SessionDoc | undefined;
    if (!data?.hostUid) continue;
    try {
      await endSession(doc.id, data.hostUid);
    } catch (error) {
      logger.error("endActiveSessionsForVenue: failed to end session", {
        venueKey,
        sessionId: doc.id,
        error,
      });
    }
  }
}

export async function createSessionForHost(
  uid: string,
  teamName: string,
  venueName?: string,
  promptLibraryId?: string,
) {
  logger.info("createSessionForHost: start", {
    uid,
    hasVenueName: Boolean(venueName),
    promptLibraryId,
  });
  try {
    const hostSessionsSnapshot = await sessionsCollection
      .where("hostUid", "==", uid)
      .limit(10)
      .get();
    const existingActive = hostSessionsSnapshot.docs.find((doc) => {
      const data = doc.data() as SessionDoc | undefined;
      return data ? activeStatuses.includes(data.status) : false;
    });

    if (existingActive) {
      logger.warn("createSessionForHost: host already has active session", {
        uid,
      });
      throw new HttpsError(
        "failed-precondition",
        "Host already has an active session. End it before creating a new one.",
      );
    }

    const cleanedVenueName = venueName ? cleanTeamName(venueName) : undefined;
    const venueKey = cleanedVenueName
      ? createVenueKey(cleanedVenueName)
      : undefined;
    const isChristiesVenue = venueKey === CHRISTIES_VENUE_KEY;

    if (isChristiesVenue && venueKey) {
      await endActiveSessionsForVenue(venueKey, cleanedVenueName);
    }

    const code = isChristiesVenue
      ? CHRISTIES_ROOM_CODE
      : await ensureUniqueCode();
    const sessionRef = sessionsCollection.doc();
    const now = Timestamp.now();
    const promptLibrary = getPromptLibrary(promptLibraryId);
    const promptPool = promptLibrary.prompts;

    const initialRounds: RoundDoc[] = Array.from(
      { length: TOTAL_ROUNDS },
      () => ({
        prompt: undefined,
        groups: [],
      }),
    );

    const sessionData: SessionDoc = {
      code,
      hostUid: uid,
      status: "lobby",
      roundIndex: 0,
      rounds: initialRounds,
      voteGroupIndex: null,
      promptDeck: shuffleArray(promptPool),
      promptCursor: 0,
      promptLibraryId: promptLibrary.id,
      createdAt: now,
      settings: {
        answerSecs: ANSWER_SECONDS,
        voteSecs: VOTE_SECONDS,
        maxTeams: MAX_TEAMS,
      },
      venueName: cleanedVenueName,
      venueKey,
    };

    await sessionRef.set(sessionData);

    const teamRef = sessionRef.collection("teams").doc(uid);
    const teamData: TeamDoc = {
      uid,
      teamName: cleanTeamName(teamName),
      isHost: true,
      score: 0,
      joinedAt: now,
      lastActiveAt: now,
      mascotId: 1,
    };

    await teamRef.set(teamData);

    const sessionSnapshot = await sessionRef.get();
    const teamSnapshot = await teamRef.get();

    const response = {
      sessionId: sessionRef.id,
      code,
      session: serializeSession(sessionSnapshot)!,
      team: serializeTeam(teamSnapshot)!,
    };

    logger.info("createSessionForHost: success", {
      uid,
      sessionId: sessionRef.id,
      code,
    });

    return response;
  } catch (error) {
    if (error instanceof HttpsError) {
      logger.warn("createSessionForHost: failed with HttpsError", {
        uid,
        code: error.code,
        message: error.message,
      });
    } else {
      logger.error("createSessionForHost: unexpected failure", {
        uid,
        error:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error,
      });
    }
    throw error;
  }
}

export async function setSessionPromptLibrary(
  sessionId: string,
  uid: string,
  promptLibraryId: string,
) {
  const sessionRef = sessionsCollection.doc(sessionId);
  const promptLibrary = getPromptLibrary(promptLibraryId);
  const promptPool = promptLibrary.prompts;

  const session = await runTransactionWithRetry(
    "setSessionPromptLibrary",
    async (tx) => {
      const sessionSnap = await tx.get(sessionRef);
      const data = sessionSnap.data() as SessionDoc | undefined;
      if (!data) {
        throw new HttpsError("not-found", "Session not found.");
      }
      requireHost(data, uid);
      if (data.status !== "lobby") {
        throw new HttpsError(
          "failed-precondition",
          "Prompt library can only be changed in the lobby.",
        );
      }

      const rounds: RoundDoc[] = Array.from({ length: TOTAL_ROUNDS }, () => ({
        prompt: undefined,
        groups: [],
      }));
      const promptDeck = shuffleArray(promptPool);

      tx.update(sessionRef, {
        promptLibraryId: promptLibrary.id,
        rounds,
        promptDeck,
        promptCursor: 0,
      });

      return {
        ...data,
        promptLibraryId: promptLibrary.id,
        rounds,
        promptDeck,
        promptCursor: 0,
      } satisfies SessionDoc;
    },
  );

  return session;
}

export async function joinSessionForTeam(
  uid: string,
  code: string,
  teamName: string,
) {
  const sessionQuery = await sessionsCollection
    .where("code", "==", code)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();
  if (sessionQuery.empty) {
    throw new HttpsError("not-found", "Room code not found.");
  }

  const snapshot = sessionQuery.docs[0];
  const sessionRef = snapshot.ref;

  await runTransactionWithRetry("joinSessionForTeam", async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    const sessionData = sessionSnap.data() as SessionDoc | undefined;

    if (!sessionData) {
      throw new HttpsError("not-found", "Session no longer available.");
    }

    if (sessionData.status === "ended") {
      throw new HttpsError(
        "failed-precondition",
        "This game has already ended.",
      );
    }

    const teamsRef = sessionRef.collection("teams");
    const teamsSnapshot = await tx.get(teamsRef);

    const existingTeamDoc = await tx.get(teamsRef.doc(uid));
    const isHostPlayer = sessionData.hostUid === uid;

    if (
      !existingTeamDoc.exists &&
      teamsSnapshot.size >= sessionData.settings.maxTeams
    ) {
      throw new HttpsError("resource-exhausted", "Room is full.");
    }

    const now = Timestamp.now();
    const sanitizedTeamName = cleanTeamName(teamName);
    const normalizedRequestedTeamName = sanitizedTeamName.toLowerCase();

    const duplicateTeamNameDoc = teamsSnapshot.docs.find((docSnap) => {
      if (docSnap.id === uid) {
        return false;
      }
      const data = docSnap.data() as TeamDoc | undefined;
      if (!data || !data.teamName) {
        return false;
      }
      return data.teamName.trim().toLowerCase() === normalizedRequestedTeamName;
    });

    if (duplicateTeamNameDoc) {
      throw new HttpsError(
        "already-exists",
        "That team name is already taken. Pick something else.",
      );
    }

    if (existingTeamDoc.exists) {
      tx.update(teamsRef.doc(uid), {
        teamName: sanitizedTeamName,
        lastActiveAt: now,
      });
    } else {
      // Get all currently used mascot IDs
      const usedMascotIds = teamsSnapshot.docs.map((doc) => {
          const data = doc.data() as TeamDoc | undefined;
          return data?.mascotId;
        })
        .filter((id): id is number => id !== undefined);

      // Assign next sequential mascot
      const mascotId = getNextMascotId(usedMascotIds);

      const teamData: TeamDoc = {
        uid,
        teamName: sanitizedTeamName,
        isHost: sessionData.hostUid === uid,
        score: 0,
        joinedAt: now,
        lastActiveAt: now,
        mascotId,
      };
      tx.set(teamsRef.doc(uid), teamData);
    }

    if (sessionData.status !== "lobby" && !isHostPlayer) {
      const rounds = [...(sessionData.rounds ?? [])];
      const activeIndex = Math.max(0, sessionData.roundIndex ?? 0);
      const existingRound = rounds[activeIndex];
      const promptPool = getPromptsForSession(sessionData);
      const updated = addTeamToRound(
        existingRound,
        uid,
        sessionData.promptDeck,
        sessionData.promptCursor,
        promptPool,
      );
      if (updated) {
        rounds[activeIndex] = updated.round;
        tx.update(sessionRef, {
          rounds,
          promptDeck: updated.promptDeck,
          promptCursor: updated.promptCursor,
        });
        return {
          ...sessionData,
          rounds,
          promptDeck: updated.promptDeck,
          promptCursor: updated.promptCursor,
        };
      }
    }

    return sessionData;
  });

  const teamSnapshot = await sessionRef.collection("teams").doc(uid).get();
  const sessionSnapshot = await sessionRef.get();

  return {
    sessionId: sessionRef.id,
    session: serializeSession(sessionSnapshot)!,
    team: serializeTeam(teamSnapshot)!,
  };
}

function requireHost(session: SessionDoc, uid: string) {
  if (session.hostUid !== uid) {
    throw new HttpsError(
      "permission-denied",
      "Only the host can perform this action.",
    );
  }
}

function nextTimestamp(seconds: number) {
  return Timestamp.fromMillis(Date.now() + seconds * 1000);
}

function getVoteSeconds(session: SessionDoc) {
  return session.settings?.voteSecs ?? VOTE_SECONDS;
}

function beginVotePhase(
  tx: FirebaseFirestore.Transaction,
  sessionRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  session: SessionDoc,
) {
  const endsAt = nextTimestamp(getVoteSeconds(session));
  tx.update(sessionRef, {
    status: "vote",
    endsAt,
    voteGroupIndex: 0,
  });
  return { ...session, status: "vote", endsAt, voteGroupIndex: 0 };
}

export async function startSession(sessionId: string, uid: string) {
  const sessionRef = sessionsCollection.doc(sessionId);

  await runTransactionWithRetry("startSession", async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as SessionDoc | undefined;
    if (!session) {
      throw new HttpsError("not-found", "Session not found.");
    }
    requireHost(session, uid);
    if (session.status !== "lobby") {
      throw new HttpsError("failed-precondition", "Session already started.");
    }

    const endsAt = nextTimestamp(session.settings.answerSecs);
    const now = Timestamp.now();

    const teamsSnap = await tx.get(sessionRef.collection("teams"));
    const teamIds = nonHostTeamIds(teamsSnap.docs);
    const promptPool = getPromptsForSession(session);
    const { round, promptDeck, promptCursor } = createRoundDefinition(
      teamIds,
      session.promptDeck,
      session.promptCursor,
      promptPool,
    );
    const rounds = [...(session.rounds ?? [])];
    rounds[0] = round;

    tx.update(sessionRef, {
      status: "answer",
      startedAt: now,
      endsAt,
      roundIndex: 0,
      rounds,
      promptDeck,
      promptCursor,
      voteGroupIndex: 0,
    });

    return {
      ...session,
      status: "answer",
      startedAt: now,
      endsAt,
      rounds,
      promptDeck,
      promptCursor,
      voteGroupIndex: 0,
    } satisfies SessionDoc;
  });

  const snapshot = await sessionRef.get();
  return serializeSession(snapshot)!;
}

interface AnswerRewardSummary {
  answerId: string;
  teamId: string | null;
  votes: number;
  groupId: string;
}
type WinningAnswerSummary = AnswerRewardSummary;

async function tallyVotes(
  tx: FirebaseFirestore.Transaction,
  sessionRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  roundIndex: number,
) {
  const answersQuery = sessionRef
    .collection("answers")
    .where("roundIndex", "==", roundIndex);
  const votesQuery = sessionRef
    .collection("votes")
    .where("roundIndex", "==", roundIndex);

  const answersSnapshot = await tx.get(answersQuery);
  const votesSnapshot = await tx.get(votesQuery);

  const voteCounts = new Map<string, number>();
  votesSnapshot.docs.forEach((voteDoc) => {
    const vote = voteDoc.data();
    if (!vote) return;
    voteCounts.set(vote.answerId, (voteCounts.get(vote.answerId) ?? 0) + 1);
  });

  const answersByGroup = new Map<string, AnswerRewardSummary[]>();
  const answerRewards: AnswerRewardSummary[] = [];
  answersSnapshot.docs.forEach((answerDoc) => {
    const data = answerDoc.data() as AnswerDoc | undefined;
    if (!data) return;
    const groupId = typeof data.groupId === "string" ? data.groupId : "g0";
    const votes = voteCounts.get(answerDoc.id) ?? 0;
    const summary: AnswerRewardSummary = {
      answerId: answerDoc.id,
      teamId: data.teamId ?? null,
      votes,
      groupId,
    };
    answerRewards.push(summary);
    const list = answersByGroup.get(groupId) ?? [];
    list.push(summary);
    answersByGroup.set(groupId, list);
  });

  const winningAnswers: WinningAnswerSummary[] = [];
  answersByGroup.forEach((summaries) => {
    let maxVotes = 0;
    const winners: WinningAnswerSummary[] = [];
    summaries.forEach((summary) => {
      if (summary.votes > maxVotes) {
        maxVotes = summary.votes;
        winners.length = 0;
        if (summary.votes > 0) {
          winners.push(summary);
        }
      } else if (summary.votes === maxVotes && summary.votes > 0) {
        winners.push(summary);
      }
    });
    winningAnswers.push(...winners);
  });

  return { voteCounts, winningAnswers, answerRewards };
}

async function awardWinners(
  tx: FirebaseFirestore.Transaction,
  sessionRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  winningAnswers: WinningAnswerSummary[],
  answerRewards: AnswerRewardSummary[],
) {
  const now = Timestamp.now();

  answerRewards.forEach(({ teamId, votes }) => {
    if (!teamId || votes <= 0) return;
    const teamRef = sessionRef.collection("teams").doc(teamId);
    tx.update(teamRef, {
      score: FieldValue.increment(votes * 100),
      lastActiveAt: now,
    });
  });

  if (!winningAnswers.length) return;
  winningAnswers.forEach(({ teamId }) => {
    if (!teamId) return;
    const teamRef = sessionRef.collection("teams").doc(teamId);
    tx.update(teamRef, {
      score: FieldValue.increment(1000),
      lastActiveAt: now,
    });
  });
}

async function advanceVotePhase(
  tx: FirebaseFirestore.Transaction,
  sessionRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  session: SessionDoc,
) {
  const currentRound = session.rounds?.[session.roundIndex];
  const groupCount = currentRound?.groups?.length ?? 0;
  const currentGroupIndex = Math.max(0, session.voteGroupIndex ?? 0);

  if (groupCount && currentGroupIndex < groupCount - 1) {
    const nextGroupIndex = currentGroupIndex + 1;
    const endsAt = nextTimestamp(getVoteSeconds(session));
    tx.update(sessionRef, {
      voteGroupIndex: nextGroupIndex,
      endsAt,
    });
    return { ...session, voteGroupIndex: nextGroupIndex, endsAt };
  }

  const { winningAnswers, answerRewards } = await tallyVotes(
    tx,
    sessionRef,
    session.roundIndex,
  );
  await awardWinners(tx, sessionRef, winningAnswers, answerRewards);
  const endsAt = nextTimestamp(RESULTS_SECONDS);
  tx.update(sessionRef, {
    status: "results",
    endsAt,
    voteGroupIndex: null,
  });
  return { ...session, status: "results", endsAt, voteGroupIndex: null };
}

export async function advanceSession(sessionId: string, uid: string) {
  const sessionRef = sessionsCollection.doc(sessionId);
  const result = await runTransactionWithRetry("advanceSession", async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as SessionDoc | undefined;
    if (!session) {
      throw new HttpsError("not-found", "Session not found.");
    }
    requireHost(session, uid);

    switch (session.status) {
      case "answer": {
        return beginVotePhase(tx, sessionRef, session);
      }
      case "vote": {
        return advanceVotePhase(tx, sessionRef, session);
      }
      case "results": {
        const isLastRound = session.roundIndex >= session.rounds.length - 1;
        if (isLastRound) {
          const endedAt = Timestamp.now();
          tx.update(sessionRef, {
            status: "ended",
            endsAt: endedAt,
            endedAt,
          });
          return { ...session, status: "ended", endedAt };
        }
        const nextRoundIndex = session.roundIndex + 1;
        const endsAt = nextTimestamp(session.settings.answerSecs);
        const teamsSnap = await tx.get(sessionRef.collection("teams"));
        const teamIds = nonHostTeamIds(teamsSnap.docs);
        const promptPool = getPromptsForSession(session);
        const { round, promptDeck, promptCursor } = createRoundDefinition(
          teamIds,
          session.promptDeck,
          session.promptCursor,
          promptPool,
        );
        const rounds = [...(session.rounds ?? [])];
        rounds[nextRoundIndex] = round;
        tx.update(sessionRef, {
          status: "answer",
          roundIndex: nextRoundIndex,
          endsAt,
          rounds,
          promptDeck,
          promptCursor,
          voteGroupIndex: 0,
        });
        return {
          ...session,
          status: "answer",
          roundIndex: nextRoundIndex,
          endsAt,
          rounds,
          promptDeck,
          promptCursor,
          voteGroupIndex: 0,
        };
      }
      default:
        throw new HttpsError(
          "failed-precondition",
          "No further actions for this phase.",
        );
    }
  });

  if (result.status === "ended") {
    await computeAnalytics(sessionId);
  }

  const snapshot = await sessionRef.get();
  return serializeSession(snapshot)!;
}

export async function endSession(sessionId: string, uid: string) {
  const sessionRef = sessionsCollection.doc(sessionId);
  await runTransactionWithRetry("endSession", async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as SessionDoc | undefined;
    if (!session) {
      throw new HttpsError("not-found", "Session not found.");
    }
    requireHost(session, uid);

    const endedAt = Timestamp.now();
    tx.update(sessionRef, {
      status: "ended",
      endsAt: endedAt,
      endedAt,
    });
  });

  await computeAnalytics(sessionId);
  const snapshot = await sessionRef.get();
  return serializeSession(snapshot)!;
}

export async function submitAnswerForTeam(
  sessionId: string,
  uid: string,
  text: string,
) {
  const sessionRef = sessionsCollection.doc(sessionId);
  await runTransactionWithRetry("submitAnswerForTeam", async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as SessionDoc | undefined;
    if (!session) {
      throw new HttpsError("not-found", "Session not found.");
    }
    if (session.status !== "answer") {
      throw new HttpsError("failed-precondition", "Answer phase is closed.");
    }
    if (session.endsAt && session.endsAt.toDate().getTime() < Date.now()) {
      throw new HttpsError("deadline-exceeded", "Answer window has ended.");
    }

    const teamRef = sessionRef.collection("teams").doc(uid);
    const teamSnap = await tx.get(teamRef);
    if (!teamSnap.exists) {
      throw new HttpsError(
        "permission-denied",
        "Join the session before answering.",
      );
    }
    const teamData = teamSnap.data() as TeamDoc | undefined;
    if (teamData?.isHost) {
      throw new HttpsError(
        "failed-precondition",
        "Hosts cannot submit answers.",
      );
    }
    const rounds = [...(session.rounds ?? [])];
    const currentRoundIndex = session.roundIndex;
    const currentRound = rounds[currentRoundIndex];
    let targetGroup = findGroupForTeam(currentRound, uid);
    let promptDeck = session.promptDeck;
    let promptCursor = session.promptCursor;
    const promptPool = getPromptsForSession(session);

    if (!targetGroup) {
      const updated = addTeamToRound(
        currentRound,
        uid,
        promptDeck,
        promptCursor,
        promptPool,
      );
      if (updated) {
        rounds[currentRoundIndex] = updated.round;
        promptDeck = updated.promptDeck;
        promptCursor = updated.promptCursor;
        targetGroup = findGroupForTeam(updated.round, uid);
        tx.update(sessionRef, {
          rounds,
          promptDeck,
          promptCursor,
        });
      }
    }

    if (!targetGroup) {
      throw new HttpsError(
        "failed-precondition",
        "Group assignment missing for this round.",
      );
    }

    const answerRef = sessionRef
      .collection("answers")
      .doc(`${uid}_${session.roundIndex}`);

    const now = Timestamp.now();
    const sanitized = cleanAnswer(text);

    tx.set(
      answerRef,
      {
        teamId: uid,
        roundIndex: session.roundIndex,
        groupId: targetGroup.id,
        text: sanitized,
        masked: sanitized !== text.trim(),
        createdAt: now,
      },
      { merge: true },
    );
    tx.update(teamRef, { lastActiveAt: now });
  });

  await maybeAutoAdvanceFromAnswerPhase(sessionId);
}

export async function submitVoteForTeam(
  sessionId: string,
  uid: string,
  answerId: string,
) {
  const sessionRef = sessionsCollection.doc(sessionId);
  await executeWithRetry("submitVoteForTeam", async () => {
    const sessionSnap = await sessionRef.get();
    const session = sessionSnap.data() as SessionDoc | undefined;
    if (!session) {
      throw new HttpsError("not-found", "Session not found.");
    }
    if (session.status !== "vote") {
      throw new HttpsError("failed-precondition", "Voting phase is closed.");
    }
    if (session.endsAt && session.endsAt.toDate().getTime() < Date.now()) {
      throw new HttpsError("deadline-exceeded", "Voting window has ended.");
    }

    const currentRound = session.rounds?.[session.roundIndex];
    const voteGroupIndex = Math.max(0, session.voteGroupIndex ?? 0);
    const targetGroup = currentRound?.groups?.[voteGroupIndex];
    if (!targetGroup) {
      throw new HttpsError(
        "failed-precondition",
        "Voting group is not available.",
      );
    }

    const teamRef = sessionRef.collection("teams").doc(uid);
    const teamSnap = await teamRef.get();
    if (!teamSnap.exists) {
      throw new HttpsError(
        "permission-denied",
        "Join the session before voting.",
      );
    }

    const answerRef = sessionRef.collection("answers").doc(answerId);
    const answerSnap = await answerRef.get();
    if (!answerSnap.exists) {
      throw new HttpsError("not-found", "Answer not found.");
    }

    const answerData = answerSnap.data() as AnswerDoc | undefined;
    if (!answerData || answerData.groupId !== targetGroup.id) {
      throw new HttpsError(
        "failed-precondition",
        "This answer is not part of the active voting group.",
      );
    }

    if (answerData.teamId === uid) {
      throw new HttpsError(
        "failed-precondition",
        "You can't vote for your own answer.",
      );
    }

    const now = Timestamp.now();
    const voteRef = sessionRef
      .collection("votes")
      .doc(`${uid}_${session.roundIndex}_${targetGroup.id}`);

    await Promise.all([
      voteRef.set(
        {
          voterId: uid,
          answerId,
          roundIndex: session.roundIndex,
          groupId: targetGroup.id,
          createdAt: now,
        },
        { merge: true },
      ),
      teamRef.update({ lastActiveAt: now }),
    ]);
  });

  await maybeAutoAdvanceFromVotePhase(sessionId);
}

async function getActiveTeamIds(
  tx: FirebaseFirestore.Transaction,
  sessionRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
) {
  const teamsSnap = await tx.get(sessionRef.collection("teams"));
  return new Set(nonHostTeamIds(teamsSnap.docs));
}

async function maybeAutoAdvanceFromAnswerPhase(sessionId: string) {
  const sessionRef = sessionsCollection.doc(sessionId);
  await runTransactionWithRetry("autoAdvanceAnswerPhase", async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as SessionDoc | undefined;
    if (!session || session.status !== "answer") {
      return;
    }

    const activeTeamIds = await getActiveTeamIds(tx, sessionRef);
    if (!activeTeamIds.size) {
      return;
    }

    const answersQuery = sessionRef
      .collection("answers")
      .where("roundIndex", "==", session.roundIndex);
    const answersSnapshot = await tx.get(answersQuery);
    const answeredIds = new Set(
      answersSnapshot.docs
        .map((doc) => (doc.data() as AnswerDoc | undefined)?.teamId)
        .filter((value): value is string => Boolean(value)),
    );

    const everyoneAnswered = [...activeTeamIds].every((id) =>
      answeredIds.has(id),
    );
    if (!everyoneAnswered) {
      return;
    }

    beginVotePhase(tx, sessionRef, session);
  });
}

async function maybeAutoAdvanceFromVotePhase(sessionId: string) {
  const sessionRef = sessionsCollection.doc(sessionId);
  await runTransactionWithRetry("autoAdvanceVotePhase", async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as SessionDoc | undefined;
    if (!session || session.status !== "vote") {
      return;
    }

    const currentRound = session.rounds?.[session.roundIndex];
    const voteGroupIndex = Math.max(0, session.voteGroupIndex ?? 0);
    const currentGroup = currentRound?.groups?.[voteGroupIndex];
    if (!currentGroup) {
      return;
    }

    const activeTeamIds = await getActiveTeamIds(tx, sessionRef);
    if (!activeTeamIds.size) {
      return;
    }

    const votesQuery = sessionRef
      .collection("votes")
      .where("roundIndex", "==", session.roundIndex)
      .where("groupId", "==", currentGroup.id);
    const votesSnapshot = await tx.get(votesQuery);
    const voterIds = new Set(
      votesSnapshot.docs
        .map((doc) => (doc.data() as VoteDoc | undefined)?.voterId)
        .filter((value): value is string => Boolean(value)),
    );

    const everyoneVoted = [...activeTeamIds].every((id) => voterIds.has(id));
    if (!everyoneVoted) {
      return;
    }

    await advanceVotePhase(tx, sessionRef, session);
  });
}

export async function kickTeam(
  sessionId: string,
  uid: string,
  targetTeamId: string,
) {
  const sessionRef = sessionsCollection.doc(sessionId);
  await runTransactionWithRetry("kickTeam", async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    const session = sessionSnap.data() as SessionDoc | undefined;
    if (!session) {
      throw new HttpsError("not-found", "Session not found.");
    }
    requireHost(session, uid);
    if (session.hostUid === targetTeamId) {
      throw new HttpsError("failed-precondition", "Cannot remove the host.");
    }
    const teamRef = sessionRef.collection("teams").doc(targetTeamId);
    const teamSnap = await tx.get(teamRef);
    if (!teamSnap.exists) {
      throw new HttpsError("not-found", "Team not found in this session.");
    }
    tx.delete(teamRef);
  });
}

async function computeAnalytics(sessionId: string) {
  const sessionRef = sessionsCollection.doc(sessionId);
  const sessionSnap = await sessionRef.get();
  const session = sessionSnap.data() as SessionDoc | undefined;
  if (!session) return;

  const teamsSnap = await sessionRef.collection("teams").get();
  const answersSnap = await sessionRef.collection("answers").get();
  const votesSnap = await sessionRef.collection("votes").get();

  const joinedCount = teamsSnap.size;
  const totalRounds = session.rounds.length;
  const totalVoteGroups = session.rounds.reduce((total, round) => {
    if (!round || !Array.isArray(round.groups)) return total;
    return total + Math.max(1, round.groups.length || 0);
  }, 0);
  const answerRate =
    joinedCount && totalRounds
      ? Math.min(1, answersSnap.size / (joinedCount * totalRounds))
      : 0;
  const voteDenominator = joinedCount * (totalVoteGroups || 1);
  const voteRate = voteDenominator ? votesSnap.size / voteDenominator : 0;
  const started = session.startedAt?.toDate().getTime() ?? Date.now();
  const ended = session.endedAt?.toDate().getTime() ?? Date.now();
  const durationSeconds = Math.max(0, Math.round((ended - started) / 1000));

  await firestore.collection(ANALYTICS_COLLECTION).doc(sessionId).set({
    joinedCount,
    answerRate,
    voteRate,
    duration: durationSeconds,
  });
}

export async function getAnalytics(sessionId: string) {
  const analyticsSnap = await firestore
    .collection(ANALYTICS_COLLECTION)
    .doc(sessionId)
    .get();
  if (!analyticsSnap.exists) {
    return null;
  }
  return analyticsSnap.data();
}
