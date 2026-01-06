// Create a new game session
import { createPublicHandler, requireString, cleanTeamName, corsResponse, getUserId } from '../_shared/utils.ts';
import { getPromptLibrary, DEFAULT_PROMPTS, GROUP_SIZE, TOTAL_ROUNDS } from '../_shared/prompts.ts';
import type { Session, Team } from '../_shared/types.ts';

async function handleCreateSession(req: Request, supabase: any): Promise<Response> {
  const uid = await getUserId(req); // Still need auth for creating (to be host)
    const { teamName, venueName, promptLibraryId } = await req.json();
    
    const cleanedTeamName = cleanTeamName(requireString(teamName, 'teamName'));
    const cleanedVenueName = venueName ? cleanTeamName(venueName) : undefined;
    const libraryId = promptLibraryId || 'classic';
    
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
    
    // Create analytics record
    await supabase
      .from('session_analytics')
      .insert({ session_id: session.id });
    
    return corsResponse({
      sessionId: session.id,
      code: session.code,
      session: session as Session,
    });
  }

// @ts-ignore - Deno global is available in Supabase Edge Functions runtime
Deno.serve(createPublicHandler(handleCreateSession));