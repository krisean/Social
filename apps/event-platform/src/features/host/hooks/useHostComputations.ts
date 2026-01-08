import { useMemo } from "react";
import type { Session } from "../../../shared/types";
import type { PromptLibraryId, PromptLibrary } from "../../../shared/promptLibraries";
import { promptLibraries, defaultPromptLibrary, defaultPromptLibraryId } from "../../../shared/constants";
import { transformLeaderboardSimple } from "../../../application";

interface UseHostComputationsProps {
  gameState: any;
  session: Session | null;
  hostGroupVotes: Record<string, string>;
  activeGroup: any;
}

export function useHostComputations({
  gameState,
  session,
  hostGroupVotes,
  activeGroup,
}: UseHostComputationsProps) {
  // Transform leaderboard
  const leaderboard = transformLeaderboardSimple(gameState.leaderboard);

  // Prompt library map
  const promptLibraryMap = useMemo(() => {
    const map = new Map<PromptLibraryId, PromptLibrary>();
    promptLibraries.forEach((library) => {
      map.set(library.id, library);
    });
    return map;
  }, []);

  // Current prompt library
  const selectedPromptLibraryId = session?.promptLibraryId ?? defaultPromptLibraryId;
  const currentPromptLibrary = useMemo(
    () =>
      promptLibraryMap.get(selectedPromptLibraryId) ?? defaultPromptLibrary,
    [selectedPromptLibraryId, promptLibraryMap],
  );

  // Host's current vote for the active group
  const activeGroupVote = useMemo(() => {
    if (!activeGroup) return null;
    return hostGroupVotes[activeGroup.id] ?? null;
  }, [hostGroupVotes, activeGroup]);

  return {
    leaderboard,
    selectedPromptLibraryId,
    currentPromptLibrary,
    activeGroupVote,
  };
}
