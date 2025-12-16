import { Card } from "../../../components/Card";
import { RoundSummaryCard } from "../../../components/phases/RoundSummaryCard";
import { ProgressBar } from "../../../components/ProgressBar";
import Timer from "../../../components/Timer";
import type { RoundGroup, Answer } from "../../../shared/types";

interface ResultsPhaseProps {
  sessionRoundIndex: number;
  roundSummaries: {
    group: RoundGroup;
    index: number;
    answers: Answer[];
    winners: Answer[];
  }[];
  voteCounts: Map<string, number>;
  sessionEndsAt: string | undefined;
  resultsSecs: number;
}

export function ResultsPhase({
  sessionRoundIndex,
  roundSummaries,
  voteCounts,
  sessionEndsAt,
  resultsSecs,
}: ResultsPhaseProps) {
  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
          Round results
        </span>
        <h3 className="text-2xl font-bold text-slate-900">
          Recap for round {sessionRoundIndex + 1}
        </h3>
        <p className="text-sm text-slate-600">
          Highlight the winning answers from each group below.
        </p>
        
        <Timer endTime={sessionEndsAt} 
          label={
            <span className="flex items-center">
              Next round starts soon
              <span className="ml-1 dots" />
            </span>
          }
        />
      <ProgressBar endTime={sessionEndsAt} totalSeconds={resultsSecs} />
      </div>
      <div className="space-y-4">
        {roundSummaries.length ? (
          roundSummaries.map((summary) => (
            <RoundSummaryCard
              key={summary.group.id}
              summary={summary}
              voteCounts={voteCounts}
              variant="host"
            />
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No answers submitted this round.
          </p>
        )}
      </div>
    </Card>
  );
}
