import { StatusSummaryCard } from "./StatusSummaryCard";
import { DrinkTank } from "../../../components/DrinkTank";
import type { Session, Team } from "../../../shared/types";

interface LobbyPhaseProps {
  session: Session;
  presenterHeading: string;
  groupStatusLabel: string;
  totalSeconds: number;
  teams: Team[];
}

export function LobbyPhase({
  session,
  presenterHeading,
  groupStatusLabel,
  totalSeconds,
  teams,
}: LobbyPhaseProps) {
  return (
    <>
      <StatusSummaryCard
        session={session}
        presenterHeading={presenterHeading}
        groupStatusLabel={groupStatusLabel}
        totalSeconds={totalSeconds}
      />

      {/* Floating mascot drink tank */}
      <DrinkTank teams={teams} className="mt-8" />
    </>
  );
}

