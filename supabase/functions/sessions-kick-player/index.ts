// Kick a player from a session
import { createHandler, requireString, corsResponse, getSession, AppError } from '../_shared/utils.ts';

async function handleKickPlayer(req: Request, uid: string, supabase: any): Promise<Response> {
    const { sessionId, teamId } = await req.json();
    
    requireString(sessionId, 'sessionId');
    requireString(teamId, 'teamId');
    
  // Get and validate session + host permissions
  const session = await getSession(supabase, sessionId);
    
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
  }

// @ts-ignore - Deno global is available in Supabase Edge Functions runtime
Deno.serve(createHandler(handleKickPlayer));