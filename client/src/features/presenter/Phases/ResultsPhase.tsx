import { Leaderboard } from "../../../components/phases/Leaderboard";
import { RoundSummaryCard } from "../../../components/phases/RoundSummaryCard";
import { Card } from "../../../components/Card";
import type { Answer, RoundGroup, Team } from "../../../shared/types";

interface RoundSummary {
  group: RoundGroup;
  index: number;
  answers: Answer[];
  winners: Answer[];
}

interface ResultsPhaseProps {
  leaderboard: (Team & { rank: number })[];
  roundSummaries: RoundSummary[];
  voteCounts: Map<string, number>;
}

export function ResultsPhase({
  leaderboard,
  roundSummaries,
  voteCounts,
}: ResultsPhaseProps) {
  return (
    <>
      <Card>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
          Leaderboard
        </p>
        <div className="mt-4">
          <Leaderboard
            leaderboard={leaderboard}
            maxItems={6}
            variant="presenter"
            className="grid gap-3 text-lg font-semibold lg:grid-cols-2"
          />
        </div>
      </Card>

      <section className="grid gap-6">
        {roundSummaries.length ? (
          roundSummaries.map((summary) => (
            <RoundSummaryCard
              key={summary.group.id}
              summary={summary}
              voteCounts={voteCounts}
              variant="presenter"
            />
          ))
        ) : (
          <p className="text-center text-white/60">
            No answers submitted this round.
          </p>
        )}
      </section>
    </>
  );
}
