import { Card, SessionTimer, GroupCard } from "@social/ui";
import { useTheme } from "../../../shared/providers/ThemeProvider";
import type { RoundGroup } from "../../../shared/types";

interface AnswerPhaseProps {
  sessionRoundIndex: number;
  totalGroups: number;
  roundGroups: RoundGroup[];
  teamLookup: Map<string, string>;
  sessionEndsAt: string | undefined;
  answerSecs: number;
  sessionPaused?: boolean;
}

export function AnswerPhase({
  sessionRoundIndex,
  totalGroups,
  roundGroups,
  teamLookup,
  sessionEndsAt,
  answerSecs,
  sessionPaused = false,
}: AnswerPhaseProps) {
  const { isDark } = useTheme();
  return (
    <Card className="space-y-6" isDark={isDark}>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
          Round {sessionRoundIndex + 1}
        </span>
        <p className={`text-sm ${!isDark ? 'text-slate-600' : 'text-slate-300'}`}>
          {totalGroups
            ? `${totalGroups} group${totalGroups === 1 ? "" : "s"} drafting responses`
            : "Grouping teams..."}
        </p>
      </div>
      <SessionTimer
        endTime={sessionEndsAt}
        totalSeconds={answerSecs}
        paused={sessionPaused}
        label="Answer time"
        size="lg"
        isDark={isDark}
      />
      <div className="space-y-4">
        {roundGroups.length ? (
          roundGroups.map((group, index) => (
            <GroupCard
              key={group.id}
              group={group}
              index={index}
              teamLookup={teamLookup}
              variant="host"
              isDark={isDark}
            />
          ))
        ) : (
          <p className={`text-sm ${!isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Gathering prompts for the first group...
          </p>
        )}
      </div>
    </Card>
  );
}
