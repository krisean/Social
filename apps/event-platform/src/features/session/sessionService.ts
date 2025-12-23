import { supabase } from "../../supabase/client";
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
  Vote,
} from "../../shared/types";
import { prompts } from "../../shared/constants";

// Helper to convert Supabase session to our Session type
function mapSession(data: any): Session | null {
  if (!data) return null;
  
  return {
    id: data.id,
    code: data.code,
    hostUid: data.host_uid,
    status: data.status,
    roundIndex: data.round_index ?? 0,
    rounds: Array.isArray(data.rounds)
      ? data.rounds.map((round: any) => {
          if (round && typeof round === "object" && Array.isArray(round.groups)) {
            const groups = round.groups.map((group: any, index: number) => ({
              id: typeof group.id === "string" ? group.id : `g${index}`,
              prompt: typeof group.prompt === "string" ? group.prompt : prompts[index % prompts.length] ?? "",
              teamIds: Array.isArray(group.teamIds) ? group.teamIds.filter((value: any): value is string => typeof value === "string") : [],
            }));
            return {
              prompt: typeof round.prompt === "string" ? round.prompt : groups[0]?.prompt,
              groups,
            };
          }
          if (round && typeof round === "object" && "prompt" in round && typeof round.prompt === "string") {
            return { prompt: round.prompt, groups: [] };
          }
          if (typeof round === "string") {
            return { prompt: round, groups: [] };
          }
          return { prompt: undefined, groups: [] };
        })
      : [],
    voteGroupIndex: typeof data.vote_group_index === "number" ? data.vote_group_index : null,
    createdAt: data.created_at ?? new Date().toISOString(),
    startedAt: data.started_at,
    endsAt: data.ends_at,
    settings: data.settings ?? {
      answerSecs: 90,
      voteSecs: 90,
      resultsSecs: 12,
      maxTeams: 24,
    },
    venueName: data.venue_name,
    promptLibraryId: typeof data.prompt_library_id === "string" ? data.prompt_library_id : undefined,
  };
}

// Helper to convert Supabase team to our Team type
function mapTeam(data: any): Team | null {
  if (!data) return null;
  
  return {
    id: data.id,
    uid: data.uid,
    teamName: data.team_name,
    isHost: data.is_host ?? false,
    score: data.score ?? 0,
    joinedAt: data.joined_at ?? new Date().toISOString(),
    lastActiveAt: data.last_active_at,
    mascotId: typeof data.mascot_id === "number" ? data.mascot_id : undefined,
  };
}

// Helper to convert Supabase answer to our Answer type
function mapAnswer(data: any): Answer | null {
  if (!data) return null;
  
  return {
    id: data.id,
    teamId: data.team_id,
    roundIndex: data.round_index,
    text: data.text,
    createdAt: data.created_at ?? new Date().toISOString(),
    masked: data.masked ?? false,
    groupId: typeof data.group_id === "string" ? data.group_id : "g0",
  };
}

// Helper to convert Supabase vote to our Vote type
function mapVote(data: any): Vote | null {
  if (!data) return null;
  
  return {
    id: data.id,
    voterId: data.voter_id,
    roundIndex: data.round_index,
    groupId: typeof data.group_id === "string" ? data.group_id : "g0",
    answerId: data.answer_id,
    createdAt: data.created_at ?? new Date().toISOString(),
  };
}

export async function fetchSession(sessionId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  
  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }
  
  return mapSession(data);
}

export function subscribeToSession(
  sessionId: string,
  callback: (session: Session | null) => void,
) {
  // Initial fetch
  fetchSession(sessionId).then(callback);
  
  // Subscribe to changes
  const channel = supabase
    .channel(`session:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "sessions",
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        callback(mapSession(payload.new));
      }
    )
    .subscribe();
  
  return () => {
    channel.unsubscribe();
  };
}

export function subscribeToTeams(
  sessionId: string,
  callback: (teams: Team[]) => void,
) {
  // Initial fetch
  supabase
    .from("teams")
    .select("*")
    .eq("session_id", sessionId)
    .order("joined_at", { ascending: true })
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching teams:", error);
        callback([]);
      } else {
        callback(data?.map(mapTeam).filter((team): team is Team => Boolean(team)) ?? []);
      }
    });
  
  // Subscribe to changes
  const channel = supabase
    .channel(`teams:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "teams",
        filter: `session_id=eq.${sessionId}`,
      },
      () => {
        // Refetch all teams on any change
        supabase
          .from("teams")
          .select("*")
          .eq("session_id", sessionId)
          .order("joined_at", { ascending: true })
          .then(({ data, error }) => {
            if (!error && data) {
              callback(data.map(mapTeam).filter((team): team is Team => Boolean(team)));
            }
          });
      }
    )
    .subscribe();
  
  return () => {
    channel.unsubscribe();
  };
}

export function subscribeToAnswers(
  sessionId: string,
  roundIndex: number,
  callback: (answers: Answer[]) => void,
) {
  // Initial fetch
  supabase
    .from("answers")
    .select("*")
    .eq("session_id", sessionId)
    .eq("round_index", roundIndex)
    .order("created_at", { ascending: true })
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching answers:", error);
        callback([]);
      } else {
        callback(data?.map(mapAnswer).filter((answer): answer is Answer => Boolean(answer)) ?? []);
      }
    });
  
  // Subscribe to changes
  const channel = supabase
    .channel(`answers:${sessionId}:${roundIndex}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "answers",
        filter: `session_id=eq.${sessionId}`,
      },
      () => {
        // Refetch answers for this round
        supabase
          .from("answers")
          .select("*")
          .eq("session_id", sessionId)
          .eq("round_index", roundIndex)
          .order("created_at", { ascending: true })
          .then(({ data, error }) => {
            if (!error && data) {
              callback(data.map(mapAnswer).filter((answer): answer is Answer => Boolean(answer)));
            }
          });
      }
    )
    .subscribe();
  
  return () => {
    channel.unsubscribe();
  };
}

export function subscribeToVotes(
  sessionId: string,
  roundIndex: number,
  callback: (votes: Vote[]) => void,
) {
  // Initial fetch
  supabase
    .from("votes")
    .select("*")
    .eq("session_id", sessionId)
    .eq("round_index", roundIndex)
    .order("created_at", { ascending: true })
    .limit(200)
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching votes:", error);
        callback([]);
      } else {
        callback(data?.map(mapVote).filter((vote): vote is Vote => Boolean(vote)) ?? []);
      }
    });
  
  // Subscribe to changes
  const channel = supabase
    .channel(`votes:${sessionId}:${roundIndex}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "votes",
        filter: `session_id=eq.${sessionId}`,
      },
      () => {
        // Refetch votes for this round
        supabase
          .from("votes")
          .select("*")
          .eq("session_id", sessionId)
          .eq("round_index", roundIndex)
          .order("created_at", { ascending: true })
          .limit(200)
          .then(({ data, error }) => {
            if (!error && data) {
              callback(data.map(mapVote).filter((vote): vote is Vote => Boolean(vote)));
            }
          });
      }
    )
    .subscribe();
  
  return () => {
    channel.unsubscribe();
  };
}

// Edge Function calls (replacing Firebase Functions)
export const createSession = async (payload: CreateSessionRequest) => {
  const { data, error } = await supabase.functions.invoke<CreateSessionResponse>(
    "sessions-create",
    { body: payload }
  );
  if (error) throw error;
  if (!data) throw new Error("No data returned from createSession");
  return data;
};

export const setPromptLibrary = async (payload: SetPromptLibraryRequest) => {
  const { data, error } = await supabase.functions.invoke<SetPromptLibraryResponse>(
    "sessions-set-prompt-library",
    { body: payload }
  );
  if (error) throw error;
  return data;
};

export const joinSession = async (payload: JoinSessionRequest) => {
  const { data, error } = await supabase.functions.invoke<JoinSessionResponse>(
    "sessions-join",
    { body: payload }
  );
  if (error) throw error;
  return data;
};

export const startGame = async (payload: StartGameRequest) => {
  const { data, error } = await supabase.functions.invoke<{ session: Session }>(
    "sessions-start",
    { body: payload }
  );
  if (error) throw error;
  return data;
};

export const advancePhase = async (payload: TransitionPhaseRequest) => {
  const { data, error } = await supabase.functions.invoke<{ session: Session }>(
    "sessions-advance",
    { body: payload }
  );
  if (error) throw error;
  return data;
};

export const submitAnswer = async (payload: SubmitAnswerRequest) => {
  const { data, error } = await supabase.functions.invoke<{ success: boolean }>(
    "answers-submit",
    { body: payload }
  );
  if (error) throw error;
  return data;
};

export const submitVote = async (payload: SubmitVoteRequest) => {
  const { data, error } = await supabase.functions.invoke<{ success: boolean }>(
    "votes-submit",
    { body: payload }
  );
  if (error) throw error;
  return data;
};

export const kickPlayer = async (payload: KickTeamRequest) => {
  const { data, error } = await supabase.functions.invoke<{ success: boolean }>(
    "sessions-kick-player",
    { body: payload }
  );
  if (error) throw error;
  return data;
};

export const endSession = async (payload: TransitionPhaseRequest) => {
  const { data, error } = await supabase.functions.invoke<{ session: Session }>(
    "sessions-end",
    { body: payload }
  );
  if (error) throw error;
  return data;
};

export const fetchAnalytics = async (
  sessionId: string,
): Promise<SessionAnalytics | null> => {
  const { data, error } = await supabase.functions.invoke<SessionAnalyticsResponse>(
    "sessions-analytics",
    { body: { sessionId } }
  );
  if (error) throw error;
  if (!data) return null;
  return data.analytics;
};
