// Set the prompt library for a session
import { createServiceClient, requireString, handleError, handleCors, corsResponse, getUserId, AppError } from '../_shared/utils.ts';
import { getPromptLibrary } from '../_shared/prompts.ts';
import type { Session } from '../_shared/types.ts';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const uid = getUserId(req);
    const { sessionId, promptLibraryId } = await req.json();
    
    requireString(sessionId, 'sessionId');
    requireString(promptLibraryId, 'promptLibraryId');
    
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
      throw new AppError(403, 'Only the host can change settings', 'permission-denied');
    }
    
    // Can only change in lobby
    if (session.status !== 'lobby') {
      throw new AppError(400, 'Can only change prompt library in lobby', 'failed-precondition');
    }
    
    // Get new prompt library and shuffle
    const library = getPromptLibrary(promptLibraryId);
    const promptDeck = [...library.prompts].sort(() => Math.random() - 0.5);
    
    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({
        prompt_library_id: promptLibraryId,
        prompt_deck: promptDeck,
        prompt_cursor: 0,
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


