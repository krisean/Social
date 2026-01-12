import { Card, SessionTimer, AnswerCard } from "@social/ui";
import { useTheme } from "../../../shared/providers/ThemeProvider";
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
  sessionPaused?: boolean;
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
  sessionPaused = false,
}: VotePhaseProps) {
  const { isDark } = useTheme();
  return (
    <Card className="space-y-6" isDark={isDark}>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
          Voting phase
        </span>
        <p className={`text-sm font-semibold uppercase tracking-wide ${!isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {totalGroups
            ? `Group ${activeGroupIndex + 1} of ${totalGroups}`
            : "Waiting for groups"}
        </p>
        <h3 className={`text-2xl font-bold text-brand-primary`}>
          {activeGroup?.prompt ??
            roundGroups[activeGroupIndex]?.prompt ??
            "Loading prompt..."}
        </h3>
        <p className={`text-sm ${!isDark ? 'text-slate-600' : 'text-brand-primary'}`}>
          Everyone votes on the answers from this group.
        </p>
      </div>
      <SessionTimer
        endTime={sessionEndsAt}
        totalSeconds={voteSecs}
        paused={sessionPaused}
        label="Voting ends"
        size="md"
        isDark={isDark}
      />
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
                isDark={isDark}
              />
            );
          })
        ) : (
          <p className={`text-sm font-medium ${!isDark ? 'text-slate-600' : 'text-slate-300'}`}>
            Waiting for answers from this group...
          </p>
        )}
      </div>
      <div className="elevated-card p-4">
        <h4 className={`text-xs font-semibold uppercase tracking-wide ${!isDark ? 'text-slate-700' : 'text-brand-primary'}`}>
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
                className={`timer-elevated flex items-center justify-between px-4 py-3 ${
                  isCurrent
                    ? `${!isDark ? 'text-brand-primary' : 'text-cyan-400 neon-glow-cyan'}`
                    : `${!isDark ? 'text-slate-800' : 'text-slate-200'}`
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
