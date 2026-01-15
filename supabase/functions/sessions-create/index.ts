// Create a new game session
import { createHandler, requireString, cleanTeamName, corsResponse } from '../_shared/utils.ts';
import { getPromptLibrary, DEFAULT_PROMPTS, GROUP_SIZE, TOTAL_ROUNDS } from '../_shared/prompts.ts';
import type { Session, Team } from '../_shared/types.ts';

async function handleCreateSession(req: Request, uid: string, supabase: any): Promise<Response> {
    try {
      console.log('handleCreateSession: Starting', { uid });
      const { teamName, venueName, promptLibraryId } = await req.json();
      
      const cleanedTeamName = cleanTeamName(requireString(teamName, 'teamName'));
      const cleanedVenueName = venueName ? cleanTeamName(venueName) : undefined;
      const libraryId = promptLibraryId || 'classic';
      
      console.log('handleCreateSession: Validated input', { cleanedTeamName, libraryId });
      
      // Generate unique room code
      console.log('handleCreateSession: Generating room code');
      const { data: code, error: codeError } = await supabase.rpc('ensure_unique_code');
      if (codeError) {
        console.error('handleCreateSession: RPC error', codeError);
        throw new Error(`Failed to generate room code: ${codeError.message}`);
      }
      if (!code) {
        throw new Error('Failed to generate room code: no data returned');
      }
      console.log('handleCreateSession: Room code generated', code);
      
      // Get prompts for this library
      console.log('handleCreateSession: Loading prompt library', libraryId);
      const library = await getPromptLibrary(libraryId);
      const promptDeck = [...library.prompts].sort(() => Math.random() - 0.5);
      console.log('handleCreateSession: Prompt library loaded', { promptCount: promptDeck.length });
      
      // Create session
      console.log('handleCreateSession: Creating session');
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          code: code,
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
      
      if (sessionError) {
        console.error('handleCreateSession: Session insert error', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        throw new Error('Session created but no data returned');
      }
      
      console.log('handleCreateSession: Session created', session.id);
      
      // Create analytics record (non-blocking)
      await supabase
        .from('session_analytics')
        .insert({ session_id: session.id });
      
      console.log('handleCreateSession: Success');
      return corsResponse({
        sessionId: session.id,
        code: session.code,
        session: session as Session,
      });
    } catch (error) {
      console.error('handleCreateSession: Error', error);
      throw error;
    }
  }

// @ts-ignore - Deno global is available in Supabase Edge Functions runtime
Deno.serve(createHandler(handleCreateSession));