import {
  onCall,
  HttpsError,
  type CallableRequest,
} from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import {
  createSessionForHost,
  joinSessionForTeam,
  startSession,
  advanceSession,
  submitAnswerForTeam,
  submitVoteForTeam,
  endSession,
  kickTeam,
  getAnalytics,
  setSessionPromptLibrary,
} from "./sessionManager";
import { firestore } from "./firebase";
import { initializeGames } from "./games";
import { GameManager } from "./engine/GameManager";

// Initialize all games on module load
initializeGames();

type RequestData = Record<string, unknown>;

type Handler<TResponse> = (
  request: CallableRequest<RequestData>,
) => TResponse | Promise<TResponse>;

setGlobalOptions({ region: "us-central1" });

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return { value: error };
}

function dataKeys(data: unknown) {
  if (!data || typeof data !== "object") {
    return [] as string[];
  }
  try {
    return Object.keys(data as Record<string, unknown>);
  } catch {
    return [] as string[];
  }
}

function callableWithLogging<TResponse>(
  name: string,
  handler: Handler<TResponse>,
) {
  return onCall(async (request) => {
    const uid = request.auth?.uid;
    const typedRequest = request as CallableRequest<RequestData>;
    const keys = dataKeys(request.data);
    logger.info(`${name} invoked`, { uid: uid ?? null, dataKeys: keys });
    try {
      const result = await handler(typedRequest);
      logger.info(`${name} completed`, { uid: uid ?? null });
      return result;
    } catch (error) {
      if (error instanceof HttpsError) {
        logger.warn(`${name} failed`, {
          uid: uid ?? null,
          code: error.code,
          message: error.message,
        });
        throw error;
      }
      logger.error(`${name} crashed`, {
        uid: uid ?? null,
        error: serializeError(error),
      });
      throw new HttpsError("internal", "Unexpected server error.");
    }
  });
}

function requireString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${field} is required.`);
  }
  return value.trim();
}

export const sessionsCreate = callableWithLogging(
  "sessionsCreate",
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const teamName = requireString(request.data?.teamName, "teamName");
    const venueName =
      typeof request.data?.venueName === "string"
        ? request.data.venueName.trim()
        : undefined;
    const promptLibraryId =
      typeof request.data?.promptLibraryId === "string"
        ? request.data.promptLibraryId.trim()
        : undefined;

    return createSessionForHost(uid, teamName, venueName, promptLibraryId);
  },
);

export const sessionsJoin = callableWithLogging(
  "sessionsJoin",
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const code = requireString(request.data?.code, "code").toUpperCase();
    const teamName = requireString(request.data?.teamName, "teamName");

    return joinSessionForTeam(uid, code, teamName);
  },
);

export const sessionsStart = callableWithLogging(
  "sessionsStart",
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const sessionId = requireString(request.data?.sessionId, "sessionId");
    return { session: await startSession(sessionId, uid) };
  },
);

export const sessionsAdvance = callableWithLogging(
  "sessionsAdvance",
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const sessionId = requireString(request.data?.sessionId, "sessionId");
    return { session: await advanceSession(sessionId, uid) };
  },
);

export const answersSubmit = callableWithLogging(
  "answersSubmit",
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const sessionId = requireString(request.data?.sessionId, "sessionId");
    const text = requireString(request.data?.text, "text");
    await submitAnswerForTeam(sessionId, uid, text);
    return { success: true };
  },
);

export const votesSubmit = callableWithLogging(
  "votesSubmit",
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const sessionId = requireString(request.data?.sessionId, "sessionId");
    const answerId = requireString(request.data?.answerId, "answerId");
    await submitVoteForTeam(sessionId, uid, answerId);
    return { success: true };
  },
);

export const sessionsEnd = callableWithLogging(
  "sessionsEnd",
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const sessionId = requireString(request.data?.sessionId, "sessionId");
    return { session: await endSession(sessionId, uid) };
  },
);

export const sessionsKickPlayer = callableWithLogging(
  "sessionsKickPlayer",
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const sessionId = requireString(request.data?.sessionId, "sessionId");
    const teamId = requireString(request.data?.teamId, "teamId");
    await kickTeam(sessionId, uid, teamId);
    return { success: true };
  },
);

export const sessionsSetPromptLibrary = callableWithLogging(
  "sessionsSetPromptLibrary",
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const sessionId = requireString(request.data?.sessionId, "sessionId");
    const promptLibraryId = requireString(
      request.data?.promptLibraryId,
      "promptLibraryId",
    );
    return {
      session: await setSessionPromptLibrary(sessionId, uid, promptLibraryId),
    };
  },
);

export const sessionsAnalytics = callableWithLogging(
  "sessionsAnalytics",
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const sessionId = requireString(request.data?.sessionId, "sessionId");
    const sessionSnap = await firestore
      .collection("sessions")
      .doc(sessionId)
      .get();
    const session = sessionSnap.data() as { hostUid: string } | undefined;
    if (!session) {
      throw new HttpsError("not-found", "Session not found.");
    }
    if (session.hostUid !== uid) {
      throw new HttpsError(
        "permission-denied",
        "Only the host can view analytics.",
      );
    }
    const analytics = await getAnalytics(sessionId);
    return { analytics };
  },
);
