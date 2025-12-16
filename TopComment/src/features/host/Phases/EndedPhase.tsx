import { Card } from "../../../components/Card";
import { Leaderboard } from "../../../components/phases/Leaderboard";
import type { SessionAnalytics } from "../../../shared/types";

interface LeaderboardTeam {
  id: string;
  rank: number;
  teamName: string;
  score: number;
}

interface EndedPhaseProps {
  leaderboard: LeaderboardTeam[];
  analytics: SessionAnalytics | null;
}

export function EndedPhase({ leaderboard, analytics }: EndedPhaseProps) {
  return (
    <Card className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900">Game complete</h3>
        <p className="text-sm text-slate-600">
          Share the leaderboard and invite teams to another round anytime.
        </p>
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Leaderboard
        </h4>
        <Leaderboard
          leaderboard={leaderboard}
          maxItems={5}
          variant="host"
        />
      </div>
      {analytics && (
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Session stats
          </h4>
          <dl className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <dt className="font-medium text-slate-500">Teams joined</dt>
              <dd className="text-lg font-semibold text-slate-900">
                {analytics.joinedCount}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Completion rate</dt>
              <dd className="text-lg font-semibold text-slate-900">
                {Math.round((analytics.answerRate ?? 0) * 100)}%
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Avg votes/round</dt>
              <dd className="text-lg font-semibold text-slate-900">
                {analytics.voteRate?.toFixed(1) ?? "0.0"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Duration</dt>
              <dd className="text-lg font-semibold text-slate-900">
                {analytics.duration
                  ? `${Math.round(analytics.duration / 60)} min`
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </Card>
  );
}
