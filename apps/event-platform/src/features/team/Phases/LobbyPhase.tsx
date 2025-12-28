import { Card } from "../../../components/Card";
import { useTheme } from "../../../shared/providers/ThemeProvider";
import { DrinkTank } from "../../../components/DrinkTank";
import type { Team } from "../../../shared/types";


interface LobbyPhaseProps {
  teams: Team[];
}

export function LobbyPhase({ teams }: LobbyPhaseProps) {
  const { isDark } = useTheme();
  return (
    <>
      <Card className="space-y-5">
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>You're in!</h2>
          <p className={`text-sm ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
            Waiting for host to start the game.
          </p>
        </div>
      </Card>

      {/* Floating mascot drink tank */}
      <DrinkTank teams={teams} className="mt-6" />
    </>
  );
}

