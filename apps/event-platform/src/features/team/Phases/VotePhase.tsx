import { Card, Timer, ProgressBar } from "@social/ui";
import { getMascotById } from "../../../shared/mascots";
import type { Session, RoundGroup, Answer, Vote, Team } from "../../../shared/types";
import { statusHeadline } from "../../../shared/constants";
import { useTheme } from "../../../shared/providers/ThemeProvider";

interface VotePhaseProps {
  session: Session;
  activeGroup: RoundGroup | null;
  roundGroups: RoundGroup[];
  activeGroupIndex: number;
  totalGroups: number;
  prompts: string[];
  activeGroupAnswers: Answer[];
  voteCounts: Map<string, number>;
  myActiveVote: Vote | null;
  activeGroupWinnerIds: Set<string>;
  handleVote: (answerId: string) => void;
  isSubmittingVote: boolean;
  voteSummaryActive: boolean;
  teams: Team[];
  totalSeconds: number;
  currentTeam: Team | null;
  isVotingOnOwnGroup: boolean;
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diffMs = now - time;
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  return `${Math.floor(diffSeconds / 3600)}h ago`;
}

export function VotePhase({
  session,
  activeGroup,
  roundGroups,
  activeGroupIndex,
  totalGroups,
  prompts,
  activeGroupAnswers,
  voteCounts: _voteCounts,
  myActiveVote,
  activeGroupWinnerIds: _activeGroupWinnerIds,
  handleVote,
  isSubmittingVote,
  voteSummaryActive,
  teams,
  totalSeconds,
  isVotingOnOwnGroup,
}: VotePhaseProps) {
  const { isDark } = useTheme();
  const promptValue =
    activeGroup?.prompt ??
    roundGroups[activeGroupIndex]?.prompt ??
    prompts[session.roundIndex % prompts.length];
  const groupLabel = totalGroups
    ? `Group ${activeGroupIndex + 1} of ${totalGroups}`
    : "No groups";

  return (
    <Card className="space-y-3 p-3 sm:space-y-5 sm:p-5" isDark={isDark}>
      <div className="space-y-1.5 text-center sm:space-y-2">
        <h2 className={`text-xl font-bold sm:text-2xl ${!isDark ? 'text-slate-900' : 'text-white'}`}>
          {statusHeadline[session.status]}
        </h2>
        <p className={`text-[11px] font-semibold uppercase tracking-wide sm:text-xs ${!isDark ? 'text-slate-700' : 'text-slate-300'}`}>
          {groupLabel}
        </p>
        <p className={`text-base font-semibold sm:text-lg ${!isDark ? 'text-slate-900' : 'text-white'}`}>
          {promptValue}
        </p>
        <p className={`text-xs font-semibold sm:text-sm ${!isDark ? 'text-brand-primary' : 'text-cyan-400'}`}>
          {isVotingOnOwnGroup
            ? "Viewing your group's answers — you cannot vote in your own group."
            : "Tap your favorite answer — everyone can vote."}
        </p>
      </div>
      <Timer endTime={session.endsAt} label="Voting ends" size="md" />
      <div className={`rounded-full p-0.5 shadow-inner ${!isDark ? 'bg-white/80 shadow-slate-300' : 'bg-slate-700/80 shadow-slate-600'}`}>
        <ProgressBar endTime={session.endsAt} totalSeconds={totalSeconds} />
      </div>
      <div className="space-y-3">
        {activeGroupAnswers.length ? (
          activeGroupAnswers.map((answer) => {
            const isSelected = myActiveVote?.answerId === answer.id;
            const authorTeam = teams.find((team) => team.id === answer.teamId);
            const authorName = authorTeam?.teamName ?? "Unknown team";
            const mascot = authorTeam?.mascotId ? getMascotById(authorTeam.mascotId) : null;
            const timeAgo = formatTimeAgo(answer.createdAt);

            return (
              <article
                key={answer.id}
                className={`flex gap-3 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md ${
                  !isDark ? 'bg-white' : 'bg-slate-800'
                } ${
                  isSelected
                    ? `${!isDark ? 'ring-4 ring-amber-400 bg-amber-50/30' : 'ring-4 ring-cyan-400 bg-cyan-900/30'} shadow-lg`
                    : `hover:${!isDark ? 'bg-white/5' : 'bg-slate-700/50'}`
                } ${isSubmittingVote || voteSummaryActive || isVotingOnOwnGroup ? "opacity-70 cursor-not-allowed" : ""}`}
                onClick={() => !isSubmittingVote && !voteSummaryActive && !isVotingOnOwnGroup && handleVote(answer.id)}
              >
                {/* Avatar/Mascot */}
                <div className="flex-shrink-0">
                  {mascot ? (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${!isDark ? 'bg-slate-100' : 'bg-slate-700'}`}>
                      <img
                        src={mascot.path}
                        alt={mascot.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.textContent = authorName.charAt(0).toUpperCase();
                            parent.className = `w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${!isDark ? 'bg-slate-200 text-slate-600' : 'bg-slate-600 text-slate-300'}`;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${!isDark ? 'bg-slate-200 text-slate-600' : 'bg-slate-600 text-slate-300'}`}>
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Team name and timestamp */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-semibold text-sm ${!isDark ? 'text-slate-900' : 'text-white'}`}>{authorName}</span>
                    <span className={`text-xs ${!isDark ? 'text-slate-500' : 'text-slate-400'}`}>•</span>
                    <span className={`text-xs ${!isDark ? 'text-slate-500' : 'text-slate-400'}`}>{timeAgo}</span>
                  </div>

                  {/* Answer text */}
                  <p className={`leading-relaxed ${!isDark ? 'text-slate-800' : 'text-slate-200'}`}>{answer.text}</p>
                </div>

                {/* Vote button */}
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSubmittingVote && !voteSummaryActive && !isVotingOnOwnGroup) {
                        handleVote(answer.id);
                      }
                    }}
                    disabled={isSubmittingVote || voteSummaryActive || isVotingOnOwnGroup}
                    className={`text-2xl transition-all duration-200 ${
                      isSelected
                        ? "transform scale-110 text-red-500"
                        : "text-slate-400 hover:text-red-400"
                    }`}
                    aria-label={isSelected ? "Remove vote" : "Vote for this answer"}
                  >
                    {isSelected ? "❤️" : "🤍"}
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <Card className="text-center" isDark={isDark}>
            <p className="text-slate-600">
              Waiting for answers from this group...
            </p>
          </Card>
        )}
      </div>
      {voteSummaryActive ? (
        <p className="text-center text-xs font-medium text-brand-primary sm:text-sm">
          Votes locked in! Tally shown before the next prompt.
        </p>
      ) : isVotingOnOwnGroup ? (
        <p className="text-center text-xs font-medium text-slate-600 sm:text-sm">
          You cannot vote in your own group, but you can see all the answers.
        </p>
      ) : myActiveVote ? (
        <p className="text-center text-xs font-medium text-brand-primary sm:text-sm">
          Vote recorded — tap another answer to change it.
        </p>
      ) : null}
    </Card>
  );
}
