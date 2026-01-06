import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, QRCodeBlock, Card, Modal, useToast } from "@social/ui";
import { useAuth } from "../../shared/providers/AuthContext";
import { useCurrentPhase } from "../../shared/providers/CurrentPhaseContext";
import { useTheme } from "../../shared/providers/ThemeProvider";
import { useHostSession } from "./useHostSession";
import {
  advancePhase,
  fetchAnalytics,
  setPromptLibrary,
} from "../session/sessionService";
import { useAnswers, useTeams, useSession, useVotes } from "../session/hooks";
import type { Session, Answer } from "../../shared/types";
import type { SessionAnalytics } from "../../shared/types";
import { getErrorMessage } from "../../shared/utils/errors";
import {
  phaseCopy,
  actionLabel,
  prompts,
  promptLibraries,
  defaultPromptLibrary,
  defaultPromptLibraryId,
} from "../../shared/constants";
import { leaderboardFromTeams } from "../../shared/utils/leaderboard";
import {
  LobbyPhase,
  AnswerPhase,
  VotePhase,
  ResultsPhase,
  EndedPhase,
  CreateSessionModal,
} from "./Phases";
import {
  handleCopyLink,
  handleCreateSession,
  handleEndSession,
  handleHostVote,
  handleKickTeam,
  handlePrimaryAction,
} from "./Handlers";
import { PromptLibrarySelector } from "./components/PromptLibrarySelector";
import type {
  PromptLibraryId,
  PromptLibrary,
} from "../../shared/promptLibraries";

export function HostPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const { isDark } = useTheme();
  const {
    sessionId: storedSessionId,
    code: storedCode,
    setHostSession,
    clearHostSession,
  } = useHostSession();
  const { setCurrentPhase } = useCurrentPhase();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState<string | null>(storedSessionId);
  const [showCreateModal, setShowCreateModal] = useState(!storedSessionId);
  const [isCreating, setIsCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [createForm, setCreateForm] = useState({ teamName: "", venueName: "" });
  const [showPromptLibraryModal, setShowPromptLibraryModal] = useState(false);
  const [isUpdatingPromptLibrary, setIsUpdatingPromptLibrary] = useState(false);
  const [hostGroupVotes, setHostGroupVotes] = useState<Record<string, string>>(
    {},
  );
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [kickingTeamId, setKickingTeamId] = useState<string | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const isPerformingActionRef = useRef(false);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);
  const autoAdvanceRetryRef = useRef<number | null>(null);
  const autoAdvanceKeyRef = useRef<string | null>(null);
  const VOTE_SUMMARY_MS = 7000;

  const canCreateSession = !authLoading && Boolean(user);

  const { session, hasSnapshot: sessionSnapshotReady } = useSession(
    sessionId ?? undefined,
  );
  const teams = useTeams(sessionId ?? undefined);
  const answers = useAnswers(sessionId ?? undefined, session?.roundIndex);
  const votes = useVotes(sessionId ?? undefined, session?.roundIndex);

  // Set sessionRef.current to latest session for auto advance actions.
  useEffect(() => {
    sessionRef.current = session ?? null;
  }, [session]);

  // Helper to keep isPerformingAction state and ref synchronized
  const triggerPerformingAction = (value: boolean) => {
    isPerformingActionRef.current = value;
    setIsPerformingAction(value);
  };

  const leaderboard = useMemo(() => leaderboardFromTeams(teams), [teams]);

  const promptLibraryMap = useMemo(() => {
    const map = new Map<PromptLibraryId, PromptLibrary>();
    promptLibraries.forEach((library) => {
      map.set(library.id, library);
    });
    return map;
  }, []);

  const selectedPromptLibraryId = session?.promptLibraryId ?? defaultPromptLibraryId;
  const currentPromptLibrary = useMemo(
    () =>
      promptLibraryMap.get(selectedPromptLibraryId) ?? defaultPromptLibrary,
    [selectedPromptLibraryId, promptLibraryMap],
  );

  // Validate session existence and setup on load/update
  useEffect(() => {
    if (!session && sessionId && sessionSnapshotReady) {
      addToast(
        "Session not found. It may have expired. Create a new one to continue hosting.",
        "error"
      );
      clearHostSession();
      setSessionId(null);
      setShowCreateModal(true);
      return;
    }

    if (!session) {
      return;
    }

    if (session.status === "ended") {
      clearHostSession();
      return;
    }

    if (!sessionId || session.id !== sessionId) {
      setSessionId(session.id);
    }

    if (session.code) {
      setHostSession({ sessionId: session.id, code: session.code });
    }
  }, [
    session,
    sessionId,
    sessionSnapshotReady,
    setHostSession,
    clearHostSession,
    addToast,
  ]);

  // Update current phase in context for HowToPlayModal
  useEffect(() => {
    setCurrentPhase(session?.status ?? null);
  }, [session?.status, setCurrentPhase]);

  // Fetch analytics after session ends
  useEffect(() => {
    if (session?.status === "ended" && session.id) {
      fetchAnalytics(session.id)
        .then((data) => setAnalytics(data))
        .catch(() => {});
    }
  }, [session?.status, session?.id]);

  useEffect(() => {
    if (session?.status !== "lobby") {
      setShowPromptLibraryModal(false);
    }
  }, [session?.status]);

  // Clear host votes when leaving vote phase
  useEffect(() => {
    if (session?.status !== "vote") {
      setHostGroupVotes({});
    }
  }, [session?.status]);

  // Auto advance phase timer and retries
  useEffect(() => {
    if (!session) return;
    if (!session.endsAt) {
      autoAdvanceKeyRef.current = null;
      return;
    }
    if (!["answer", "vote", "results"].includes(session.status)) {
      autoAdvanceKeyRef.current = null;
      return;
    }

    const key = `${session.id}:${session.status}:${session.endsAt}`;
    autoAdvanceKeyRef.current = key;

    const endsAtTime = new Date(session.endsAt).getTime();
    if (Number.isNaN(endsAtTime)) {
      return;
    }

    const summaryDelay = session.status === "vote" ? VOTE_SUMMARY_MS : 0;
    const initialDelay =
      Math.max(endsAtTime - Date.now(), 0) + summaryDelay + 100;

    if (autoAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(autoAdvanceTimeoutRef.current);
    }
    if (autoAdvanceRetryRef.current !== null) {
      window.clearTimeout(autoAdvanceRetryRef.current);
    }

    const attemptAdvance = () => {
      const current = sessionRef.current;
      if (!current) return;
      const currentKey = `${current.id}:${current.status}:${current.endsAt ?? ""}`;
      if (currentKey !== key) return;
      if (!["answer", "vote", "results"].includes(current.status)) return;

      if (isPerformingActionRef.current) {
        autoAdvanceRetryRef.current = window.setTimeout(attemptAdvance, 500);
        return;
      }

      isPerformingActionRef.current = true;
      setIsPerformingAction(true);
      advancePhase({ sessionId: current.id })
        .catch((error: unknown) => {
          addToast(
            getErrorMessage(
              error,
              "Auto-advance failed. Please tap the phase button manually."
            ),
            "error"
          );
        })
        .finally(() => {
          isPerformingActionRef.current = false;
          setIsPerformingAction(false);
        });
    };

    autoAdvanceTimeoutRef.current = window.setTimeout(
      attemptAdvance,
      initialDelay,
    );

    return () => {
      if (autoAdvanceTimeoutRef.current !== null) {
        window.clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      if (autoAdvanceRetryRef.current !== null) {
        window.clearTimeout(autoAdvanceRetryRef.current);
        autoAdvanceRetryRef.current = null;
      }
    };
  }, [session, addToast]);

  const inviteLink = useMemo(() => {
    if (!session?.code) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    if (!origin) return "";
    return `${origin}/play?code=${session.code}`;
  }, [session?.code]);

  // Map team IDs to team names for lookup
  const teamLookup = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((team) => {
      map.set(team.id, team.teamName);
    });
    return map;
  }, [teams]);

  // Current round and groups for phases
  const currentRound = session
    ? (session.rounds[session.roundIndex] ?? null)
    : null;
  const roundGroups = useMemo(() => currentRound?.groups ?? [], [currentRound]);
  const totalGroups = roundGroups.length;

  // Vote Phase group info
  const activeGroupIndex =
    session?.status === "vote" && totalGroups
      ? Math.min(totalGroups - 1, Math.max(0, session.voteGroupIndex ?? 0))
      : 0;

  const activeGroup =
    session?.status === "vote" && totalGroups
      ? (roundGroups[activeGroupIndex] ?? null)
      : null;

  // Vote counts by answerId
  const voteCounts = useMemo(() => {
    const counts = new Map<string, number>();
    votes.forEach((vote) => {
      counts.set(vote.answerId, (counts.get(vote.answerId) ?? 0) + 1);
    });
    return counts;
  }, [votes]);

  // Group answers mapping
  const answersByGroup = useMemo(() => {
    const map = new Map<string, Answer[]>();
    answers.forEach((answer) => {
      const list = map.get(answer.groupId) ?? [];
      list.push(answer);
      map.set(answer.groupId, list);
    });
    return map;
  }, [answers]);

  // Answers for active voting group or all answers if not voting
  const activeGroupAnswers = useMemo(() => {
    if (session?.status === "vote" && activeGroup) {
      return answers.filter((answer) => answer.groupId === activeGroup.id);
    }
    return answers;
  }, [answers, session?.status, activeGroup]);

  // Summaries for all groups of current round with winners identified
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

  // Host's current vote for the active group
  const activeGroupVote = useMemo(() => {
    if (!activeGroup) return null;
    return hostGroupVotes[activeGroup.id] ?? null;
  }, [hostGroupVotes, activeGroup]);

  // Instantiate handlers with current dependencies
  const createSessionHandler = handleCreateSession({
    user,
    authLoading,
    toast: addToast,
    setCreateErrors,
    isCreating, // Added this prop
    setIsCreating,
    setSessionId,
    setHostSession,
    setShowCreateModal,
    onSessionCreated: () => setShowPromptLibraryModal(true),
  });

  const primaryActionHandler = handlePrimaryAction({
    session,
    isPerformingAction,
    triggerPerformingAction,
    toast: addToast,
    setShowCreateModal,
  });

  const confirmEndSessionHandler = handleEndSession({
    session,
    isEndingSession,
    setIsEndingSession,
    toast: addToast,
    setAnalytics,
    setHostGroupVotes,
  });

  const showEndSessionModalHandler = () => {
    setShowEndSessionModal(true);
  };

  const kickTeamHandler = handleKickTeam({
    session,
    toast: addToast,
    setKickingTeamId,
  });

  const copyLinkHandler = handleCopyLink({ toast: addToast });

  const handleReturnHome = useCallback(() => {
    clearHostSession();
    setSessionId(null);
    setAnalytics(null);
    setHostGroupVotes({});
    setShowCreateModal(false);
    setShowPromptLibraryModal(false);
    setShowEndSessionModal(false);
    navigate("/");
  }, [
    clearHostSession,
    navigate,
    setAnalytics,
    setHostGroupVotes,
    setSessionId,
  ]);

  const handlePromptLibrarySelect = useCallback(
    (libraryId: PromptLibraryId) => {
      if (!session || session.status !== "lobby") return;
      if (isUpdatingPromptLibrary) return;
      if (libraryId === (session.promptLibraryId ?? defaultPromptLibraryId)) {
        return;
      }
      setIsUpdatingPromptLibrary(true);
      setPromptLibrary({ sessionId: session.id, promptLibraryId: libraryId })
        .then(() => {
          addToast(
            "Prompt library updated! New prompts will be used next round.",
            "success"
          );
        })
        .catch((error: unknown) => {
          addToast(
            getErrorMessage(error, "Could not update prompts. Please try again."),
            "error"
          );
        })
        .finally(() => {
          setIsUpdatingPromptLibrary(false);
        });
    },
    [session, isUpdatingPromptLibrary, addToast],
  );

  const hostVoteHandler = handleHostVote({
    session,
    activeGroup,
    activeGroupVote,
    toast: addToast,
    setIsSubmittingVote,
    setHostGroupVotes,
    isSubmittingVote,
  });

  const promptLibraryCard =
    session && session.status === "lobby" ? (
      <Card className="flex flex-col gap-4" isDark={isDark}>
        <div className={`flex flex-col gap-1 ${!isDark ? 'text-slate-700' : 'text-cyan-100'}`}>
          <span className={`text-xs font-semibold uppercase tracking-wide ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
            Prompt library
          </span>
          <p className={`text-lg font-bold ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
            {currentPromptLibrary.emoji} {currentPromptLibrary.name}
          </p>
          <p className={`text-sm ${!isDark ? 'text-slate-500' : 'text-cyan-300'}`}>
            {currentPromptLibrary.description}
          </p>
        </div>
        {currentPromptLibrary.prompts.length > 0 && (
          <div className="space-y-2">
            <p className={`text-xs font-semibold uppercase tracking-wide ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
              Sample prompts
            </p>
            <div className="space-y-2">
              {currentPromptLibrary.prompts.slice(0, 3).map((prompt, index) => (
                <div
                  key={index}
                  className={`rounded-lg border px-3 py-2 text-sm ${!isDark ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-slate-600 bg-slate-700 text-cyan-100'}`}
                >
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-xs ${!isDark ? 'text-slate-500' : 'text-cyan-300'}`}>
            Pick a deck for tonight before you start the first round.
          </p>
          <Button
            variant="secondary"
            onClick={() => setShowPromptLibraryModal(true)}
            disabled={isUpdatingPromptLibrary}
          >
            {session.promptLibraryId ? "Change" : "Choose"} prompts
          </Button>
        </div>
      </Card>
    ) : null;

  // Render phase-specific content
  const renderPhaseContent = () => {
    if (!session) {
      return (
        <Card className="min-h-[360px]" isDark={isDark}>
          <p className={`text-lg ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
            Create a session to unlock the host controls.
          </p>
        </Card>
      );
    }

    switch (session.status) {
      case "lobby":
        return (
          <LobbyPhase
            inviteLink={inviteLink}
            storedCode={storedCode}
            sessionId={sessionId}
            handleCopyLink={copyLinkHandler}
            sessionCode={session.code}
            teams={teams}
          />
        );

      case "answer":
        return (
          <AnswerPhase
            sessionRoundIndex={session.roundIndex}
            totalGroups={totalGroups}
            roundGroups={roundGroups}
            teamLookup={teamLookup}
            sessionEndsAt={session.endsAt}
            answerSecs={session.settings.answerSecs ?? 90}
          />
        );

      case "vote":
        return (
          <VotePhase
            totalGroups={totalGroups}
            activeGroupIndex={activeGroupIndex}
            activeGroup={activeGroup}
            roundGroups={roundGroups}
            activeGroupAnswers={activeGroupAnswers}
            voteCounts={voteCounts}
            activeGroupVote={activeGroupVote}
            handleHostVote={hostVoteHandler}
            isSubmittingVote={isSubmittingVote}
            roundSummaries={roundSummaries}
            sessionEndsAt={session.endsAt}
            voteSecs={session.settings.voteSecs ?? 90}
            prompts={prompts}
            sessionRoundIndex={session.roundIndex}
          />
        );

      case "results":
        return (
          <ResultsPhase
            sessionRoundIndex={session.roundIndex}
            roundSummaries={roundSummaries}
            voteCounts={voteCounts}
            sessionEndsAt={session.endsAt}
            resultsSecs={session.settings.resultsSecs ?? 12}
          />
        );

      case "ended":
        return <EndedPhase leaderboard={leaderboard} analytics={analytics} />;

      default:
        return null;
    }
  };

  // Presenter view button if session exists
  const presenterButton = session ? (
    <Button
      variant="ghost"
      onClick={() =>
        window.open(`/presenter/${session.id}`, "_blank", "noopener")
      }
    >
      Presenter View
    </Button>
  ) : null;

  return (
    <main className={`min-h-screen px-4 py-8 ${!isDark ? 'bg-amber-50' : 'bg-slate-950'}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between" isDark={isDark}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Link to="/" className={`text-sm font-semibold ${!isDark ? 'text-brand-primary' : 'text-cyan-400 hover:text-cyan-300'}`}>
                ← Back
              </Link>
              {presenterButton}
            </div>
            <div>
              <h1 className={`text-3xl font-black ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
                Host Console
              </h1>
              {session ? (
                <p className={`text-sm ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
                  {phaseCopy[session.status]}
                </p>
              ) : (
                <p className={`text-sm ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
                  Create a game room when you're ready to host.
                </p>
              )}
            </div>
          </div>
          <div className={`flex flex-col items-center gap-2 rounded-2xl px-6 py-4 border ${!isDark ? 'bg-slate-100 border-slate-200' : 'bg-cyan-900/30 border-cyan-400/50'}`}>
            <span className={`text-xs uppercase tracking-wider ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
              Room code
            </span>
            <span className={`text-3xl font-black tracking-widest ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
              {session?.code ?? storedCode ?? "---"}
            </span>
            {session ? (
              <span className={`text-xs ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                {teams.length} team{teams.length === 1 ? "" : "s"} online
              </span>
            ) : null}
          </div>
        </Card>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)]">
          <div className="flex flex-col gap-6">
            {promptLibraryCard}
            {renderPhaseContent()}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={primaryActionHandler}
                disabled={
                  session
                    ? isPerformingAction ||
                      isUpdatingPromptLibrary ||
                      session.status === "ended" ||
                      (session.status === "lobby" && teams.length === 0)
                    : false
                }
                isLoading={session ? isPerformingAction : false}
              >
                {session ? actionLabel[session.status] : "Create game"}
              </Button>
              {session ? (
                session.status === "ended" ? (
                  <Button variant="secondary" onClick={handleReturnHome}>
                    Return home
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={showEndSessionModalHandler}
                    disabled={isEndingSession}
                  >
                    End session
                  </Button>
                )
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateModal(true)}
                >
                  New session
                </Button>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            {session ? (
              <QRCodeBlock value={inviteLink || ""} caption="Scan to join" isDark={isDark} />
            ) : (
              <div className={`rounded-3xl p-6 text-center text-sm shadow-lg ${!isDark ? 'bg-white text-slate-500 shadow-slate-300/40' : 'bg-slate-800 text-cyan-300 shadow-fuchsia-500/20'}`}>
                Start a session to generate a QR code for your guests.
              </div>
            )}
            {session ? (
              <div className={`space-y-4 rounded-3xl p-5 shadow-lg ${!isDark ? 'bg-white shadow-slate-300/40' : 'bg-slate-800 shadow-fuchsia-500/20'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
                    Lobby ({teams.length})
                  </h3>
                  <span className={`text-xs ${!isDark ? 'text-slate-500' : 'text-cyan-300'}`}>
                    Max {session.settings.maxTeams}
                  </span>
                </div>
                <ul className="space-y-2">
                  {teams.map((team) => (
                    <li
                      key={team.id}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 ${!isDark ? 'bg-slate-100' : 'bg-slate-700'}`}
                    >
                      <span className={`font-medium ${!isDark ? 'text-slate-800' : 'text-cyan-100'}`}>
                        {team.teamName}
                        {team.isHost ? " (Host)" : ""}
                      </span>
                      {!team.isHost ? (
                        <Button
                          variant="ghost"
                          onClick={() => kickTeamHandler(team.id)}
                          className="text-sm text-rose-600"
                          disabled={kickingTeamId !== null}
                          isLoading={kickingTeamId === team.id}
                        >
                          {kickingTeamId === team.id ? "Kicking..." : "Kick"}
                        </Button>
                      ) : null}
                    </li>
                  ))}
                  {!teams.length ? (
                    <li className={`rounded-2xl px-4 py-3 text-sm ${!isDark ? 'bg-slate-100 text-slate-500' : 'bg-slate-700 text-cyan-300'}`}>
                      Teams will appear here as they join.
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </aside>
        </section>
      </div>

      <CreateSessionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        createForm={createForm}
        setCreateForm={setCreateForm}
        createErrors={createErrors}
        isCreating={isCreating}
        canCreateSession={canCreateSession}
        onSubmit={createSessionHandler}
      />
      <Modal
        open={showPromptLibraryModal && Boolean(session)}
        onClose={() => setShowPromptLibraryModal(false)}
        title="Choose a prompt library"
        isDark={isDark}
        footer={
          <Button variant="ghost" onClick={() => setShowPromptLibraryModal(false)}>
            Done
          </Button>
        }
      >
        {session ? (
          <div className="space-y-3">
            <PromptLibrarySelector
              selectedId={selectedPromptLibraryId}
              onSelect={handlePromptLibrarySelect}
              disabled={isUpdatingPromptLibrary || session.status !== "lobby"}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You can switch decks any time before the first round begins.
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Start a session to choose your prompt library.
          </p>
        )}
      </Modal>
      <Modal
        open={showEndSessionModal}
        onClose={() => setShowEndSessionModal(false)}
        title="End Session"
        isDark={isDark}
        footer={
          <div className="flex w-full items-center justify-between">
            <Button variant="ghost" onClick={() => setShowEndSessionModal(false)}>
              Back
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setShowEndSessionModal(false);
                confirmEndSessionHandler();
              }}
              disabled={isEndingSession}
              isLoading={isEndingSession}
            >
              Confirm
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to end this session? This action cannot be undone
          and all teams will be disconnected.
        </p>
      </Modal>
    </main>
  );
}

export default HostPage;
