import type { Team } from "../../../shared/types";
import { leaderboardFromTeams } from "../../../shared/utils/leaderboard";

export interface LeaderboardTeam {
  id: string;
  rank: number;
  teamName: string;
  score: number;
}

/**
 * Build a leaderboard from teams with ranks assigned
 * Teams with the same score get the same rank
 */
export function buildLeaderboard(
  teams: Team[],
): LeaderboardTeam[] {
  const ranked = leaderboardFromTeams(teams);
  return ranked.map((team) => ({
    id: team.id,
    rank: team.rank,
    teamName: team.teamName,
    score: team.score,
  }));
}

