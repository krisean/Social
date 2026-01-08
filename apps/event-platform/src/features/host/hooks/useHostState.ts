import { useState, useRef } from "react";
import type { Session } from "../../../shared/types";
import type { SessionAnalytics } from "../../../shared/types";

/**
 * Manages all state for the HostPage component
 * Consolidates 17 useState and 2 useRef declarations
 */
export function useHostState(storedSessionId: string | null) {
  const [sessionId, setSessionId] = useState<string | null>(storedSessionId);
  const [showCreateModal, setShowCreateModal] = useState(!storedSessionId);
  const [isCreating, setIsCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [createForm, setCreateForm] = useState({ teamName: "", venueName: "" });
  const [showPromptLibraryModal, setShowPromptLibraryModal] = useState(false);
  const [isUpdatingPromptLibrary, setIsUpdatingPromptLibrary] = useState(false);
  const [hostGroupVotes, setHostGroupVotes] = useState<Record<string, string>>({});
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [isPausingSession, setIsPausingSession] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [kickingTeamId, setKickingTeamId] = useState<string | null>(null);
  
  const sessionRef = useRef<Session | null>(null);
  const isPerformingActionRef = useRef(false);

  return {
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
  };
}
