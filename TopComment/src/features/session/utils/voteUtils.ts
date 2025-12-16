import type { Vote, Answer } from "../../../shared/types";

/**
 * Calculate vote counts for each answer from an array of votes
 */
export function calculateVoteCounts(votes: Vote[]): Map<string, number> {
  const counts = new Map<string, number>();
  votes.forEach((vote) => {
    counts.set(vote.answerId, (counts.get(vote.answerId) ?? 0) + 1);
  });
  return counts;
}

/**
 * Determine winners from a group of answers based on vote counts
 * Winners are answers with the highest vote count (must be > 0)
 * Returns a Set of answer IDs that are winners
 */
export function determineWinners(
  answers: Answer[],
  voteCounts: Map<string, number>,
): Set<string> {
  const winners = new Set<string>();
  let maxVotes = 0;

  answers.forEach((answer) => {
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
}

/**
 * Calculate points for an answer based on vote count and winner status
 * Points formula: (voteCount * 100) + (isWinner ? 1000 : 0)
 */
export function calculatePoints(
  voteCount: number,
  isWinner: boolean,
): number {
  return voteCount * 100 + (isWinner ? 1000 : 0);
}

