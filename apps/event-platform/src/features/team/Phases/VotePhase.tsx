import { Card } from "../../../components/Card";
import { Timer } from "../../../components/Timer";
import { ProgressBar } from "../../../components/ProgressBar";
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
    <Card className={`space-y-3 p-3 sm:space-y-5 sm:p-5 ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
      <div className="space-y-1.5 text-center sm:space-y-2">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          {statusHeadline[session.status]}
        </h2>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700 sm:text-xs">
          {groupLabel}
        </p>
        <p className="text-base font-semibold text-slate-900 sm:text-lg">
          {promptValue}
        </p>
        <p className="text-xs font-semibold text-brand-primary sm:text-sm">
          {isVotingOnOwnGroup
            ? "Viewing your group's answers — you cannot vote in your own group."
            : "Tap your favorite answer — everyone can vote."}
        </p>
      </div>
      <Timer endTime={session.endsAt} label="Voting ends" size="md" />
      <div className="rounded-full bg-white/80 p-0.5 shadow-inner shadow-slate-300">
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
                className={`bg-white flex gap-3 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md ${
                  isSelected
                    ? "ring-4 ring-amber-400 bg-amber-50/30 shadow-lg"
                    : "hover:bg-white/5"
                } ${isSubmittingVote || voteSummaryActive || isVotingOnOwnGroup ? "opacity-70 cursor-not-allowed" : ""}`}
                onClick={() => !isSubmittingVote && !voteSummaryActive && !isVotingOnOwnGroup && handleVote(answer.id)}
              >
                {/* Avatar/Mascot */}
                <div className="flex-shrink-0">
                  {mascot ? (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                      <img
                        src={mascot.path}
                        alt={mascot.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.textContent = authorName.charAt(0).toUpperCase();
                            parent.className = "w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600";
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Team name and timestamp */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-slate-900 text-sm">{authorName}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">{timeAgo}</span>
                  </div>

                  {/* Answer text */}
                  <p className="text-slate-800 leading-relaxed">{answer.text}</p>
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
          <Card className="text-center">
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
