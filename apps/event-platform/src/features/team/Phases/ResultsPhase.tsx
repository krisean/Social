import { Card, Leaderboard } from "@social/ui";
import type { Session, Team } from "../../../shared/types";
import { statusHeadline } from "../../../shared/constants";
import { useTheme } from "../../../shared/providers/ThemeProvider";
import { useMemo } from "react";

interface LeaderboardTeam extends Team {
  rank: number;
}

interface ResultsPhaseProps {
  session: Session;
  finalLeaderboard: LeaderboardTeam[];
  currentTeam: Team | null;
  votesForMe: number;
  myRoundPoints: number;
}

export function ResultsPhase({
  session,
  finalLeaderboard,
  currentTeam,
  votesForMe,
  myRoundPoints,
}: ResultsPhaseProps) {
  const { isDark } = useTheme();
  
  // Get bonus information for current team's group
  const myBonus = useMemo(() => {
    const currentRound = session.rounds?.[session.roundIndex];
    if (!currentRound || !currentTeam) return null;
    
    // Find the group this team belongs to
    const myGroup = currentRound.groups?.find(g => 
      g.teamIds.includes(currentTeam.id)
    );
    
    return myGroup?.selectedBonus || null;
  }, [session, currentTeam]);
  
  return (
    <Card className="space-y-5" isDark={isDark}>
      <div className="space-y-2 text-center">
        <h2 className={`text-2xl font-bold ${!isDark ? 'text-slate-900' : 'text-white'}`}>
          {statusHeadline[session.status]}
        </h2>
        <p className={`text-sm ${!isDark ? 'text-slate-600' : 'text-slate-300'}`}>
          Round {session.roundIndex + 1} recap & leaderboard.
        </p>
      </div>
      <div className={`elevated-card p-5`}>
        <h3 className={`text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${!isDark ? 'text-slate-700' : 'text-cyan-400 drop-shadow-sm'}`}>
          Current leaderboard
        </h3>
        <div className="mt-3">
          <Leaderboard
            leaderboard={finalLeaderboard}
            highlightTeamId={currentTeam?.id}
            maxItems={6}
            variant="presenter"
            className="grid gap-3 text-lg font-semibold lg:grid-cols-2"
            isDark={isDark}
          />
        </div>
      </div>
      <div className={`rounded-3xl p-5 text-center shadow-2xl ${!isDark ? 'bg-white' : 'bg-slate-800'}`}>
        <p className={`text-sm font-semibold ${!isDark ? 'text-slate-700' : 'text-slate-300'}`}>
          You earned {votesForMe} vote{votesForMe === 1 ? "" : "s"} this round.
        </p>
        
        {/* Bonus Display */}
        {myBonus && votesForMe > 0 && (
          <div className="mt-3 space-y-1">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              myBonus.bonusType === 'multiplier' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
            }`}>
              <span className="text-white font-bold text-lg">
                {myBonus.bonusType === 'multiplier' ? `${myBonus.bonusValue}× MULTIPLIER!` : `+${myBonus.bonusValue} BONUS!`}
              </span>
            </div>
          </div>
        )}
        
        <p className={`mt-3 text-xs font-semibold ${!isDark ? 'text-brand-primary' : 'text-cyan-400'}`}>
          +{myRoundPoints}
        </p>
      </div>
    </Card>
  );
}

