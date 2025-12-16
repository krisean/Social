import { getMascotPath } from "../../shared/mascots";

export interface LeaderboardTeam {
  id: string;
  rank: number;
  teamName: string;
  score: number;
  mascotId?: number;
}

type LeaderboardVariant = "team" | "host" | "presenter";

interface LeaderboardProps {
  leaderboard: LeaderboardTeam[];
  highlightTeamId?: string;
  maxItems?: number;
  variant?: LeaderboardVariant;
  className?: string;
  itemClassName?: string;
}

export function Leaderboard({
  leaderboard,
  highlightTeamId,
  maxItems,
  variant = "team",
  className = "",
  itemClassName = "",
}: LeaderboardProps) {
  const displayLeaderboard = maxItems
    ? leaderboard.slice(0, maxItems)
    : leaderboard;


  if (variant === "presenter") {
    return (
      <ul className={`space-y-4 text-2xl font-semibold ${className}`}>
        {displayLeaderboard.map((team) => {
          const mascotPath = team.mascotId ? getMascotPath(team.mascotId) : null;
          
          return (
            <li
              key={team.id}
              className={`flex items-center gap-4 ${itemClassName || ""}`}
            >
              {/* Rank badge */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-900 ring-2 ring-slate-300">
                {team.rank}
              </div>

              {/* Mascot avatar */}
              {mascotPath ? (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-slate-50 p-2 ring-2 ring-slate-200">
                  <img
                    src={mascotPath}
                    alt=""
                    className="h-full w-full object-contain"
                    aria-hidden="true"
                    onError={(e) => {
                      console.error("Failed to load mascot:", mascotPath, "for team:", team.teamName);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-slate-50 ring-2 ring-slate-200">
                  <span className="text-2xl font-bold text-slate-400">
                    {team.teamName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Team name */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-slate-900">{team.teamName}</p>
              </div>

              {/* Points */}
              <div className="flex-shrink-0 text-right">
                <p className="text-slate-900">{team.score}</p>
                <p className="text-sm text-slate-600">pts</p>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  if (variant === "host") {
    return (
      <ol className={`space-y-2.5 ${className}`}>
        {displayLeaderboard.map((team) => {
          const mascotPath = team.mascotId ? getMascotPath(team.mascotId) : null;
          
          return (
            <li
              key={team.id}
              className={`flex items-center gap-3 rounded-2xl bg-slate-100 px-3 py-2.5 ${itemClassName}`}
            >
              {/* Rank badge */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-700">
                {team.rank}
              </div>

              {/* Mascot avatar */}
              {mascotPath ? (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-sm ring-2 ring-white/50">
                  <img
                    src={mascotPath}
                    alt=""
                    className="h-full w-full object-contain"
                    aria-hidden="true"
                    onError={(e) => {
                      console.error("Failed to load mascot:", mascotPath, "for team:", team.teamName);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-200">
                  <span className="text-lg font-bold text-slate-400">
                    {team.teamName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Team name */}
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {team.teamName}
                </p>
              </div>

              {/* Points */}
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-slate-700">{team.score}</p>
                <p className="text-xs text-slate-500">pts</p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  // Team variant (default) - Redesigned with mascot as prominent avatar
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {displayLeaderboard.map((team) => {
        const mascotPath = team.mascotId ? getMascotPath(team.mascotId) : null;
        const isHighlighted = team.id === highlightTeamId;
        
        return (
          <li
            key={team.id}
            data-team-id={team.id}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 shadow-md transition ${
              isHighlighted
                ? "bg-brand-light ring-2 ring-brand-primary"
                : "bg-slate-100"
            } ${itemClassName}`}
          >
            {/* Rank badge */}
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                isHighlighted
                  ? "bg-brand-primary text-white"
                  : "bg-slate-300 text-slate-700"
              }`}
            >
              {team.rank}
            </div>

            {/* Mascot avatar */}
            {mascotPath ? (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-sm ring-2 ring-white/50">
                <img
                  src={mascotPath}
                  alt=""
                  className="h-full w-full object-contain"
                  aria-hidden="true"
                  onError={(e) => {
                    console.error("Failed to load mascot:", mascotPath, "for team:", team.teamName);
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-200">
                <span className="text-lg font-bold text-slate-400">
                  {team.teamName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Team name */}
            <div className="flex-1 min-w-0">
              <p
                className={`truncate font-semibold ${
                  isHighlighted ? "text-brand-primary" : "text-slate-900"
                }`}
              >
                {team.teamName}
              </p>
            </div>

            {/* Points */}
            <div className="flex-shrink-0 text-right">
              <p
                className={`text-sm font-bold ${
                  isHighlighted ? "text-brand-primary" : "text-slate-700"
                }`}
              >
                {team.score}
              </p>
              <p className="text-xs text-slate-500">pts</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

