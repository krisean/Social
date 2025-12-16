import { AnswerCard } from "../../../components/phases/AnswerCard";
import { Card } from "../../../components/Card";
import type { Answer } from "../../../shared/types";

interface VotePhaseProps {
  activeGroupAnswers: Answer[];
  voteCounts: Map<string, number>;
  activeGroupWinnerIds: Set<string>;
  voteSummaryActive: boolean;
  teamLookup: Map<string, string>;
}

export function VotePhase({
  activeGroupAnswers,
  voteCounts,
  activeGroupWinnerIds,
  voteSummaryActive,
  teamLookup,
}: VotePhaseProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {activeGroupAnswers.length ? (
          activeGroupAnswers.map((answer) => {
            const voteTotal = voteCounts.get(answer.id) ?? 0;
            const isWinner = activeGroupWinnerIds.has(answer.id);
            const author = teamLookup.get(answer.teamId) ?? "Unknown";
            return (
              <AnswerCard
                key={answer.id}
                answer={answer}
                voteCount={voteTotal}
                isWinner={isWinner}
                authorName={author}
                showSummary={voteSummaryActive}
                variant="presenter"
              />
            );
          })
        ) : (
          <Card className="col-span-full text-center">
            <p className="text-slate-600">
              Waiting for answers from this group...
            </p>
          </Card>
        )}
      </div>
      {voteSummaryActive ? (
        <Card className="text-center">
          <p className="text-sm font-medium text-slate-700">
            Votes locked in! Tally displayed before the next prompt.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

