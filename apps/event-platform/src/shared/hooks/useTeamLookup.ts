import { useMemo } from "react";
import type { Team } from "../types";

/**
 * Creates a map of team IDs to team names for quick lookup
 * Used by HostPage and PresenterPage for displaying team information
 */
export function useTeamLookup(teams: Team[]): Map<string, string> {
  return useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((team) => {
      map.set(team.id, team.teamName);
    });
    return map;
  }, [teams]);
}
