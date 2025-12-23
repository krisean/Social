// Advance session to next phase
import { createServiceClient, requireString, handleError, handleCors, corsResponse, getUserId, AppError } from '../_shared/utils.ts';
import type { Session } from '../_shared/types.ts';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const uid = getUserId(req);
    const { sessionId } = await req.json();
    
    requireString(sessionId, 'sessionId');
    
    const supabase = createServiceClient();
    
    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (sessionError || !session) {
      throw new AppError(404, 'Session not found', 'not-found');
    }
    
    // Verify host
    if (session.host_uid !== uid) {
      throw new AppError(403, 'Only the host can advance the game', 'permission-denied');
    }
    
    const currentStatus = session.status;
    const roundIndex = session.round_index || 0;
    const rounds = session.rounds || [];
    const currentRound = rounds[roundIndex];
    const settings = session.settings || {};
    
    let nextStatus = currentStatus;
    let nextRoundIndex = roundIndex;
    let voteGroupIndex = session.vote_group_index;
    let endsAt: string | null = null;
    
    // State machine for phase transitions
    switch (currentStatus) {
      case 'answer':
        // Move to vote phase
        nextStatus = 'vote';
        voteGroupIndex = 0;
        endsAt = new Date(Date.now() + (settings.voteSecs || 90) * 1000).toISOString();
        break;
        
      case 'vote':
        // Check if there are more groups to vote on
        const groups = currentRound?.groups || [];
        const nextGroupIndex = (voteGroupIndex || 0) + 1;
        
        if (nextGroupIndex < groups.length) {
          // Vote on next group
          voteGroupIndex = nextGroupIndex;
          endsAt = new Date(Date.now() + (settings.voteSecs || 90) * 1000).toISOString();
        } else {
          // Move to results
          nextStatus = 'results';
          voteGroupIndex = null;
          endsAt = new Date(Date.now() + (settings.resultsSecs || 12) * 1000).toISOString();
          
          // Calculate scores for this round
          await calculateRoundScores(supabase, sessionId, roundIndex);
        }
        break;
        
      case 'results':
        // Check if there are more rounds
        if (roundIndex + 1 < rounds.length) {
          // Next round
          nextStatus = 'answer';
          nextRoundIndex = roundIndex + 1;
          voteGroupIndex = null;
          endsAt = new Date(Date.now() + (settings.answerSecs || 90) * 1000).toISOString();
        } else {
          // Game over
          nextStatus = 'ended';
          voteGroupIndex = null;
          endsAt = null;
        }
        break;
        
      default:
        throw new AppError(400, 'Cannot advance from current phase', 'failed-precondition');
    }
    
    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({
        status: nextStatus,
        round_index: nextRoundIndex,
        vote_group_index: voteGroupIndex,
        ends_at: endsAt,
        ended_at: nextStatus === 'ended' ? new Date().toISOString() : null,
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    return corsResponse({ session: updatedSession as Session });
  } catch (error) {
    return handleError(error);
  }
});

async function calculateRoundScores(supabase: any, sessionId: string, roundIndex: number) {
  // Get all votes for this round
  const { data: votes } = await supabase
    .from('votes')
    .select('answer_id, answers!inner(team_id)')
    .eq('session_id', sessionId)
    .eq('round_index', roundIndex);
  
  if (!votes || votes.length === 0) return;
  
  // Count votes per team
  const votesByTeam = new Map<string, number>();
  
  for (const vote of votes) {
    const teamId = vote.answers?.team_id;
    if (teamId) {
      votesByTeam.set(teamId, (votesByTeam.get(teamId) || 0) + 1);
    }
  }
  
  // Update team scores
  for (const [teamId, voteCount] of votesByTeam.entries()) {
    await supabase.rpc('increment_team_score', {
      team_id: teamId,
      score_delta: voteCount,
    });
  }
}


