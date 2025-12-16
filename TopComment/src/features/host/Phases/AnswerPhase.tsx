import { Card } from "../../../components/Card";
import { Timer } from "../../../components/Timer";
import { ProgressBar } from "../../../components/ProgressBar";
import { GroupCard } from "../../../components/phases/GroupCard";
import type { RoundGroup } from "../../../shared/types";

interface AnswerPhaseProps {
  sessionRoundIndex: number;
  totalGroups: number;
  roundGroups: RoundGroup[];
  teamLookup: Map<string, string>;
  sessionEndsAt: string | undefined;
  answerSecs: number;
}

export function AnswerPhase({
  sessionRoundIndex,
  totalGroups,
  roundGroups,
  teamLookup,
  sessionEndsAt,
  answerSecs,
}: AnswerPhaseProps) {
  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
          Round {sessionRoundIndex + 1}
        </span>
        <p className="text-sm text-slate-600">
          {totalGroups
            ? `${totalGroups} group${totalGroups === 1 ? "" : "s"} drafting responses`
            : "Grouping teams..."}
        </p>
      </div>
      <Timer endTime={sessionEndsAt} label="Answer time" />
      <ProgressBar endTime={sessionEndsAt} totalSeconds={answerSecs} />
      <div className="space-y-4">
        {roundGroups.length ? (
          roundGroups.map((group, index) => (
            <GroupCard
              key={group.id}
              group={group}
              index={index}
              teamLookup={teamLookup}
              variant="host"
            />
          ))
        ) : (
          <p className="text-sm text-slate-500">
            Gathering prompts for the first group...
          </p>
        )}
      </div>
    </Card>
  );
}
