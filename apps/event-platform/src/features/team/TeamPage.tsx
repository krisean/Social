import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { BackgroundAnimation } from "../../components/BackgroundAnimation";
import { HowToPlayModal } from "../howToPlay/HowToPlayModal";
import { useToast } from "../../shared/hooks/useToast";
import {
  joinSession,
  submitAnswer,
  submitVote,
} from "../session/sessionService";
import { useAnswers, useTeams, useSession, useVotes } from "../session/hooks";
import { useTeamSession } from "./useTeamSession";
import { useSelfieCamera } from "./useSelfieCamera";
import { useAuth } from "../../shared/providers/AuthContext";
import { useCurrentPhase } from "../../shared/providers/CurrentPhaseContext";
import { maskProfanity, containsProfanity } from "../../shared/utils/profanity";
import { getErrorMessage } from "../../shared/utils/errors";
import type { Session, Team, Answer, Vote } from "../../shared/types";
import { prompts, formatCode } from "../../shared/constants";
import { joinSchema, answerSchema } from "../../shared/schemas";
import {
  JoinForm,
  LobbyPhase,
  AnswerPhase,
  VotePhase,
  ResultsPhase,
  EndedPhase,
} from "./Phases";

const DUPLICATE_TEAM_NAME_CODE = "functions/already-exists";
const DUPLICATE_TEAM_NAME_MESSAGE =
  "That team name is already taken. Try another one.";
const HAS_MANUALLY_LEFT_KEY = "sidebets_has_manually_left";
const KICKED_FROM_SESSIONS_KEY = "sidebets_kicked_from_sessions";

interface KickedSession {
  sessionId: string;
  code: string;
}

function getKickedFromSessions(): Map<string, KickedSession> {
  if (typeof window === "undefined") return new Map();
  try {
    const stored = window.sessionStorage.getItem(KICKED_FROM_SESSIONS_KEY);
    if (!stored) return new Map();
    const sessions = JSON.parse(stored) as KickedSession[];
    const map = new Map<string, KickedSession>();
    sessions.forEach((session) => {
      map.set(session.sessionId, session);
      map.set(session.code, session); // Also index by code for quick lookup
    });
    return map;
  } catch {
    return new Map();
  }
}

function addKickedSession(sessionId: string, code: string): void {
  if (typeof window === "undefined") return;
  try {
    const kicked = getKickedFromSessions();
    const session: KickedSession = { sessionId, code };
    kicked.set(sessionId, session);
    kicked.set(code, session); // Also index by code
    // Store as array of unique sessions (by sessionId)
    const sessionsArray = Array.from(
      new Map(
        Array.from(kicked.values()).map((s) => [s.sessionId, s]),
      ).values(),
    );
    window.sessionStorage.setItem(
      KICKED_FROM_SESSIONS_KEY,
      JSON.stringify(sessionsArray),
    );
  } catch {
    // Ignore sessionStorage errors
  }
}

function removeKickedSession(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    const kicked = getKickedFromSessions();
    const session = kicked.get(sessionId);
    if (session) {
      kicked.delete(sessionId);
      kicked.delete(session.code);
      // Store as array of unique sessions
      const sessionsArray = Array.from(
        new Map(
          Array.from(kicked.values()).map((s) => [s.sessionId, s]),
        ).values(),
      );
      window.sessionStorage.setItem(
        KICKED_FROM_SESSIONS_KEY,
        JSON.stringify(sessionsArray),
      );
    }
  } catch {
    // Ignore sessionStorage errors
  }
}

function isKickedFromCode(code: string): boolean {
  const kicked = getKickedFromSessions();
  return kicked.has(code.toUpperCase());
}

function isDuplicateTeamNameError(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") {
      return code === DUPLICATE_TEAM_NAME_CODE;
    }
  }
  return false;
}
export function TeamPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { teamSession, setTeamSession, clearTeamSession } = useTeamSession();
  const { setCurrentPhase } = useCurrentPhase();

  const [sessionId, setSessionId] = useState<string | null>(
    teamSession?.sessionId ?? null,
  );
  const [joinForm, setJoinForm] = useState({
    code: teamSession?.code ?? "",
    teamName: teamSession?.teamName ?? "",
  });
  const [joinErrors, setJoinErrors] = useState<Record<string, string>>({});
  const [isJoining, setIsJoining] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [howToPlayInitialPhase, setHowToPlayInitialPhase] = useState<Session["status"] | null>(null);

  // Track if user manually left to prevent auto-rejoin
  const [hasManuallyLeft, setHasManuallyLeft] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(HAS_MANUALLY_LEFT_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [finalSession, setFinalSession] = useState<Session | null>(null);
  const [finalTeams, setFinalTeams] = useState<Team[]>([]);
  const [showKickedModal, setShowKickedModal] = useState(false);
  const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);
  const scoreboardRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState(Date.now());
  const lastInitializedRoundRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, []);

  const queryCodeParam = searchParams.get("code");
  const queryTeamNameParam = searchParams.get("teamName");
  const allowAutoJoin =
    (searchParams.get("auto") ?? "true").toLowerCase() !== "false";

  const formattedQueryCode = useMemo(
    () => (queryCodeParam ? formatCode(queryCodeParam) : ""),
    [queryCodeParam],
  );

  const queryTeamName = useMemo(
    () => (queryTeamNameParam ?? "").trim(),
    [queryTeamNameParam],
  );

  const { session, hasSnapshot: sessionSnapshotReady } = useSession(
    sessionId ?? undefined,
  );
  const teams = useTeams(sessionId ?? undefined);
  const answers = useAnswers(sessionId ?? undefined, session?.roundIndex);
  const votes = useVotes(sessionId ?? undefined, session?.roundIndex);

  const attemptJoin = useCallback(
    async (
      values: { code: string; teamName: string },
      options: {
        showFieldErrors?: boolean;
        notifySuccess?: boolean;
        notifyError?: boolean;
      } = {},
    ) => {
      const {
        showFieldErrors = true,
        notifySuccess = true,
        notifyError = true,
      } = options;

      if (containsProfanity(values.teamName)) {
        toast({
          title: "Inappropriate language detected",
          description: "Pick a different team name.",
          variant: "error",
        });
        return false;
      }

      const parsed = joinSchema.safeParse({
        code: formatCode(values.code),
        teamName: values.teamName,
      });

      if (!parsed.success) {
        if (showFieldErrors) {
          const fieldErrors: Record<string, string> = {};
          parsed.error.issues.forEach((issue) => {
            const path = issue.path[0];
            if (typeof path === "string") {
              fieldErrors[path] = issue.message;
            }
          });
          setJoinErrors(fieldErrors);
        }
        return false;
      }

      setJoinErrors({});

      // Check if user was kicked from this session BEFORE attempting to join
      const sessionCode = parsed.data.code.toUpperCase();
      if (isKickedFromCode(sessionCode)) {
        // They were kicked from this session, prevent the join attempt
        if (notifyError) {
          toast({
            title: "Cannot rejoin session",
            description:
              "You were removed from this session and cannot rejoin.",
            variant: "error",
          });
        }
        return false;
      }

      setIsJoining(true);
      try {
        const response = await joinSession({
          code: sessionCode,
          teamName: maskProfanity(parsed.data.teamName),
        });

        // Double-check after join (safety check in case code changed or something)
        const kickedFromSessions = getKickedFromSessions();
        if (response && kickedFromSessions.has(response.sessionId)) {
          // They were kicked from this session, prevent the join
          // Clear everything immediately to prevent them from appearing in lobby
          setSessionId(null);
          clearTeamSession();
          removeKickedSession(response.sessionId); // Clean up
          if (notifyError) {
            toast({
              title: "Cannot rejoin session",
              description:
                "You were removed from this session and cannot rejoin.",
              variant: "error",
            });
          }
          return false;
        }

        // Remove from kicked sessions if they successfully join (means it's a different/new session)
        if (response) {
          removeKickedSession(response.sessionId);

          setSessionId(response.sessionId);
          setTeamSession({
            sessionId: response.sessionId,
            teamId: response.team.id,
            teamName: response.team.teamName,
            code: response.session.code,
          });
          setJoinForm({
            code: response.session.code,
            teamName: response.team.teamName,
          });
          setAnswerText("");

          // Reset hasManuallyLeft flag when user successfully joins
          setHasManuallyLeft(false);
        }
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.removeItem(HAS_MANUALLY_LEFT_KEY);
          } catch {
            // Ignore sessionStorage errors
          }
        }

        if (notifySuccess) {
          toast({ title: "You joined the lobby", variant: "success" });
        }
        return true;
      } catch (error: unknown) {
        const duplicateTeamName = isDuplicateTeamNameError(error);
        if (duplicateTeamName && showFieldErrors) {
          setJoinErrors((prev) => ({
            ...prev,
            teamName: DUPLICATE_TEAM_NAME_MESSAGE,
          }));
        }
        if (notifyError) {
          toast({
            title: "Could not join session",
            description: duplicateTeamName
              ? DUPLICATE_TEAM_NAME_MESSAGE
              : getErrorMessage(error, "Check the code and try again."),
            variant: "error",
          });
        }
        return false;
      } finally {
        setIsJoining(false);
      }
    },
    [clearTeamSession, setTeamSession, toast],
  );

  const activeTeams = session ? teams : finalTeams;

  const currentTeam = useMemo(() => {
    if (!activeTeams.length) return null;
    if (teamSession?.teamId) {
      return activeTeams.find((team) => team.id === teamSession.teamId) ?? null;
    }
    return activeTeams.find((team) => team.uid === user?.id) ?? null;
  }, [activeTeams, teamSession?.teamId, user?.id]);

  // Detect when player is kicked (currentTeam becomes null while session exists and other teams are still present)
  useEffect(() => {
    if (
      session &&
      teamSession &&
      sessionSnapshotReady &&
      currentTeam === null &&
      activeTeams.length > 0 &&
      !showKickedModal
    ) {
      // Player was kicked - they're not in the teams list anymore but other teams exist
      // Mark this session as one they were kicked from (store both sessionId and code)
      if (session.id && session.code) {
        addKickedSession(session.id, session.code);
      }
      setShowKickedModal(true);
    }
  }, [
    session,
    teamSession,
    sessionSnapshotReady,
    currentTeam,
    activeTeams,
    showKickedModal,
  ]);

  // Safety check: If they somehow rejoin a session they were kicked from, immediately clear it
  useEffect(() => {
    if (!session || !sessionSnapshotReady) return;
    const kickedFromSessions = getKickedFromSessions();
    if (kickedFromSessions.has(session.id) && currentTeam === null) {
      // They were kicked and are not in teams - already handled by kicked modal
      return;
    }
    if (kickedFromSessions.has(session.id) && currentTeam) {
      // They somehow rejoined - clear immediately
      setSessionId(null);
      clearTeamSession();
      toast({
        title: "Cannot rejoin session",
        description: "You were removed from this session and cannot rejoin.",
        variant: "error",
      });
    }
  }, [session, sessionSnapshotReady, currentTeam, clearTeamSession, toast]);

  const currentRound = session
    ? (session.rounds[session.roundIndex] ?? null)
    : null;
  const roundGroups = useMemo(() => currentRound?.groups ?? [], [currentRound]);
  const totalGroups = roundGroups.length;
  const activeGroupIndex =
    session?.status === "vote" && totalGroups
      ? Math.min(totalGroups - 1, Math.max(0, session.voteGroupIndex ?? 0))
      : 0;
  const activeGroup =
    session?.status === "vote" && totalGroups
      ? (roundGroups[activeGroupIndex] ?? null)
      : null;

  const myGroup = useMemo(() => {
    if (!currentTeam || !roundGroups.length) return null;
    return (
      roundGroups.find((group) => group.teamIds.includes(currentTeam.id)) ??
      null
    );
  }, [roundGroups, currentTeam]);

  const myAnswer = useMemo(
    () =>
      currentTeam
        ? (answers.find((answer) => answer.teamId === currentTeam.id) ?? null)
        : null,
    [answers, currentTeam],
  );

  const voteCounts = useMemo(() => {
    const counts = new Map<string, number>();
    votes.forEach((vote) => {
      counts.set(vote.answerId, (counts.get(vote.answerId) ?? 0) + 1);
    });
    return counts;
  }, [votes]);

  const answersByGroup = useMemo(() => {
    const map = new Map<string, (Answer & { teamName: string })[]>();
    answers.forEach((answer) => {
      const team = teams.find((t) => t.id === answer.teamId);
      const enriched = { ...answer, teamName: team?.teamName ?? "Unknown" };
      const list = map.get(answer.groupId) ?? [];
      list.push(enriched);
      map.set(answer.groupId, list);
    });
    return map;
  }, [answers, teams]);

  const myVotesByGroup = useMemo(() => {
    const map = new Map<string, Vote>();
    if (!currentTeam) {
      return map;
    }
    votes.forEach((vote) => {
      if (vote.voterId === currentTeam.id) {
        map.set(vote.groupId, vote);
      }
    });
    return map;
  }, [votes, currentTeam]);

  const myActiveVote = useMemo(() => {
    if (!activeGroup) return null;
    return myVotesByGroup.get(activeGroup.id) ?? null;
  }, [myVotesByGroup, activeGroup]);

  const activeGroupAnswers = useMemo(() => {
    if (session?.status === "vote") {
      if (!activeGroup) return [];
      return answers.filter((answer) => answer.groupId === activeGroup.id);
    }
    if (myGroup) {
      return answers.filter((answer) => answer.groupId === myGroup.id);
    }
    return answers;
  }, [answers, session?.status, activeGroup, myGroup]);

  const isVotingOnOwnGroup = useMemo(() => {
    return session?.status === "vote" && 
           activeGroup !== null && 
           myGroup !== null && 
           activeGroup.id === myGroup.id;
  }, [session?.status, activeGroup, myGroup]);

  const voteSummaryActive = useMemo(() => {
    if (session?.status !== "vote" || !session?.endsAt) return false;
    const endsAtTime = new Date(session.endsAt).getTime();
    return now >= endsAtTime;
  }, [session?.status, session?.endsAt, now]);

  const activeGroupWinnerIds = useMemo(() => {
    if (!activeGroup) return new Set<string>();
    const winners = new Set<string>();
    let maxVotes = 0;
    activeGroupAnswers.forEach((answer) => {
      const votesForAnswer = voteCounts.get(answer.id) ?? 0;
      if (votesForAnswer > maxVotes) {
        maxVotes = votesForAnswer;
        winners.clear();
        if (votesForAnswer > 0) {
          winners.add(answer.id);
        }
      } else if (votesForAnswer === maxVotes && votesForAnswer > 0) {
        winners.add(answer.id);
      }
    });
    return winners;
  }, [activeGroup, activeGroupAnswers, voteCounts]);

  const votesForMe = useMemo(() => {
    if (!myAnswer) return 0;
    return voteCounts.get(myAnswer.id) ?? 0;
  }, [myAnswer, voteCounts]);

  const roundSummaries = useMemo(() => {
    return roundGroups.map((group, index) => {
      const groupAnswers = answersByGroup.get(group.id) ?? [];
      const sorted = [...groupAnswers].sort(
        (a, b) => (voteCounts.get(b.id) ?? 0) - (voteCounts.get(a.id) ?? 0),
      );
      const bestVotes = sorted.length ? (voteCounts.get(sorted[0].id) ?? 0) : 0;
      const winners =
        bestVotes > 0
          ? sorted.filter(
              (answer) => (voteCounts.get(answer.id) ?? 0) === bestVotes,
            )
          : [];
      return {
        group,
        index,
        answers: sorted,
        winners,
      };
    });
  }, [roundGroups, answersByGroup, voteCounts]);

  const myRoundPoints = useMemo(() => {
    if (!myAnswer) return 0;
    const basePoints = (voteCounts.get(myAnswer.id) ?? 0) * 100;
    const wonGroup = roundSummaries.some((summary) =>
      summary.winners.some((winner) => winner.id === myAnswer.id),
    );
    return basePoints + (wonGroup ? 1000 : 0);
  }, [myAnswer, voteCounts, roundSummaries]);

  const finalLeaderboard = useMemo(() => {
    const baseTeams = finalSession ? finalTeams : activeTeams;
    const sorted = [...baseTeams].sort((a, b) => b.score - a.score);
    let lastScore: number | null = null;
    let lastRank = 0;
    return sorted.map((team, index) => {
      let rank = index + 1;
      if (lastScore !== null && team.score === lastScore) {
        rank = lastRank;
      } else {
        lastScore = team.score;
        lastRank = rank;
      }
      return { ...team, rank };
    });
  }, [finalSession, finalTeams, activeTeams]);

  // Camera selfie feature
  const endedSession = session?.status === "ended" ? session : finalSession;
  const {
    isTakingSelfie,
    showSelfieModal,
    selfieImage,
    setSelfieImage,
    videoRef,
    canvasRef,
    startSelfie,
    captureSelfie,
    cancelSelfie,
    downloadSelfie,
    shareSelfie,
  } = useSelfieCamera({
    currentTeam,
    finalLeaderboard,
    venueName: endedSession?.venueName,
  });

  const scrollToMyRank = useCallback(() => {
    if (!currentTeam) return;
    const container = scoreboardRef.current;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(
      `[data-team-id="${currentTeam.id}"]`,
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("ring-2", "ring-brand-primary");
      window.setTimeout(() => {
        target.classList.remove("ring-2", "ring-brand-primary");
      }, 1500);
    }
  }, [currentTeam]);

  const totalSeconds = useMemo(() => {
    if (!session) return 30;
    if (session.status === "vote") {
      return session.settings.voteSecs ?? 90;
    }
    if (session.status === "results") {
      return 12;
    }
    return session.settings.answerSecs ?? 90;
  }, [session]);

  useEffect(() => {
    if (!formattedQueryCode) return;
    setJoinForm((prev) =>
      prev.code === formattedQueryCode
        ? prev
        : { ...prev, code: formattedQueryCode },
    );
  }, [formattedQueryCode]);

  useEffect(() => {
    if (!queryTeamName) return;
    setJoinForm((prev) =>
      prev.teamName === queryTeamName
        ? prev
        : { ...prev, teamName: queryTeamName },
    );
  }, [queryTeamName]);

  useEffect(() => {
    // Only reset autoJoinAttempted if user hasn't manually left
    if (!hasManuallyLeft) {
      setAutoJoinAttempted(false);
    }
  }, [formattedQueryCode, hasManuallyLeft]);

  useEffect(() => {
    if (!allowAutoJoin) return;
    if (autoJoinAttempted) return;
    if (hasManuallyLeft) return; // Prevent auto-join if user manually left
    if (!formattedQueryCode || formattedQueryCode.length !== 6) return;
    if (sessionId) return;
    if (isJoining) return;
    if (authLoading) return;

    const fallbackTeamName = queryTeamName || teamSession?.teamName || "";
    if (!fallbackTeamName) return;

    setAutoJoinAttempted(true);
    void attemptJoin(
      { code: formattedQueryCode, teamName: fallbackTeamName },
      { showFieldErrors: false, notifySuccess: false },
    );
  }, [
    allowAutoJoin,
    autoJoinAttempted,
    hasManuallyLeft,
    authLoading,
    attemptJoin,
    formattedQueryCode,
    isJoining,
    teamSession?.teamName,
    queryTeamName,
    sessionId,
  ]);

  useEffect(() => {
    // Don't restore sessionId if user manually left
    if (hasManuallyLeft) return;
    if (!sessionId && session?.id && session.status !== "ended") {
      setSessionId(session.id);
    }
  }, [session?.id, session?.status, sessionId, hasManuallyLeft]);

  useEffect(() => {
    // Don't save session to localStorage if user manually left
    if (hasManuallyLeft) return;
    if (session && currentTeam) {
      setTeamSession({
        sessionId: session.id,
        teamId: currentTeam.id,
        teamName: currentTeam.teamName,
        code: session.code,
      });
    }
  }, [session, currentTeam, setTeamSession, hasManuallyLeft]);

  // Initialize answerText with existing answer when available
  useEffect(() => {
    if (!session || session.status !== "answer") {
      return;
    }
    const currentRoundIndex = session.roundIndex;
    const lastRound = lastInitializedRoundRef.current;

    // If round changed, always clear answer text first
    if (lastRound !== null && lastRound !== currentRoundIndex) {
      lastInitializedRoundRef.current = currentRoundIndex;
      setAnswerText("");
    }

    // Initialize for the first time
    if (lastRound === null) {
      lastInitializedRoundRef.current = currentRoundIndex;
    }

    // Initialize with answer for current round if it exists and input is empty
    // Only initialize if myAnswer exists and matches current round
    if (
      myAnswer &&
      myAnswer.roundIndex === currentRoundIndex &&
      !answerText.trim()
    ) {
      setAnswerText(myAnswer.text);
    }
  }, [session?.status, session?.roundIndex, myAnswer?.id, myAnswer?.roundIndex, myAnswer?.text]);

  useEffect(() => {
    if (session?.status === "ended") {
      setAnswerText("");
      // Show session ended modal if not already shown
      if (!showSessionEndedModal) {
        setShowSessionEndedModal(true);
      }
    }
  }, [session?.status, showSessionEndedModal]);

  useEffect(() => {
    if (!session) return;
    if (session.status !== "ended") return;
    if (finalSession) return;
    setFinalSession(session);
    setFinalTeams(teams);
    setAutoJoinAttempted(true);
    setSessionId(null);
  }, [session, teams, finalSession]);

  // Update current phase in context for HowToPlayModal
  useEffect(() => {
    setCurrentPhase(session?.status ?? null);
  }, [session?.status, setCurrentPhase]);

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = {
      code: String(formData.get("code") ?? ""),
      teamName: String(formData.get("teamName") ?? ""),
    };

    await attemptJoin(values);
  };

  const handleSubmitAnswer = async () => {
    if (!session || !sessionId) return;
    if (containsProfanity(answerText)) {
      toast({
        title: "Inappropriate language detected",
        description: "Keep it classy! That answer won't be sent.",
        variant: "error",
      });
      return;
    }

    const parsed = answerSchema.safeParse(answerText);
    if (!parsed.success) {
      toast({
        title: parsed.error.issues[0]?.message ?? "Invalid answer",
        variant: "error",
      });
      return;
    }
    setIsSubmittingAnswer(true);
    const isUpdating = !!myAnswer;
    try {
      await submitAnswer({
        sessionId: session.id,
        text: maskProfanity(parsed.data),
      });
      // Keep the answer text after submission so user can see what was submitted
      // It will be updated when myAnswer updates from Firestore
      toast({
        title: isUpdating ? "Answer updated" : "Answer locked in",
        variant: "success",
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      const isProfanity =
        message.toLowerCase().includes("inappropriate language") ||
        message.toLowerCase().includes("profanity");
      toast({
        title: isProfanity
          ? "Inappropriate language detected"
          : "Could not submit answer",
        description: isProfanity
          ? "Keep it classy! That answer was filtered."
          : message || "Try again before time runs out.",
        variant: "error",
      });
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleVote = async (answerId: string) => {
    if (!session || !sessionId) return;
    if (!activeGroup) return;
    if (myActiveVote?.answerId === answerId) return;
    
    // Prevent voting if voting on own group
    if (isVotingOnOwnGroup) {
      toast({
        title: "Cannot vote",
        description: "You cannot vote in your own group.",
        variant: "error",
      });
      return;
    }
    
    setIsSubmittingVote(true);
    try {
      await submitVote({ sessionId: session.id, answerId });
      toast({ title: "Vote counted", variant: "success" });
    } catch (error: unknown) {
      toast({
        title: "Could not vote",
        description: getErrorMessage(error, "Please try again quickly."),
        variant: "error",
      });
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleOpenHowToPlay = useCallback(() => {
    // Capture the phase at the moment the button is clicked
    setHowToPlayInitialPhase(session?.status ?? null);
    setShowHowToPlay(true);
  }, [session?.status]);

  const handleLeave = useCallback(() => {
    // Set flag to prevent auto-rejoin
    setHasManuallyLeft(true);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(HAS_MANUALLY_LEFT_KEY, "true");
      } catch {
        // Ignore sessionStorage errors
      }
    }

    // Clear URL search parameters
    setSearchParams({}, { replace: true });

    // Clear session state
    clearTeamSession();
    setSessionId(null);
    setAnswerText("");
    setJoinForm({ code: "", teamName: "" });
    setAutoJoinAttempted(true);
    setFinalSession(null);
    setFinalTeams([]);
  }, [clearTeamSession, setSearchParams]);

  useEffect(() => {
    if (!session && sessionId && sessionSnapshotReady) {
      handleLeave();
    }
  }, [session, sessionId, sessionSnapshotReady, handleLeave]);

  useEffect(() => {
    if (myAnswer && !answerText) return;
    if (!session || session.status !== "answer") return;
    if (!answerText.trim()) return;
    if (myAnswer) return;

    const endTime = session.endsAt ? new Date(session.endsAt).getTime() : null;
    if (!endTime) return;

    const timeout = window.setTimeout(
      () => {
        void handleSubmitAnswer();
      },
      Math.max(endTime - Date.now(), 0),
    );

    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.endsAt, session?.status, answerText, myAnswer]);

  const renderGameContent = () => {
    if (!session) return null;
    switch (session.status) {
      case "lobby":
        return <LobbyPhase teams={teams} />;
      case "answer":
        return (
          <AnswerPhase
            session={session}
            myGroup={myGroup}
            roundGroups={roundGroups}
            prompts={prompts}
            myAnswer={myAnswer}
            answerText={answerText}
            setAnswerText={setAnswerText}
            handleSubmitAnswer={handleSubmitAnswer}
            isSubmittingAnswer={isSubmittingAnswer}
            totalSeconds={totalSeconds}
          />
        );
      case "vote":
        return (
          <VotePhase
            session={session}
            activeGroup={activeGroup}
            roundGroups={roundGroups}
            activeGroupIndex={activeGroupIndex}
            totalGroups={totalGroups}
            prompts={prompts}
            activeGroupAnswers={activeGroupAnswers}
            voteCounts={voteCounts}
            myActiveVote={myActiveVote}
            activeGroupWinnerIds={activeGroupWinnerIds}
            handleVote={handleVote}
            isSubmittingVote={isSubmittingVote}
            voteSummaryActive={voteSummaryActive}
            teams={teams}
            totalSeconds={totalSeconds}
            currentTeam={currentTeam}
            isVotingOnOwnGroup={isVotingOnOwnGroup}
          />
        );
      case "results":
        return (
          <ResultsPhase
            session={session}
            finalLeaderboard={finalLeaderboard}
            currentTeam={currentTeam}
            votesForMe={votesForMe}
            myRoundPoints={myRoundPoints}
          />
        );
      case "ended":
        return (
          <EndedPhase
            currentTeam={currentTeam}
            finalLeaderboard={finalLeaderboard}
            scrollToMyRank={scrollToMyRank}
            selfieImage={selfieImage}
            startSelfie={startSelfie}
            shareSelfie={shareSelfie}
            downloadSelfie={downloadSelfie}
            setSelfieImage={setSelfieImage}
            isTakingSelfie={isTakingSelfie}
            handleLeave={handleLeave}
            scoreboardRef={scoreboardRef}
          />
        );
      default:
        return null;
    }
  };

  let mainContent;
  if (endedSession && !session) {
    mainContent = (
      <EndedPhase
        currentTeam={currentTeam}
        finalLeaderboard={finalLeaderboard}
        scrollToMyRank={scrollToMyRank}
        selfieImage={selfieImage}
        startSelfie={startSelfie}
        shareSelfie={shareSelfie}
        downloadSelfie={downloadSelfie}
        setSelfieImage={setSelfieImage}
        isTakingSelfie={isTakingSelfie}
        handleLeave={handleLeave}
        scoreboardRef={scoreboardRef}
      />
    );
  } else if (!sessionId) {
    mainContent = (
      <JoinForm
        joinForm={joinForm}
        joinErrors={joinErrors}
        isJoining={isJoining}
        handleJoin={handleJoin}
        setJoinForm={setJoinForm}
      />
    );
  } else if (!sessionSnapshotReady) {
    mainContent = (
      <Card className="space-y-3 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Connecting...</h2>
        <p className="text-sm text-slate-600">Pulling the latest game state.</p>
      </Card>
    );
  } else if (session) {
    mainContent = renderGameContent();
  } else {
    mainContent = endedSession ? (
      <EndedPhase
        currentTeam={currentTeam}
        finalLeaderboard={finalLeaderboard}
        scrollToMyRank={scrollToMyRank}
        selfieImage={selfieImage}
        startSelfie={startSelfie}
        shareSelfie={shareSelfie}
        downloadSelfie={downloadSelfie}
        setSelfieImage={setSelfieImage}
        isTakingSelfie={isTakingSelfie}
        handleLeave={handleLeave}
        scoreboardRef={scoreboardRef}
      />
    ) : (
      <JoinForm
        joinForm={joinForm}
        joinErrors={joinErrors}
        isJoining={isJoining}
        handleJoin={handleJoin}
        setJoinForm={setJoinForm}
      />
    );
  }

  const showingJoinScreen = !sessionId || (!session && !endedSession);
  const leaderboardActive =
    session?.status === "results" ||
    session?.status === "ended" ||
    (!session && !!endedSession);
  const phasesWithBackground = new Set([
    "lobby",
    "answer",
    "vote",
    "results",
    "ended",
  ]);
  const showBackground =
    showingJoinScreen ||
    (session?.status ? phasesWithBackground.has(session.status) : false) ||
    leaderboardActive;

  const mainClassName = showBackground
    ? "relative z-10 flex min-h-screen items-center justify-center px-3 py-10 sm:px-4"
    : "relative min-h-screen bg-white px-4 py-8";

  const contentWrapperClassName = showBackground
    ? "relative z-10 mx-auto flex w-[88vw] max-w-sm flex-col gap-4 sm:w-full sm:max-w-lg sm:gap-6"
    : "mx-auto flex w-full max-w-lg flex-col gap-6";

  return (
    <>
      <BackgroundAnimation show={showBackground} />
      <div className="pointer-events-auto fixed right-4 top-4 z-50">
        <button
          type="button"
          onClick={handleOpenHowToPlay}
          className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-brand-primary hover:bg-brand-light hover:text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
          <span>How to play</span>
        </button>
      </div>
      <main className={mainClassName}>
        <div className={contentWrapperClassName}>
          {!session ? <div className="p-4"></div> : null}
          {mainContent}

          {session ? (
            <Button variant="ghost" onClick={handleLeave} fullWidth>
              Leave session
            </Button>
          ) : null}
        </div>

        {/* Selfie Modal */}
        {showSelfieModal && (
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="relative w-full h-full max-w-md mx-auto flex flex-col items-center justify-center">
              {/* Camera Feed - Constrained to 9:16 aspect ratio for Instagram/TikTok */}
              <div className="relative w-full max-w-[375px] aspect-[9/16] overflow-hidden">
                {isTakingSelfie ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-lg">Starting camera...</p>
                      <p className="text-sm text-slate-300 mt-2">
                        Please allow camera access
                      </p>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Face Guide Circle with Crown */}
                {!isTakingSelfie && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="absolute flex flex-col items-center"
                      style={{ transform: "translateY(-20%)" }}
                    >
                      {/* Crown above the circle - angled to look worn */}
                      <div
                        className="text-[180px] mb-0 drop-shadow-2xl animate-pulse leading-none inline-block"
                        style={{
                          transform:
                            "translateY(20%) rotate(8deg) scale(1.5, 1)",
                          transformOrigin: "center",
                        }}
                      >
                        👑
                      </div>
                      {/* Face guide circle - bigger */}
                      <div className="w-80 h-80 rounded-full border-4 border-white/70 border-dashed flex items-center justify-center">
                        <span className="text-white/60 text-xs text-center px-2">
                          Position your face here
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay on camera feed */}
                {!isTakingSelfie && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
                    <div className="text-center text-white">
                      <p className="text-2xl font-bold mb-2">
                        Congrats {currentTeam?.teamName}!
                      </p>
                      <p className="text-lg mb-1">
                        You placed #
                        {finalLeaderboard.find((t) => t.id === currentTeam?.id)
                          ?.rank || "?"}{" "}
                        with {currentTeam?.score} points!
                      </p>
                      {endedSession?.venueName && (
                        <p className="text-sm mb-1">
                          At {endedSession.venueName}
                        </p>
                      )}
                      <p className="text-sm font-bold text-blue-300">
                        Powered by Bar_Scores
                      </p>
                    </div>
                  </div>
                )}

                {/* Top controls */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <Button
                    onClick={cancelSelfie}
                    variant="ghost"
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    ✕ Cancel
                  </Button>
                  {!isTakingSelfie && (
                    <div className="text-white text-sm">
                      Position yourself in frame
                    </div>
                  )}
                </div>

                {/* Bottom capture button */}
                {!isTakingSelfie && (
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                    <Button
                      onClick={captureSelfie}
                      className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 text-black shadow-lg"
                    >
                      📸
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hidden canvas for selfie processing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <Modal
          open={showKickedModal}
          onClose={() => {
            // Redirect when modal is closed (X button or ESC)
            setShowKickedModal(false);
            clearTeamSession();
            setSessionId(null);
            navigate("/");
          }}
          title="You've been removed"
          footer={
            <Button
              onClick={() => {
                setShowKickedModal(false);
                clearTeamSession();
                setSessionId(null);
                navigate("/");
              }}
              fullWidth
            >
              OK
            </Button>
          }
        >
          <p className="text-sm text-slate-600">
            The host has removed you from this session. You'll be redirected to
            the entry page.
          </p>
        </Modal>
        <Modal
          open={showSessionEndedModal}
          onClose={() => {
            // Redirect when modal is closed (X button or ESC)
            setShowSessionEndedModal(false);
            clearTeamSession();
            setSessionId(null);
            navigate("/");
          }}
          title="Session Ended"
          footer={
            <Button
              onClick={() => {
                setShowSessionEndedModal(false);
                clearTeamSession();
                setSessionId(null);
                {
                  /* navigate("/"); */
                }
              }}
              fullWidth
            >
              OK
            </Button>
          }
        >
          <p className="text-sm text-slate-600">
            The host has ended this session.
          </p>
        </Modal>
      </main>

      <HowToPlayModal
        open={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
        initialPhase={howToPlayInitialPhase}
      />
    </>
  );
}

export default TeamPage;
