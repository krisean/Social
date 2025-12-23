// Kick a player from a session
import { createServiceClient, requireString, handleError, handleCors, corsResponse, getUserId, AppError } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const uid = getUserId(req);
    const { sessionId, teamId } = await req.json();
    
    requireString(sessionId, 'sessionId');
    requireString(teamId, 'teamId');
    
    const supabase = createServiceClient();
    
    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('host_uid')
      .eq('id', sessionId)
      .single();
    
    if (sessionError || !session) {
      throw new AppError(404, 'Session not found', 'not-found');
    }
    
    // Verify host
    if (session.host_uid !== uid) {
      throw new AppError(403, 'Only the host can kick players', 'permission-denied');
    }
    
    // Get team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('is_host')
      .eq('id', teamId)
      .eq('session_id', sessionId)
      .single();
    
    if (teamError || !team) {
      throw new AppError(404, 'Team not found', 'not-found');
    }
    
    // Can't kick the host
    if (team.is_host) {
      throw new AppError(400, 'Cannot kick the host', 'failed-precondition');
    }
    
    // Delete the team (cascades to answers and votes)
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);
    
    if (deleteError) throw deleteError;
    
    return corsResponse({ success: true });
  } catch (error) {
    return handleError(error);
  }
});


