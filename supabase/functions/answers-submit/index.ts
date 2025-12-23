// Submit an answer for a prompt
import { createServiceClient, requireString, handleError, handleCors, corsResponse, getUserId, AppError } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const uid = getUserId(req);
    const { sessionId, text } = await req.json();
    
    requireString(sessionId, 'sessionId');
    const cleanedText = requireString(text, 'text').slice(0, 200);
    
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
    
    // Check if in answer phase
    if (session.status !== 'answer') {
      throw new AppError(400, 'Not in answer phase', 'failed-precondition');
    }
    
    // Get user's team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('session_id', sessionId)
      .eq('uid', uid)
      .single();
    
    if (teamError || !team) {
      throw new AppError(404, 'Team not found', 'not-found');
    }
    
    // Find which group this team is in for current round
    const roundIndex = session.round_index || 0;
    const rounds = session.rounds || [];
    const currentRound = rounds[roundIndex];
    
    if (!currentRound) {
      throw new AppError(400, 'Invalid round', 'failed-precondition');
    }
    
    let groupId = 'g0';
    for (const group of currentRound.groups) {
      if (group.teamIds.includes(team.id)) {
        groupId = group.id;
        break;
      }
    }
    
    // Simple profanity filter (you can enhance this)
    const masked = containsProfanity(cleanedText);
    
    // Check if already answered
    const { data: existingAnswer } = await supabase
      .from('answers')
      .select('id')
      .eq('session_id', sessionId)
      .eq('team_id', team.id)
      .eq('round_index', roundIndex)
      .single();
    
    if (existingAnswer) {
      throw new AppError(400, 'Already submitted answer for this round', 'already-exists');
    }
    
    // Insert answer
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
    
    if (insertError) throw insertError;
    
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


