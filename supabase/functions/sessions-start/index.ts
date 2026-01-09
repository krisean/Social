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
    
    // Determine initial phase based on game mode
    const isJeopardyMode = session.settings?.gameMode === 'jeopardy';
    const initialStatus = isJeopardyMode ? 'category-select' : 'answer';
    
    console.log('Starting session with mode:', session.settings?.gameMode, 'initialStatus:', initialStatus);
    
    // Select random team for each group in jeopardy mode
    if (isJeopardyMode && rounds.length > 0) {
      try {
        rounds[0].groups = rounds[0].groups.map(group => ({
          ...group,
          selectingTeamId: group.teamIds[Math.floor(Math.random() * group.teamIds.length)],
        }));
        console.log('Selected random teams for groups:', rounds[0].groups.map(g => ({ id: g.id, selectingTeamId: g.selectingTeamId })));
      } catch (err) {
        console.error('Error selecting random teams:', err);
        throw err;
      }
    }
    
    // Calculate phase end time
    const phaseSecs = isJeopardyMode 
      ? (session.settings?.categorySelectSecs || 15)
      : (session.settings?.answerSecs || 90);
    const endsAt = new Date(Date.now() + phaseSecs * 1000).toISOString();
    
    console.log('Updating session to status:', initialStatus, 'with', rounds.length, 'rounds');
    
    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({
        status: initialStatus,
        round_index: 0,
        rounds,
        prompt_cursor: promptCursor,
        started_at: new Date().toISOString(),
        ends_at: endsAt,
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Session update error:', updateError);
      throw updateError;
    }
    
    console.log('Session started successfully with status:', updatedSession.status);
    
    return corsResponse({ session: updatedSession as Session });
  }

Deno.serve(createHandler(handleStartSession));