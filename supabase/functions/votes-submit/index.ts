// Submit a vote for an answer
import { createServiceClient, requireString, handleError, handleCors, corsResponse, getUserId, AppError } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const uid = getUserId(req);
    const { sessionId, answerId } = await req.json();
    
    requireString(sessionId, 'sessionId');
    requireString(answerId, 'answerId');
    
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
    
    // Check if in vote phase
    if (session.status !== 'vote') {
      throw new AppError(400, 'Not in vote phase', 'failed-precondition');
    }
    
    // Get user's team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('session_id', sessionId)
      .eq('uid', uid)
      .single();
    
    if (teamError || !team) {
      throw new AppError(404, 'Team not found', 'not-found');
    }
    
    // Get the answer being voted for
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .select('team_id, round_index, group_id')
      .eq('id', answerId)
      .eq('session_id', sessionId)
      .single();
    
    if (answerError || !answer) {
      throw new AppError(404, 'Answer not found', 'not-found');
    }
    
    // Can't vote for your own answer
    if (answer.team_id === team.id) {
      throw new AppError(400, 'Cannot vote for your own answer', 'failed-precondition');
    }
    
    const roundIndex = session.round_index || 0;
    const voteGroupIndex = session.vote_group_index ?? 0;
    const currentRound = session.rounds?.[roundIndex];
    const currentGroup = currentRound?.groups?.[voteGroupIndex];
    
    if (!currentGroup) {
      throw new AppError(400, 'Invalid voting group', 'failed-precondition');
    }
    
    // Verify answer is in current group
    if (answer.group_id !== currentGroup.id) {
      throw new AppError(400, 'Answer not in current voting group', 'failed-precondition');
    }
    
    // Check if already voted in this round/group
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_id', team.id)
      .eq('round_index', roundIndex)
      .eq('group_id', currentGroup.id)
      .single();
    
    if (existingVote) {
      // Update existing vote
      const { error: updateError } = await supabase
        .from('votes')
        .update({ answer_id: answerId })
        .eq('id', existingVote.id);
      
      if (updateError) throw updateError;
    } else {
      // Insert new vote
      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          session_id: sessionId,
          voter_id: team.id,
          answer_id: answerId,
          round_index: roundIndex,
          group_id: currentGroup.id,
        });
      
      if (insertError) throw insertError;
    }
    
    return corsResponse({ success: true });
  } catch (error) {
    return handleError(error);
  }
});


