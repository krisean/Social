import { ProgressBar } from "../../../components/ProgressBar";
import { Card } from "../../../components/Card";
import { phaseHeadline } from "../../../shared/constants";
import type { Session } from "../../../shared/types";

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
  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-4">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          {phaseHeadline[session.status]}
        </span>
        <h2 className="text-4xl font-bold leading-tight text-slate-900">{presenterHeading}</h2>
        {groupStatusLabel ? (
          <p className="text-sm uppercase tracking-[0.3em] text-slate-600">
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

