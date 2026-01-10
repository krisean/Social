import { useEffect, useCallback } from "react";
import type { Session, Team, SessionStatus } from "../../../shared/types";
import { useGameState } from "../../../application";
import { getErrorMessage } from "../../../shared/utils/errors";
import { joinSession } from "../../session/sessionService";
import { supabase } from "../../../supabase/client";

interface UseTeamEffectsProps {
  sessionId: string | null;
  teamSession: { sessionId: string; code: string; teamName: string; uid?: string } | null;
  setSessionId: (id: string | null) => void;
  setTeamSession: (session: any) => void;
  clearTeamSession: () => void;
  joinForm: { code: string; teamName: string };
  setJoinErrors: (errors: Record<string, string>) => void;
  setIsJoining: (joining: boolean) => void;
  setJoinForm: (form: { code: string; teamName: string }) => void;
  autoJoinAttempted: boolean;
  setAutoJoinAttempted: (attempted: boolean) => void;
  hasManuallyLeft: boolean;
  showKickedModal: boolean;
  setShowKickedModal: (show: boolean) => void;
  showSessionEndedModal: boolean;
  setShowSessionEndedModal: (show: boolean) => void;
  setFinalSession: (session: Session | null) => void;
  setFinalTeams: (teams: Team[]) => void;
  setCurrentPhase: (phase: SessionStatus | null) => void;
  toast: (options: { title: string; variant: "success" | "error" | "info" }) => void;
  addToBannedSessions: (sessionId: string, code: string) => void;
  isBannedFromCode: (code: string) => boolean;
  getHasManuallyLeft: () => boolean;
  setHasManuallyLeft: (hasLeft: boolean) => void;
}

export function useTeamEffects({
  sessionId,
  teamSession,
  setSessionId,
  setTeamSession,
  clearTeamSession,
  joinForm,
  setJoinErrors,
  setIsJoining,
  setJoinForm,
  autoJoinAttempted,
  setAutoJoinAttempted,
  hasManuallyLeft,
  showKickedModal,
  setShowKickedModal,
  showSessionEndedModal,
  setShowSessionEndedModal,
  setFinalSession,
  setFinalTeams,
  setCurrentPhase,
  toast,
  addToBannedSessions,
  isBannedFromCode,
  getHasManuallyLeft,
  setHasManuallyLeft,
}: UseTeamEffectsProps) {
  const gameState = useGameState({ 
    sessionId: sessionId ?? undefined, 
    userId: teamSession?.uid
  });

  // Reset joinForm when teamSession is cleared (e.g., after kick or logout)
  useEffect(() => {
    if (!teamSession) {
      setJoinForm({
        code: "",
        teamName: "",
      });
    }
  }, [teamSession, setJoinForm]);

  // Auto-join logic
  useEffect(() => {
    if (
      !teamSession ||
      gameState.isLoading ||
      autoJoinAttempted ||
      hasManuallyLeft ||
      !gameState.session
    ) {
      return;
    }

    setAutoJoinAttempted(true);
    setSessionId(teamSession.sessionId);
    setJoinForm({
      code: teamSession.code,
      teamName: teamSession.teamName,
    });
  }, [
    teamSession,
    gameState.isLoading,
    autoJoinAttempted,
    hasManuallyLeft,
    gameState.session,
    setSessionId,
    setJoinForm,
    setAutoJoinAttempted,
  ]);

  // Session validation and phase updates
  useEffect(() => {
    if (!sessionId || gameState.isLoading) return;

    const session = gameState.session;
    const teams = gameState.teams;

    if (!session) {
      if (!autoJoinAttempted) {
        toast({
          title: "Session not found. It may have expired.",
          variant: "error",
        });
        clearTeamSession();
        setSessionId(null);
      }
      return;
    }

    // Check if banned
    if (isBannedFromCode(session.code)) {
      setShowKickedModal(true);
      clearTeamSession();
      setSessionId(null);
      return;
    }

    // Check if manually left
    if (getHasManuallyLeft()) {
      clearTeamSession();
      setSessionId(null);
      return;
    }

    // Update phase
    setCurrentPhase(session.status);

    // Handle session ended - store final state but don't show modal here
    // Modal is handled by useTeamTimers based on endedByHost flag
    if (session.status === "ended") {
      setFinalSession(session);
      setFinalTeams(teams);
    }
  }, [
    sessionId,
    gameState.isLoading,
    gameState,
    autoJoinAttempted,
    toast,
    clearTeamSession,
    setSessionId,
    isBannedFromCode,
    setShowKickedModal,
    getHasManuallyLeft,
    setCurrentPhase,
    setFinalSession,
    setFinalTeams,
    showSessionEndedModal,
    setShowSessionEndedModal,
  ]);

  // Handle manual leave
  const handleLeave = useCallback(() => {
    console.log("Leave session clicked - redirecting to join form");
    
    // Don't delete team from database - this allows rejoining during gameplay
    // if they left by accident or got disconnected
    // Only clear local session storage
    
    clearTeamSession();
    setSessionId(null);
    setHasManuallyLeft(true);
    // Redirect to join form
    window.location.href = '/play';
  }, [
    clearTeamSession,
    setSessionId,
    setHasManuallyLeft,
  ]);

  return {
    gameState,
    handleLeave,
  };
}
