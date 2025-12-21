import { Card } from "../../../components/Card";
import { Timer } from "../../../components/Timer";
import { ProgressBar } from "../../../components/ProgressBar";

interface SpotlightPhaseProps {
  sessionEndsAt: string | undefined;
}

export function SpotlightPhase({ sessionEndsAt }: SpotlightPhaseProps) {
  return (
    <Card className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <h2 className="text-6xl font-black text-slate-900">Spotlight</h2>
        <Timer endTime={sessionEndsAt} label="Time left" />
        <ProgressBar endTime={sessionEndsAt} totalSeconds={30} />
      </div>
    </Card>
  );
}

