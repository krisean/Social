import { Card } from "../../../components/Card";
import { DrinkTank } from "../../../components/DrinkTank";
import type { Team } from "../../../shared/types";


interface LobbyPhaseProps {
  teams: Team[];
}

export function LobbyPhase({ teams }: LobbyPhaseProps) {
  return (
    <>
      <Card className="space-y-5">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">You're in!</h2>
          <p className="text-sm text-slate-600">
            Waiting for host to start the game.
          </p>
        </div>
      </Card>

      {/* Floating mascot drink tank */}
      <DrinkTank teams={teams} className="mt-6" />
    </>
  );
}

