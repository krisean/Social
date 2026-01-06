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
        <h2 className={`text-2xl font-bold ${!isDark ? 'text-slate-900' : 'text-white'}`}>
          {statusHeadline[session.status]}
        </h2>
        <p className={`text-sm ${!isDark ? 'text-slate-600' : 'text-slate-300'}`}>
          Round {session.roundIndex + 1} recap & leaderboard.
        </p>
      </div>
      <div className={`rounded-3xl p-5 shadow-2xl ${!isDark ? 'bg-white' : 'bg-slate-800'}`}>
        <h3 className={`text-sm font-semibold uppercase tracking-wide ${!isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Current leaderboard
        </h3>
        <div className="mt-3">
          <Leaderboard
            leaderboard={finalLeaderboard}
            highlightTeamId={currentTeam?.id}
            maxItems={6}
            variant="team"
          />
        </div>
      </div>
      <div className={`rounded-3xl p-5 text-center shadow-2xl ${!isDark ? 'bg-white' : 'bg-slate-800'}`}>
        <p className={`text-sm font-semibold ${!isDark ? 'text-slate-700' : 'text-slate-300'}`}>
          You earned {votesForMe} vote{votesForMe === 1 ? "" : "s"} this round.
        </p>
        <p className={`mt-1 text-xs font-semibold ${!isDark ? 'text-brand-primary' : 'text-cyan-400'}`}>
          +{myRoundPoints}
        </p>
      </div>
    </Card>
  );
}

