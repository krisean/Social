import { Card } from "../../../components/Card";
import { Leaderboard } from "../../../components/phases/Leaderboard";
import type { Session, Team } from "../../../shared/types";
import { statusHeadline } from "../../../shared/constants";

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
  return (
    <Card className="space-y-5">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          {statusHeadline[session.status]}
        </h2>
        <p className="text-sm text-slate-600">
          Round {session.roundIndex + 1} recap & leaderboard.
        </p>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-2xl">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
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
      <div className="rounded-3xl bg-white p-5 text-center shadow-2xl">
        <p className="text-sm font-semibold text-slate-700">
          You earned {votesForMe} vote{votesForMe === 1 ? "" : "s"} this round.
        </p>
        <p className="mt-1 text-xs font-semibold text-brand-primary">
          +{myRoundPoints}
        </p>
      </div>
    </Card>
  );
}

