import { useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, QRCodeBlock, Card, Modal, useToast } from "@social/ui";
import { useAuth } from "../../shared/providers/AuthContext";
import { useCurrentPhase } from "../../shared/providers/CurrentPhaseContext";
import { useTheme } from "../../shared/providers/ThemeProvider";
import { useHostSession } from "./useHostSession";
import { useGameState, transformRoundSummariesForUI } from "../../application";
import { useInviteLink, useTeamLookup, useActiveGroupAnswers } from "../../shared/hooks";
import { useHostState, useHostComputations, useHostEffects } from "./hooks";
import {
  setPromptLibrary,
  pauseSession,
} from "../session/sessionService";
import { getErrorMessage } from "../../shared/utils/errors";
import {
  phaseCopy,
  actionLabel,
  getDefaultPromptLibraryId,
} from "../../shared/constants";
import {
  LobbyPhase,
  CategorySelectPhase,
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

  const hostState = useHostState(storedSessionId);
  const {
    sessionId,
    setSessionId,
    showCreateModal,
    setShowCreateModal,
    isCreating,
    setIsCreating,
    createErrors,
    setCreateErrors,
    createForm,
    setCreateForm,
    showPromptLibraryModal,
    setShowPromptLibraryModal,
    isUpdatingPromptLibrary,
    setIsUpdatingPromptLibrary,
    hostGroupVotes,
    setHostGroupVotes,
    isSubmittingVote,
    setIsSubmittingVote,
    analytics,
    setAnalytics,
    isPerformingAction,
    setIsPerformingAction,
    isEndingSession,
    setIsEndingSession,
    isPausingSession,
    setIsPausingSession,
    showEndSessionModal,
    setShowEndSessionModal,
    kickingTeamId,
    setKickingTeamId,
    sessionRef,
    isPerformingActionRef,
  } = hostState;

  const canCreateSession = !authLoading && Boolean(user);

  // Use the new application hooks - this replaces 4 separate hooks and multiple useMemo calls!
  const gameState = useGameState({ 
    sessionId: sessionId ?? undefined, 
    userId: user?.id 
  });

  // Extract data from gameState for compatibility with existing code
  const session = gameState.session;
  const teams = gameState.teams;
  const answers = gameState.answers;
  const sessionSnapshotReady = !gameState.isLoading;

  // Set sessionRef.current to latest session for auto advance actions.
  useEffect(() => {
    sessionRef.current = session ?? null;
  }, [session]);

  // Helper to keep isPerformingAction state and ref synchronized
  const triggerPerformingAction = (value: boolean) => {
    isPerformingActionRef.current = value;
    setIsPerformingAction(value);
  };

  // Use gameState values instead of calculations
  const roundGroups = gameState.currentGroups;
  const totalGroups = roundGroups.length;

  // Vote Phase group info - use gameState values
  const activeGroup = gameState.activeVoteGroup;
  const activeGroupIndex = session?.voteGroupIndex ?? 0;

  // Use gameState voteCounts instead of calculation
  const voteCounts = gameState.voteCounts;

  // Answers for active voting group or all answers if not voting
  const activeGroupAnswers = useActiveGroupAnswers(answers, session, activeGroup);

  // Extract computations into custom hook
  const {
    leaderboard,
    selectedPromptLibraryId,
    currentPromptLibrary,
    activeGroupVote,
  } = useHostComputations({
    gameState,
    session,
    hostGroupVotes,
    activeGroup,
  });

// Extract effects into custom hook
  useHostEffects({
    session,
    sessionId,
    sessionSnapshotReady,
    sessionRef,
    setSessionId,
    setHostSession,
    clearHostSession,
    setShowCreateModal,
    setCurrentPhase,
    setAnalytics,
    setShowPromptLibraryModal,
    setHostGroupVotes,
    toast: addToast,
  });

  const inviteLink = useInviteLink(session);

  // Map team IDs to team names for lookup
  const teamLookup = useTeamLookup(teams);

  // Use gameState roundSummaries with shared transformation
  const roundSummaries = transformRoundSummariesForUI(
    gameState.roundSummaries,
    roundGroups,
    teams
  );

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
    gameMode: createForm.gameMode,
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
    refresh: gameState.refresh,
  });

  const copyLinkHandler = handleCopyLink({ toast: addToast });

  const handlePauseToggle = useCallback(async () => {
    if (!session || isPausingSession) return;

    setIsPausingSession(true);
    try {
      await pauseSession({
        sessionId: session.id,
        pause: !session.paused
      });
      addToast({
        title: session.paused ? "Session resumed" : "Session paused",
        variant: "success"
      });
    } catch (error: unknown) {
      addToast({
        title: getErrorMessage(error, "Failed to pause/resume session"),
        variant: "error"
      });
    } finally {
      setIsPausingSession(false);
    }
  }, [session, isPausingSession, addToast]);

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
    async (libraryId: PromptLibraryId) => {
      if (!session || session.status !== "lobby") return;
      if (isUpdatingPromptLibrary) return;
      const defaultId = await getDefaultPromptLibraryId();
      if (libraryId === (session.promptLibraryId ?? defaultId)) {
        return;
      }
      setIsUpdatingPromptLibrary(true);
      setPromptLibrary({ sessionId: session.id, promptLibraryId: libraryId })
        .then(() => {
          addToast({
            title: "Prompt library updated! New prompts will be used next round.",
            variant: "success"
          });
        })
        .catch((error: unknown) => {
          addToast({
            title: getErrorMessage(error, "Could not update prompts. Please try again."),
            variant: "error"
          });
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
            {currentPromptLibrary?.emoji} {currentPromptLibrary?.name || 'Loading...'}
          </p>
          <p className={`text-sm ${!isDark ? 'text-slate-500' : 'text-cyan-300'}`}>
            {currentPromptLibrary?.description || 'Loading prompt library...'}
          </p>
        </div>
        {currentPromptLibrary && currentPromptLibrary.prompts.length > 0 && (
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

      case "category-select":
        return (
          <CategorySelectPhase
            session={session}
            roundGroups={roundGroups}
            teams={teams}
            sessionEndsAt={session.endsAt}
            categorySelectSecs={session.settings.categorySelectSecs ?? 15}
            sessionPaused={session.paused}
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
            sessionPaused={session.paused}
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
            sessionPaused={session.paused}
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
            sessionPaused={session.paused}
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
              {session && session.status !== "lobby" && session.status !== "ended" && (
                <Button
                  variant="secondary"
                  onClick={handlePauseToggle}
                  disabled={isPausingSession}
                  isLoading={isPausingSession}
                >
                  {isPausingSession ? (
                    // Loading spinner
                    <svg
                      className="animate-spin w-4 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : session.paused ? (
                    // Play icon for resume
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                      />
                    </svg>
                  ) : (
                    // Pause icon for pause
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                      />
                    </svg>
                  )}
                  <span className="ml-2">
                    {isPausingSession ? "Loading..." : session.paused ? "Resume" : "Pause"}
                  </span>
                </Button>
              )}
              {session ? (
                session.status === "ended" ? (
                  <>
                    <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
                      New Session
                    </Button>
                    <Button variant="ghost" onClick={handleReturnHome}>
                      Return home
                    </Button>
                  </>
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
