import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import type {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { firestore, functions } from "../../firebase/app";
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  KickTeamRequest,
  SessionAnalyticsResponse,
  StartGameRequest,
  SubmitAnswerRequest,
  SubmitVoteRequest,
  TransitionPhaseRequest,
  SetPromptLibraryRequest,
  SetPromptLibraryResponse,
  Answer,
  Team,
  Session,
  SessionAnalytics,
  SessionStatus,
  Vote,
} from "../../shared/types";
import { toIsoDate } from "../../shared/utils/firestore";
import { prompts } from "../../shared/constants";

type SessionDocument = DocumentSnapshot<DocumentData>;
type CollectionDocument = QueryDocumentSnapshot<DocumentData>;

const sessionConverter = {
  fromFirestore: (snapshot: SessionDocument): Session | null => {
    const data = snapshot.data();
    if (!data) return null;
    return {
      id: snapshot.id,
      code: data.code,
      hostUid: data.hostUid,
      status: data.status as SessionStatus,
      roundIndex: data.roundIndex ?? 0,
      rounds: Array.isArray(data.rounds)
        ? data.rounds.map((round) => {
            if (
              round &&
              typeof round === "object" &&
              Array.isArray((round as { groups?: unknown }).groups)
            ) {
              const groups = (round as {
                groups: Array<{
                  id?: unknown;
                  prompt?: unknown;
                  teamIds?: unknown;
                }>;
                prompt?: unknown;
              }).groups.map((group, index) => ({
                id:
                  typeof group.id === "string"
                    ? group.id
                    : `g${index}`,
                prompt:
                  typeof group.prompt === "string"
                    ? group.prompt
                    : prompts[index % prompts.length] ?? "",
                teamIds: Array.isArray(group.teamIds)
                  ? group.teamIds.filter((value): value is string =>
                      typeof value === "string",
                    )
                  : [],
              }));
              return {
                prompt:
                  typeof (round as { prompt?: unknown }).prompt === "string"
                    ? (round as { prompt?: string }).prompt
                    : groups[0]?.prompt,
                groups,
              };
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
              };
            }
            if (typeof round === "string") {
              return { prompt: round, groups: [] };
            }
            return { prompt: undefined, groups: [] };
          })
        : [],
      voteGroupIndex:
        typeof data.voteGroupIndex === "number" ? data.voteGroupIndex : null,
      createdAt: toIsoDate(data.createdAt) ?? new Date().toISOString(),
      startedAt: toIsoDate(data.startedAt),
      endsAt: toIsoDate(data.endsAt),
      settings: data.settings ?? {
        answerSecs: 90,
        voteSecs: 90,
        resultsSecs: 12,
        maxTeams: 24,
      },
      venueName: data.venueName,
      promptLibraryId:
        typeof data.promptLibraryId === "string"
          ? data.promptLibraryId
          : undefined,
    };
  },
};

const teamConverter = {
  fromFirestore: (
    snapshot: CollectionDocument | SessionDocument,
  ): Team | null => {
    const data = snapshot.data();
    if (!data) return null;
    const team: Team = {
      id: snapshot.id,
      uid: data.uid,
      teamName: data.teamName,
      isHost: data.isHost ?? false,
      score: data.score ?? 0,
      joinedAt: toIsoDate(data.joinedAt) ?? new Date().toISOString(),
      lastActiveAt: toIsoDate(data.lastActiveAt),
      mascotId: typeof data.mascotId === "number" ? data.mascotId : undefined,
    };
    return team;
  },
};

const answerConverter = {
  fromFirestore: (snapshot: CollectionDocument): Answer | null => {
    const data = snapshot.data();
    if (!data) return null;
    return {
      id: snapshot.id,
      teamId: data.teamId,
      roundIndex: data.roundIndex,
      text: data.text,
      createdAt: toIsoDate(data.createdAt) ?? new Date().toISOString(),
      masked: data.masked ?? false,
      groupId: typeof data.groupId === "string" ? data.groupId : "g0",
    };
  },
};

const voteConverter = {
  fromFirestore: (snapshot: CollectionDocument): Vote | null => {
    const data = snapshot.data();
    if (!data) return null;
    return {
      id: snapshot.id,
      voterId: data.voterId,
      roundIndex: data.roundIndex,
      groupId: typeof data.groupId === "string" ? data.groupId : "g0",
      answerId: data.answerId,
      createdAt: toIsoDate(data.createdAt) ?? new Date().toISOString(),
    };
  },
};

export async function fetchSession(sessionId: string) {
  const ref = doc(firestore, "sessions", sessionId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return sessionConverter.fromFirestore(snapshot);
}

export function subscribeToSession(
  sessionId: string,
  callback: (session: Session | null) => void,
) {
  const ref = doc(firestore, "sessions", sessionId);
  return onSnapshot(ref, (snapshot) => {
    callback(sessionConverter.fromFirestore(snapshot));
  });
}

export function subscribeToTeams(
  sessionId: string,
  callback: (teams: Team[]) => void,
) {
  const ref = collection(firestore, "sessions", sessionId, "teams");
  const q = query(ref, orderBy("joinedAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs
        .map((docSnap) => teamConverter.fromFirestore(docSnap))
        .filter((team): team is Team => Boolean(team)),
    );
  });
}

export function subscribeToAnswers(
  sessionId: string,
  roundIndex: number,
  callback: (answers: Answer[]) => void,
) {
  const ref = collection(firestore, "sessions", sessionId, "answers");
  const q = query(
    ref,
    where("roundIndex", "==", roundIndex),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs
        .map((docSnap) => answerConverter.fromFirestore(docSnap))
        .filter((answer): answer is Answer => Boolean(answer)),
    );
  });
}

export function subscribeToVotes(
  sessionId: string,
  roundIndex: number,
  callback: (votes: Vote[]) => void,
) {
  const ref = collection(firestore, "sessions", sessionId, "votes");
  const q = query(
    ref,
    where("roundIndex", "==", roundIndex),
    orderBy("createdAt", "asc"),
    limit(200),
  );
  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs
        .map((docSnap) => voteConverter.fromFirestore(docSnap))
        .filter((vote): vote is Vote => Boolean(vote)),
    );
  });
}

export const createSession = async (payload: CreateSessionRequest) => {
  const callable = httpsCallable<CreateSessionRequest, CreateSessionResponse>(
    functions,
    "sessionsCreate",
  );
  const result = await callable(payload);
  return result.data;
};

export const setPromptLibrary = async (
  payload: SetPromptLibraryRequest,
) => {
  const callable = httpsCallable<
    SetPromptLibraryRequest,
    SetPromptLibraryResponse
  >(functions, "sessionsSetPromptLibrary");
  const result = await callable(payload);
  return result.data;
};

export const joinSession = async (payload: JoinSessionRequest) => {
  const callable = httpsCallable<JoinSessionRequest, JoinSessionResponse>(
    functions,
    "sessionsJoin",
  );
  const result = await callable(payload);
  return result.data;
};

export const startGame = async (payload: StartGameRequest) => {
  const callable = httpsCallable<StartGameRequest, { session: Session }>(
    functions,
    "sessionsStart",
  );
  const result = await callable(payload);
  return result.data;
};

export const advancePhase = async (payload: TransitionPhaseRequest) => {
  const callable = httpsCallable<TransitionPhaseRequest, { session: Session }>(
    functions,
    "sessionsAdvance",
  );
  const result = await callable(payload);
  return result.data;
};

export const submitAnswer = async (payload: SubmitAnswerRequest) => {
  const callable = httpsCallable<SubmitAnswerRequest, { success: boolean }>(
    functions,
    "answersSubmit",
  );
  const result = await callable(payload);
  return result.data;
};

export const submitVote = async (payload: SubmitVoteRequest) => {
  const callable = httpsCallable<SubmitVoteRequest, { success: boolean }>(
    functions,
    "votesSubmit",
  );
  const result = await callable(payload);
  return result.data;
};

export const kickPlayer = async (payload: KickTeamRequest) => {
  const callable = httpsCallable<KickTeamRequest, { success: boolean }>(
    functions,
    "sessionsKickPlayer",
  );
  const result = await callable(payload);
  return result.data;
};

export const endSession = async (payload: TransitionPhaseRequest) => {
  const callable = httpsCallable<TransitionPhaseRequest, { session: Session }>(
    functions,
    "sessionsEnd",
  );
  const result = await callable(payload);
  return result.data;
};

export const fetchAnalytics = async (
  sessionId: string,
): Promise<SessionAnalytics | null> => {
  const callable = httpsCallable<
    { sessionId: string },
    SessionAnalyticsResponse
  >(functions, "sessionsAnalytics");
  const result = await callable({ sessionId });
  return result.data.analytics;
};
