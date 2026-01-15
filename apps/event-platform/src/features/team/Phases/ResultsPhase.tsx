import { Card, Leaderboard } from "@social/ui";
import type { Session, Team } from "../../../shared/types";
import { statusHeadline } from "../../../shared/constants";
import { useTheme } from "../../../shared/providers/ThemeProvider";

interface LeaderboardTeam extends Team {
  rank: number;
}

interface ResultsPhaseProps {
  session: Session;
  finalLeaderboard: LeaderboardTeam[];
  currentTeam: Team | null;
  votesForMe: number;
  myRoundPoints: number;
}

export function ResultsPhase({
  session,
  finalLeaderboard,
  currentTeam,
  votesForMe,
  myRoundPoints,
}: ResultsPhaseProps) {
  const { isDark } = useTheme();
  return (
    <Card className="space-y-5" isDark={isDark}>
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">
          {statusHeadline[session.status]}
        </h2>
        <p className="text-sm text-slate-300">
          Round {session.roundIndex + 1} recap & leaderboard.
        </p>
      </div>
      <div className="elevated-card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide transition-all duration-200 text-cyan-400 drop-shadow-sm">
          Current leaderboard
        </h3>
        <div className="mt-3">
          <Leaderboard
            leaderboard={finalLeaderboard}
            highlightTeamId={currentTeam?.id}
            maxItems={6}
            variant="presenter"
            className="grid gap-3 text-lg font-semibold lg:grid-cols-2"
            isDark={isDark}
          />
        </div>
      </div>
      <div className="rounded-3xl p-5 text-center shadow-2xl bg-slate-800">
        <p className="text-sm font-semibold text-slate-300">
          You earned {votesForMe} vote{votesForMe === 1 ? "" : "s"} this round.
        </p>
        <p className="mt-1 text-xs font-semibold text-cyan-400">
          +{myRoundPoints}
        </p>
      </div>
    </Card>
  );
}

