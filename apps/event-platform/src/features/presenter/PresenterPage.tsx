import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Timer } from "../../components/Timer";
import { BackgroundAnimation } from "../../components/BackgroundAnimation";
import { Card } from "../../components/Card";
import { useSession, useTeams, useAnswers, useVotes } from "../session/hooks";
import { useTheme } from "../../shared/providers/ThemeProvider";
import { phaseSubtitle, prompts, phaseHeadline } from "../../shared/constants";
import type { Answer } from "../../shared/types";
import {
  LobbyPhase,
  AnswerPhase,
  VotePhase,
  ResultsPhase,
  EndedPhase,
} from "./Phases";
import { StatusSummaryCard } from "./Phases/StatusSummaryCard";
import QRCodeBlock from "../../components/QRCodeBlock";

export function PresenterPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId ?? "";
  const { isDark } = useTheme();

  const { session, hasSnapshot } = useSession(sessionId);
  const teams = useTeams(sessionId);
  const answers = useAnswers(sessionId, session?.roundIndex);
  const votes = useVotes(sessionId, session?.roundIndex);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, []);

  const voteCounts = useMemo(() => {
    const counts = new Map<string, number>();
    votes.forEach((vote) => {
      counts.set(vote.answerId, (counts.get(vote.answerId) ?? 0) + 1);
    });
    return counts;
  }, [votes]);

  const teamLookup = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((team) => {
      map.set(team.id, team.teamName);
    });
    return map;
  }, [teams]);

  const inviteLink = useMemo(() => {
    if (!session?.code) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    if (!origin) return "";
    return `${origin}/play?code=${session.code}`;
  }, [session?.code]);

  const currentRound = session
    ? (session.rounds[session.roundIndex] ?? null)
    : null;
  const roundGroups = useMemo(() => currentRound?.groups ?? [], [currentRound]);
  const totalGroups = roundGroups.length;
  const activeGroupIndex =
    session && session.status === "vote" && totalGroups
      ? Math.min(totalGroups - 1, Math.max(0, session.voteGroupIndex ?? 0))
      : 0;
  const activeGroup =
    session && session.status === "vote" && totalGroups
      ? (roundGroups[activeGroupIndex] ?? null)
      : null;

  const answersByGroup = useMemo(() => {
    const map = new Map<string, Answer[]>();
    answers.forEach((answer) => {
      const list = map.get(answer.groupId) ?? [];
      list.push(answer);
      map.set(answer.groupId, list);
    });
    return map;
  }, [answers]);

  const activeGroupAnswers = useMemo(() => {
    if (session?.status === "vote" && activeGroup) {
      return answers.filter((answer) => answer.groupId === activeGroup.id);
    }
    return answers;
  }, [answers, session?.status, activeGroup]);

  const voteSummaryActive = useMemo(() => {
    if (session?.status !== "vote" || !session?.endsAt) return false;
    const endsAtTime = new Date(session.endsAt).getTime();
    return now >= endsAtTime;
  }, [session?.status, session?.endsAt, now]);

  const activeGroupWinnerIds = useMemo(() => {
    if (!activeGroup) return new Set<string>();
    const winners = new Set<string>();
    let maxVotes = 0;
    activeGroupAnswers.forEach((answer) => {
      const votesForAnswer = voteCounts.get(answer.id) ?? 0;
      if (votesForAnswer > maxVotes) {
        maxVotes = votesForAnswer;
        winners.clear();
        if (votesForAnswer > 0) {
          winners.add(answer.id);
        }
      } else if (votesForAnswer === maxVotes && votesForAnswer > 0) {
        winners.add(answer.id);
      }
    });
    return winners;
  }, [activeGroup, activeGroupAnswers, voteCounts]);

  const roundSummaries = useMemo(() => {
    return roundGroups.map((group, index) => {
      const groupAnswers = answersByGroup.get(group.id) ?? [];
      const sorted = [...groupAnswers].sort(
        (a, b) => (voteCounts.get(b.id) ?? 0) - (voteCounts.get(a.id) ?? 0),
      );
      const bestVotes = sorted.length ? (voteCounts.get(sorted[0].id) ?? 0) : 0;
      const winners =
        bestVotes > 0
          ? sorted.filter(
              (answer) => (voteCounts.get(answer.id) ?? 0) === bestVotes,
            )
          : [];
      return {
        group,
        index,
        answers: sorted,
        winners,
      };
    });
  }, [roundGroups, answersByGroup, voteCounts]);

  const presenterHeading = useMemo(() => {
    if (!session) return "";
    switch (session.status) {
      case "lobby":
        return "Scan the QR to join the round";
      case "answer":
        return totalGroups ? "Unique prompts in play" : "Preparing prompts...";
      case "vote":
        return (
          activeGroup?.prompt ??
          roundGroups[activeGroupIndex]?.prompt ??
          prompts[session.roundIndex % prompts.length]
        );
      case "results":
        return "Round results";
      default:
        return (
          roundGroups[0]?.prompt ?? prompts[session.roundIndex % prompts.length]
        );
    }
  }, [
    session,
    activeGroup?.prompt,
    roundGroups,
    activeGroupIndex,
    totalGroups,
  ]);

  const groupStatusLabel = useMemo(() => {
    if (!session) return "";
    if (session.status === "vote" && totalGroups) {
      return `Group ${activeGroupIndex + 1} of ${totalGroups}`;
    }
    if (session.status === "answer" && totalGroups) {
      return `${totalGroups} group${totalGroups === 1 ? "" : "s"} drafting`;
    }
    return "";
  }, [session, totalGroups, activeGroupIndex]);

  const leaderboard = useMemo(() => {
    return teams
      .slice()
      .sort((a, b) => b.score - a.score)
      .map((team, index) => ({ ...team, rank: index + 1 }));
  }, [teams]);

  const totalSeconds = useMemo(() => {
    if (!session) return 30;
    if (session.status === "vote") {
      return session.settings.voteSecs ?? 90;
    }
    if (session.status === "results") {
      return 12;
    }
    return session.settings.answerSecs ?? 90;
  }, [session]);

  if (!hasSnapshot) {
    return (
      <main className={`flex min-h-screen flex-col items-center justify-center px-6 py-12 ${!isDark ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
        <p className={`text-lg ${!isDark ? 'text-slate-600' : 'text-white/70'}`}>Fetching session...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className={`flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center ${!isDark ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
        <h1 className={`text-4xl font-black ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>Session not found</h1>
        <p className={`mt-3 max-w-md ${!isDark ? 'text-slate-600' : 'text-white/70'}`}>
          Double-check the presenter link or launch a new session from the host
          console.
        </p>
        <Link
          to="/"
          className={`mt-6 rounded-full px-6 py-3 text-sm font-semibold ${!isDark ? 'bg-white text-slate-900' : 'bg-slate-700 text-cyan-100 hover:bg-slate-600'}`}
        >
          Back to home
        </Link>
      </main>
    );
  }

  const showStatusSummaryCard = session.status !== "answer";

  const renderPhaseContent = () => {
    const statusCard = showStatusSummaryCard ? (
      <StatusSummaryCard
        session={session}
        presenterHeading={presenterHeading}
        groupStatusLabel={groupStatusLabel}
        totalSeconds={totalSeconds}
      />
    ) : null;

    switch (session.status) {
      case "lobby":
        return (
          <LobbyPhase
            session={session}
            presenterHeading={presenterHeading}
            groupStatusLabel={groupStatusLabel}
            totalSeconds={totalSeconds}
            teams={teams}
          />
        );
      case "answer":
        return (
          <>
            {statusCard}
            <AnswerPhase roundGroups={roundGroups} teamLookup={teamLookup} />
          </>
        );
      case "vote":
        return (
          <>
            {statusCard}
            <VotePhase
              activeGroupAnswers={activeGroupAnswers}
              voteCounts={voteCounts}
              activeGroupWinnerIds={activeGroupWinnerIds}
              voteSummaryActive={voteSummaryActive}
              teamLookup={teamLookup}
            />
          </>
        );
      case "results":
        return (
          <>
            {statusCard}
            <ResultsPhase
              leaderboard={leaderboard}
              roundSummaries={roundSummaries}
              voteCounts={voteCounts}
            />
          </>
        );
      case "ended":
        return (
          <>
            {statusCard}
            <EndedPhase leaderboard={leaderboard} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <BackgroundAnimation show={true} />
      <main className={`relative min-h-screen px-6 py-10 ${!isDark ? 'text-slate-900' : 'text-white'}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <Card className="text-center lg:text-left">
            <h1 className={`text-4xl font-black tracking-tight ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
              {phaseHeadline[session.status]}
            </h1>
            <p className={`mt-2 text-sm ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
              {phaseSubtitle[session.status]}
            </p>
          </Card>
          <div className="flex items-center gap-6">
            <div className={`flex flex-col items-center rounded-3xl px-6 py-4 shadow-md ${!isDark ? 'bg-white' : 'bg-slate-700'}`}>
              <span className={`text-xs uppercase tracking-[0.4em] ${!isDark ? 'text-slate-600' : 'text-cyan-400'}`}>
                Room
              </span>
              <span className={`mt-2 text-5xl font-black tracking-[0.2em] ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
                {session.code}
              </span>
              <span className={`mt-3 text-sm ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
                {teams.length} team{teams.length === 1 ? "" : "s"} active
              </span>
            </div>
            {session.status === "lobby" && (
              <div className="mt-4 flex flex-col items-center">
                <QRCodeBlock value={inviteLink || ""} />
              </div>
            )}
            <Timer
              endTime={session.endsAt}
              variant="light"
              size="lg"
              label="Time"
            />
          </div>
        </header>

        {renderPhaseContent()}
      </div>
    </main>
    </>
  );
}

export default PresenterPage;
