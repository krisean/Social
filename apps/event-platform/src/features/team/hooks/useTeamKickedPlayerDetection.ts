import { useEffect } from "react";

interface UseTeamKickedPlayerDetectionProps {
  session: any;
  teamSession: { sessionId: string; code: string; teamName: string } | null;
  sessionSnapshotReady: boolean;
  currentTeam: any;
  activeTeams: any[];
  showKickedModal: boolean;
  setShowKickedModal: (show: boolean) => void;
  addKickedSession: (sessionId: string, code: string) => void;
  removeKickedSession: (sessionId: string) => void;
  getKickedFromSessions: () => Map<string, import("../utils/teamConstants").KickedSession>;
  setSessionId: (id: string | null) => void;
  clearTeamSession: () => void;
  toast: (options: { title: string; description?: string; variant: "success" | "error" }) => void;
}

export function useTeamKickedPlayerDetection({
  session,
  teamSession,
  sessionSnapshotReady,
  currentTeam,
  activeTeams,
  showKickedModal,
  setShowKickedModal,
  addKickedSession,
  removeKickedSession,
  getKickedFromSessions,
  setSessionId,
  clearTeamSession,
  toast,
}: UseTeamKickedPlayerDetectionProps) {
  // Detect when player is kicked (currentTeam becomes null while session exists and other teams are still present)
  useEffect(() => {
    console.log("Kick detection check:", {
      hasSession: !!session,
      hasTeamSession: !!teamSession,
      sessionSnapshotReady,
      currentTeam,
      activeTeamsCount: activeTeams.length,
      showKickedModal
    });
    
    if (
      session &&
      teamSession &&
      sessionSnapshotReady &&
      currentTeam === null &&
      !showKickedModal
    ) {
      // Player was kicked - they're not in the teams list anymore but other teams exist
      console.log("🚨 Player kicked detected - showing modal and preparing redirect");
      
      // Mark this session as one they were kicked from (store both sessionId and code)
      if (session.id && session.code) {
        addKickedSession(session.id, session.code);
      }
      
      // Show the kicked modal
      setShowKickedModal(true);
      
      // Clear session and redirect after showing modal
      // This ensures they see the message but are automatically redirected
      setTimeout(() => {
        console.log("Auto-redirecting kicked player to join form");
        clearTeamSession();
        setSessionId(null);
        // Force navigation to join form
        window.location.href = '/play';
      }, 5000); // 5 second delay to show the modal
    }
  }, [
    session,
    teamSession,
    sessionSnapshotReady,
    currentTeam,
    activeTeams,
    showKickedModal,
    setShowKickedModal,
    addKickedSession,
    clearTeamSession,
    setSessionId,
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
  }, [session, sessionSnapshotReady, currentTeam, setSessionId, clearTeamSession, toast, getKickedFromSessions]);
}
