// Start a game session and generate first round
import { createHandler, requireString, corsResponse, getSession, AppError, shuffleArray } from '../_shared/utils.ts';
import { GROUP_SIZE, TOTAL_ROUNDS } from '../_shared/prompts.ts';
import type { Session, Round, RoundGroup } from '../_shared/types.ts';

async function handleStartSession(req: Request, uid: string, supabase: any): Promise<Response> {
    const { sessionId } = await req.json();

    requireString(sessionId, 'sessionId');
    
  // Get and validate session (also checks host permissions)
  const session = await getSession(supabase, sessionId);

  if (session.host_uid !== uid) {
    throw new AppError(403, 'Only the host can start the game', 'permission-denied');
  }

  // Session already validated by getSession() and validateSessionPhase()

  // Get all non-host teams
  const { data: teams } = await supabase
    .from('teams')
    .select('id')
    .eq('session_id', sessionId)
    .eq('is_host', false);
    
    if (!teams || teams.length === 0) {
      throw new AppError(400, 'Need at least one player to start', 'failed-precondition');
    }
    
    // Shuffle teams
    const shuffledTeamIds: string[] = shuffleArray(teams.map((t: { id: string }) => t.id));
    
    // Generate rounds with groups
    const rounds: Round[] = [];
    let promptCursor = session.prompt_cursor || 0;
    const promptDeck = session.prompt_deck || [];
    
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const groups: RoundGroup[] = [];
      const teamsForRound = [...shuffledTeamIds];
      
      // Create groups of GROUP_SIZE
      while (teamsForRound.length > 0) {
        const groupTeamIds = teamsForRound.splice(0, GROUP_SIZE);
        const groupId = `g${groups.length}`;
        
        // Get next prompt
        if (promptCursor >= promptDeck.length) {
          promptCursor = 0;
        }
        const prompt = promptDeck[promptCursor] || "What's your hot take?";
        promptCursor++;
        
        groups.push({
          id: groupId,
          prompt,
          teamIds: groupTeamIds,
        });
      }
      
      rounds.push({
        prompt: groups[0]?.prompt,
        groups,
      });
    }
    
    // Calculate phase end time (answer phase)
    const answerSecs = session.settings?.answerSecs || 90;
    const endsAt = new Date(Date.now() + answerSecs * 1000).toISOString();
    
    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({
        status: 'answer',
        round_index: 0,
        rounds,
        prompt_cursor: promptCursor,
        started_at: new Date().toISOString(),
        ends_at: endsAt,
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    return corsResponse({ session: updatedSession as Session });
  }

Deno.serve(createHandler(handleStartSession));