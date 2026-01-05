// Create a new game session
import { createServiceClient, requireString, cleanTeamName, handleError, handleCors, corsResponse, getUserId } from '../_shared/utils.ts';
import { getPromptLibrary, DEFAULT_PROMPTS, GROUP_SIZE, TOTAL_ROUNDS } from '../_shared/prompts.ts';
import type { Session, Team } from '../_shared/types.ts';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const uid = await getUserId(req);
    const { teamName, venueName, promptLibraryId } = await req.json();
    
    const cleanedTeamName = cleanTeamName(requireString(teamName, 'teamName'));
    const cleanedVenueName = venueName ? cleanTeamName(venueName) : undefined;
    const libraryId = promptLibraryId || 'classic';
    
    const supabase = createServiceClient();
    
    // Generate unique room code
    const code = await supabase.rpc('ensure_unique_code');
    if (!code.data) {
      throw new Error('Failed to generate room code');
    }
    
    // Get prompts for this library
    const library = await getPromptLibrary(libraryId);
    const promptDeck = [...library.prompts].sort(() => Math.random() - 0.5);
    
    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        code: code.data,
        host_uid: uid,
        status: 'lobby',
        round_index: 0,
        rounds: [],
        prompt_deck: promptDeck,
        prompt_cursor: 0,
        prompt_library_id: libraryId,
        settings: {
          answerSecs: 90,
          voteSecs: 90,
          resultsSecs: 12,
          maxTeams: 24,
        },
        venue_name: cleanedVenueName,
      })
      .select()
      .single();
    
    if (sessionError) throw sessionError;
    
    // Get next mascot ID (simple rotation)
    const mascotId = Math.floor(Math.random() * 6) + 1;
    
    // Create host team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        session_id: session.id,
        uid,
        team_name: cleanedTeamName,
        is_host: true,
        score: 0,
        mascot_id: mascotId,
      })
      .select()
      .single();
    
    if (teamError) throw teamError;
    
    // Create analytics record
    await supabase
      .from('session_analytics')
      .insert({ session_id: session.id });
    
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


