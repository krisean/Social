// End a game session
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
      throw new AppError(403, 'Only the host can end the game', 'permission-denied');
    }
    
    // Update session to ended
    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        ends_at: null,
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    // Calculate final analytics
    const { data: teams } = await supabase
      .from('teams')
      .select('id')
      .eq('session_id', sessionId);
    
    const { data: answers } = await supabase
      .from('answers')
      .select('id')
      .eq('session_id', sessionId);
    
    const { data: votes } = await supabase
      .from('votes')
      .select('id')
      .eq('session_id', sessionId);
    
    const teamCount = teams?.length || 0;
    const answerCount = answers?.length || 0;
    const voteCount = votes?.length || 0;
    
    const expectedAnswers = teamCount * (session.round_index + 1);
    const expectedVotes = teamCount * (session.round_index + 1);
    
    const answerRate = expectedAnswers > 0 ? (answerCount / expectedAnswers) * 100 : 0;
    const voteRate = expectedVotes > 0 ? (voteCount / expectedVotes) * 100 : 0;
    
    const duration = session.started_at
      ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
      : 0;
    
    await supabase
      .from('session_analytics')
      .update({
        joined_count: teamCount,
        answer_rate: answerRate,
        vote_rate: voteRate,
        duration,
      })
      .eq('session_id', sessionId);
    
    return corsResponse({ session: updatedSession as Session });
  } catch (error) {
    return handleError(error);
  }
});


