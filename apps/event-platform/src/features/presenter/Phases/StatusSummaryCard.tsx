import { ProgressBar, Card } from "@social/ui";
import { phaseHeadline } from "../../../shared/constants";
import type { Session } from "../../../shared/types";
import { useTheme } from "../../../shared/providers/ThemeProvider";

interface StatusSummaryCardProps {
  session: Session;
  presenterHeading: string;
  groupStatusLabel: string;
  totalSeconds: number;
}

export function StatusSummaryCard({
  session,
  presenterHeading,
  groupStatusLabel,
  totalSeconds,
}: StatusSummaryCardProps) {
  const { isDark } = useTheme();
  return (
    <Card className="space-y-4" isDark={isDark}>
      <div className="flex flex-col gap-4">
        <span className={`text-sm font-semibold uppercase tracking-[0.3em] ${!isDark ? 'text-amber-500' : 'text-cyan-400'}`}>
          {phaseHeadline[session.status]}
        </span>
        <h2 className={`text-4xl font-bold leading-tight ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>{presenterHeading}</h2>
        {groupStatusLabel ? (
          <p className={`text-sm uppercase tracking-[0.3em] ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
            {groupStatusLabel}
          </p>
        ) : null}
        {session.status !== "lobby" ? (
          <ProgressBar
            endTime={session.endsAt}
            totalSeconds={totalSeconds}
            variant="brand"
          />
        ) : null}
      </div>
    </Card>
  );
}

