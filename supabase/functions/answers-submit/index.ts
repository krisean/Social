// Submit an answer for a prompt
import { createServiceClient, requireString, handleError, handleCors, corsResponse, getUserId, AppError } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const uid = getUserId(req);
    const { sessionId, text } = await req.json();

    console.log('answers-submit: Received request', { uid, sessionId, textLength: text?.length });
    
    requireString(sessionId, 'sessionId');
    const cleanedText = requireString(text, 'text').slice(0, 200);

    console.log('answers-submit: Validation passed', { sessionId, cleanedTextLength: cleanedText.length });

    const supabase = createServiceClient();
    
    // Get session
    console.log('answers-submit: Fetching session', { sessionId });
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    console.log('answers-submit: Session fetch result', { hasSession: !!session, hasError: !!sessionError, error: sessionError?.message });

    if (sessionError || !session) {
      throw new AppError(404, 'Session not found', 'not-found');
    }
    
    // Check if in answer phase
    if (session.status !== 'answer') {
      throw new AppError(400, 'Not in answer phase', 'failed-precondition');
    }
    
    // Get user's team
    console.log('answers-submit: Looking up team', { sessionId, uid });
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('session_id', sessionId)
      .eq('uid', uid)
      .single();

    console.log('answers-submit: Team lookup result', { hasTeam: !!team, hasError: !!teamError, error: teamError?.message, teamId: team?.id });

    if (teamError || !team) {
      throw new AppError(404, 'Team not found', 'not-found');
    }
    
    // Find which group this team is in for current round
    const roundIndex = session.round_index || 0;
    const rounds = session.rounds || [];
    console.log('answers-submit: Round data', {
      roundIndex,
      roundsLength: rounds.length,
      sessionRounds: session.rounds,
      sessionRoundIndex: session.round_index
    });

    const currentRound = rounds[roundIndex];

    console.log('answers-submit: Current round', { currentRound: !!currentRound, currentRoundData: currentRound });

    if (!currentRound) {
      throw new AppError(400, 'Invalid round', 'failed-precondition');
    }

    let groupId = 'g0';
    console.log('answers-submit: Looking for team in groups', { teamId: team.id, groupsCount: currentRound.groups?.length });
    for (const group of currentRound.groups) {
      console.log('answers-submit: Checking group', { groupId: group.id, teamIds: group.teamIds });
      if (group.teamIds.includes(team.id)) {
        groupId = group.id;
        console.log('answers-submit: Found team in group', { groupId });
        break;
      }
    }
    
    // Simple profanity filter (you can enhance this)
    const masked = containsProfanity(cleanedText);
    
    // Check if already answered
    console.log('answers-submit: Checking for existing answer', { sessionId, teamId: team.id, roundIndex });
    const { data: existingAnswer } = await supabase
      .from('answers')
      .select('id')
      .eq('session_id', sessionId)
      .eq('team_id', team.id)
      .eq('round_index', roundIndex)
      .single();

    console.log('answers-submit: Existing answer check', { hasExistingAnswer: !!existingAnswer, existingAnswerId: existingAnswer?.id });

    if (existingAnswer) {
      throw new AppError(400, 'Already submitted answer for this round', 'already-exists');
    }
    
    // Insert answer
    console.log('answers-submit: Inserting answer', {
      sessionId,
      teamId: team.id,
      roundIndex,
      groupId,
      textLength: cleanedText.length,
      masked
    });

    const { error: insertError } = await supabase
      .from('answers')
      .insert({
        session_id: sessionId,
        team_id: team.id,
        round_index: roundIndex,
        group_id: groupId,
        text: cleanedText,
        masked,
      });

    console.log('answers-submit: Insert result', { hasError: !!insertError, error: insertError?.message });

    if (insertError) throw insertError;

    console.log('answers-submit: Success');
    return corsResponse({ success: true });
  } catch (error) {
    return handleError(error);
  }
});

function containsProfanity(text: string): boolean {
  // Basic profanity check - enhance with a proper library in production
  const badWords = ['fuck', 'shit', 'bitch', 'ass', 'damn'];
  const lowerText = text.toLowerCase();
  return badWords.some(word => lowerText.includes(word));
}


