import { Leaderboard } from "../../../components/phases/Leaderboard";
import { Card } from "../../../components/Card";
import type { Team } from "../../../shared/types";

interface EndedPhaseProps {
  leaderboard: (Team & { rank: number })[];
}

export function EndedPhase({ leaderboard }: EndedPhaseProps) {
  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
        Final scoreboard
      </p>
      <div className="mt-4">
        <Leaderboard
          leaderboard={leaderboard}
          maxItems={8}
          variant="presenter"
          className="space-y-3 text-2xl font-semibold"
        />
      </div>
    </Card>
  );
}

