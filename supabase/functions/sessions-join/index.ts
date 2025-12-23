// Join an existing game session
import { createServiceClient, requireString, cleanTeamName, handleError, handleCors, corsResponse, getUserId, AppError } from '../_shared/utils.ts';
import type { Session, Team } from '../_shared/types.ts';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const uid = getUserId(req);
    const { code, teamName } = await req.json();
    
    const cleanedCode = requireString(code, 'code').toUpperCase();
    const cleanedTeamName = cleanTeamName(requireString(teamName, 'teamName'));
    
    const supabase = createServiceClient();
    
    // Find session by code
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', cleanedCode)
      .single();
    
    if (sessionError || !session) {
      throw new AppError(404, 'Session not found with that code', 'not-found');
    }
    
    // Check if session is joinable
    if (session.status === 'ended') {
      throw new AppError(400, 'This session has ended', 'failed-precondition');
    }
    
    // Count current teams
    const { count } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id);
    
    const maxTeams = session.settings?.maxTeams || 24;
    if (count && count >= maxTeams) {
      throw new AppError(400, 'Session is full', 'resource-exhausted');
    }
    
    // Check if user already joined
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('*')
      .eq('session_id', session.id)
      .eq('uid', uid)
      .single();
    
    if (existingTeam) {
      // Return existing team
      return corsResponse({
        sessionId: session.id,
        code: session.code,
        session: session as Session,
        team: existingTeam as Team,
      });
    }
    
    // Get next mascot ID (simple rotation based on team count)
    const mascotId = ((count || 0) % 6) + 1;
    
    // Create new team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        session_id: session.id,
        uid,
        team_name: cleanedTeamName,
        is_host: false,
        score: 0,
        mascot_id: mascotId,
      })
      .select()
      .single();
    
    if (teamError) throw teamError;
    
    // Update analytics
    await supabase
      .from('session_analytics')
      .update({ joined_count: (count || 0) + 1 })
      .eq('session_id', session.id);
    
    return corsResponse({
      sessionId: session.id,
      code: session.code,
      session: session as Session,
      team: team as Team,
    });
  } catch (error) {
    return handleError(error);
  }
});


