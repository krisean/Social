import { Card } from "../../../components/Card";
import { Button } from "../../../components/Button";
import { getMascotById } from "../../../shared/mascots";
import type { Team } from "../../../shared/types";

interface LobbyPhaseProps {
  inviteLink: string;
  storedCode: string | null;
  sessionId: string | null;
  handleCopyLink: (link: string) => void;
  sessionCode?: string;
  teams: Team[];
}

export function LobbyPhase({
  inviteLink,
  storedCode,
  sessionId,
  handleCopyLink,
  sessionCode,
  teams,
}: LobbyPhaseProps) {
  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-slate-900">
          Waiting for teams
        </h3>
        <p className="text-sm text-slate-600">Share the code and link below.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleCopyLink(inviteLink)}
          className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-brand-primary hover:shadow-md"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Shareable link
          </span>
          <span className="mt-1 break-all font-medium text-slate-900">
            {inviteLink || storedCode}
          </span>
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          onClick={() => handleCopyLink(sessionCode ?? "")}
          variant="secondary"
        >
          Copy room code
        </Button>
        <Button
          onClick={() => window.open(`/presenter/${sessionId}`, "_blank")}
          variant="ghost"
        >
          Open presenter view
        </Button>
      </div>
      {teams.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Teams joined ({teams.length})</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {teams.map((team) => {
              const mascot = team.mascotId ? getMascotById(team.mascotId) : null;
              return (
                <li
                  key={team.id}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
                >
                  {mascot ? (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <img
                        src={mascot.path}
                        alt={mascot.name}
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.textContent = team.teamName.charAt(0).toUpperCase();
                            parent.className = "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600";
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                      {team.teamName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-700 truncate">{team.teamName}</span>
                    <span className="text-xs text-slate-500 ml-2">Score: {team.score}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
