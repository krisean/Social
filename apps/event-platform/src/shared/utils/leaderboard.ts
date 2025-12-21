import type { Team } from "../types";

export function leaderboardFromTeams(teams: Team[]) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  return sorted.map((team, index) => {
    const prev = sorted[index - 1];
    const rank = prev && prev.score === team.score ? index : index + 1;
    return { ...team, rank };
  });
}

