import { useEffect, useRef, useState, useCallback } from 'react';
import { SessionStateMachine } from '../../domain';
import { advancePhase as advanceSessionPhase, pauseSession as pauseSessionService } from '../../features/session/sessionService';
import type { 
  UseSessionOrchestratorReturn, 
  SessionOrchestratorConfig
} from '../types/application.types';

/**
 * Hook for managing session lifecycle and auto-advance
 * Handles state machine validation, auto-advance timer, pause/resume
 */
export function useSessionOrchestrator(config: SessionOrchestratorConfig): UseSessionOrchestratorReturn {
  const { 
    sessionId, 
    autoAdvance: initialAutoAdvance = false, 
    enablePauseResume = true 
  } = config;

  // State
  const [isAutoAdvanceEnabled, setIsAutoAdvanceEnabled] = useState(initialAutoAdvance);
  const [nextPhase, setNextPhase] = useState<string | null>(null);
  const [autoAdvanceIn, setAutoAdvanceIn] = useState<number | null>(null);
  const [lastTransitionAt, setLastTransitionAt] = useState<string | null>(null);

  // Refs for timer management
  const autoAdvanceTimeoutRef = useRef<number | null>(null);
  const autoAdvanceRetryRef = useRef<number | null>(null);
  const sessionRef = useRef<any>(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    if (autoAdvanceRetryRef.current) {
      clearTimeout(autoAdvanceRetryRef.current);
      autoAdvanceRetryRef.current = null;
    }
  }, []);

  // Auto-advance function
  const performAutoAdvance = useCallback(async () => {
    if (!sessionId || !sessionRef.current) return false;

    try {
      const result = await advanceSessionPhase({ sessionId });
      
      if (result && typeof result === 'object' && 'session' in result) {
        setLastTransitionAt(new Date().toISOString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auto-advance failed:', error);
      return false;
    }
  }, [sessionId]);

  // Setup auto-advance timer
  useEffect(() => {
    if (!sessionRef.current) return;

    const session = sessionRef.current;
    
    // Clear existing timers
    clearTimers();

    // Don't set up auto-advance if:
    // - Auto-advance is disabled
    // - Session is paused
    // - No endsAt time
    // - Not a timed phase
    if (!isAutoAdvanceEnabled || 
        session.paused || 
        !session.endsAt || 
        !SessionStateMachine.isTimedPhase(session.status)) {
      setAutoAdvanceIn(null);
      return;
    }

    const now = Date.now();
    const endTime = new Date(session.endsAt).getTime();
    const remainingMs = endTime - now;

    // If phase already ended, try to advance immediately
    if (remainingMs <= 0) {
      const retryDelay = 1000; // Retry after 1 second
      
      autoAdvanceRetryRef.current = window.setTimeout(() => {
        performAutoAdvance();
      }, retryDelay);
      
      setAutoAdvanceIn(retryDelay);
      return;
    }

    // Set up timer for auto-advance
    autoAdvanceTimeoutRef.current = window.setTimeout(() => {
      performAutoAdvance();
    }, remainingMs);

    setAutoAdvanceIn(remainingMs);

    // Cleanup on unmount
    return clearTimers;
  }, [isAutoAdvanceEnabled, sessionRef.current?.status, sessionRef.current?.paused, sessionRef.current?.endsAt, clearTimers, performAutoAdvance]);

  // Update session ref and calculate next phase
  useEffect(() => {
    // This would be called from the parent component with the current session
    // For now, we'll assume it's updated externally
  }, []);

  // Method to update the current session (called by parent)
  const updateSession = useCallback((session: any) => {
    sessionRef.current = session;
    
    if (session) {
      const context = SessionStateMachine.buildContext(session, [], [], []);
      const next = SessionStateMachine.getNextPhase(session.status, context);
      setNextPhase(next);
    } else {
      setNextPhase(null);
      setAutoAdvanceIn(null);
    }
  }, []);

  // Action methods
  const advancePhase = useCallback(async (): Promise<boolean> => {
    if (!sessionId) return false;

    try {
      clearTimers(); // Clear any pending auto-advance
      const result = await advanceSessionPhase({ sessionId });
      
      if (result && typeof result === 'object' && 'session' in result) {
        setLastTransitionAt(new Date().toISOString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Manual advance failed:', error);
      return false;
    }
  }, [sessionId, clearTimers]);

  const pauseSession = useCallback(async (): Promise<boolean> => {
    if (!sessionId || !enablePauseResume) return false;

    try {
      clearTimers(); // Clear any pending auto-advance
      const result = await pauseSessionService({ sessionId, pause: true });
      
      if (result && typeof result === 'object' && 'session' in result) {
        setLastTransitionAt(new Date().toISOString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Pause failed:', error);
      return false;
    }
  }, [sessionId, enablePauseResume, clearTimers]);

  const resumeSession = useCallback(async (): Promise<boolean> => {
    if (!sessionId || !enablePauseResume) return false;

    try {
      const result = await pauseSessionService({ sessionId, pause: false });
      
      if (result && typeof result === 'object' && 'session' in result) {
        setLastTransitionAt(new Date().toISOString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Resume failed:', error);
      return false;
    }
  }, [sessionId, enablePauseResume]);

  const toggleAutoAdvance = useCallback(() => {
    setIsAutoAdvanceEnabled(prev => !prev);
  }, []);

  const setAutoAdvanceEnabled = useCallback((enabled: boolean) => {
    setIsAutoAdvanceEnabled(enabled);
  }, []);

  // Computed state
  const isPaused = sessionRef.current?.paused ?? false;
  const canAutoAdvance = sessionRef.current ? 
    SessionStateMachine.canAutoAdvance(sessionRef.current, SessionStateMachine.buildContext(sessionRef.current, [], [], [])) : false;

  // Cleanup on unmount
  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  return {
    // State
    isAutoAdvanceEnabled,
    isPaused,
    nextPhase,
    canAutoAdvance,
    autoAdvanceIn,
    lastTransitionAt,
    
    // Actions
    advancePhase,
    pauseSession,
    resumeSession,
    toggleAutoAdvance,
    setAutoAdvanceEnabled,
    
    // Internal method for session updates
    updateSession
  } as UseSessionOrchestratorReturn & { updateSession: (session: any) => void };
}
