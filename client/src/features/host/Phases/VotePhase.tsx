import { Card } from "../../../components/Card";
import { Timer } from "../../../components/Timer";
import { ProgressBar } from "../../../components/ProgressBar";
import { AnswerCard } from "../../../components/phases/AnswerCard";
import type { Answer, RoundGroup } from "../../../shared/types";

interface VotePhaseProps {
  totalGroups: number;
  activeGroupIndex: number;
  activeGroup: RoundGroup | null;
  roundGroups: RoundGroup[];
  activeGroupAnswers: Answer[];
  voteCounts: Map<string, number>;
  activeGroupVote: string | null;
  handleHostVote: (answerId: string) => void;
  isSubmittingVote: boolean;
  roundSummaries: {
    group: RoundGroup;
    index: number;
    answers: Answer[];
    winners: Answer[];
  }[];
  sessionEndsAt: string | undefined;
  voteSecs: number;
  prompts: string[];
  sessionRoundIndex: number;
}

export function VotePhase({
  totalGroups,
  activeGroupIndex,
  activeGroup,
  roundGroups, // receive roundGroups here
  activeGroupAnswers,
  voteCounts,
  activeGroupVote,
  handleHostVote,
  isSubmittingVote,
  roundSummaries,
  sessionEndsAt,
  voteSecs,
  prompts,
  sessionRoundIndex,
}: VotePhaseProps) {
  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
          Voting phase
        </span>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {totalGroups
            ? `Group ${activeGroupIndex + 1} of ${totalGroups}`
            : "Waiting for groups"}
        </p>
        <h3 className="text-2xl font-bold text-slate-900">
          {activeGroup?.prompt ??
            roundGroups[activeGroupIndex]?.prompt ??
            prompts[sessionRoundIndex % prompts.length]}
        </h3>
        <p className="text-sm text-slate-600">
          Everyone votes on the answers from this group.
        </p>
      </div>
      <Timer endTime={sessionEndsAt} label="Voting ends" />
      <ProgressBar endTime={sessionEndsAt} totalSeconds={voteSecs} />
      <div className="grid gap-4">
        {activeGroupAnswers.length ? (
          activeGroupAnswers.map((answer) => {
            const voteTotal = voteCounts.get(answer.id) ?? 0;
            const isSelected = activeGroupVote === answer.id;
            return (
              <AnswerCard
                key={answer.id}
                answer={answer}
                voteCount={voteTotal}
                isSelected={isSelected}
                onClick={() => handleHostVote(answer.id)}
                disabled={isSubmittingVote}
                variant="host"
              />
            );
          })
        ) : (
          <p className="text-sm text-slate-500">
            Waiting for answers from this group...
          </p>
        )}
      </div>
      <div className="rounded-3xl bg-white p-4 shadow-inner">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Group progress
        </h4>
        <ul className="mt-3 space-y-2 text-sm">
          {roundSummaries.map((summary) => {
            const answerCount = summary.answers.length;
            const voteTotal = summary.answers.reduce(
              (total, answer) => total + (voteCounts.get(answer.id) ?? 0),
              0,
            );
            const isCurrent = summary.group.id === activeGroup?.id;
            return (
              <li
                key={summary.group.id}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                  isCurrent
                    ? "bg-brand-light text-brand-primary"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <span>
                  Group {summary.index + 1}
                  {isCurrent ? " • now voting" : ""}
                </span>
                <span>
                  {answerCount} answer{answerCount === 1 ? "" : "s"},{" "}
                  {voteTotal} vote{voteTotal === 1 ? "" : "s"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
