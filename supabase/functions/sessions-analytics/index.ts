// Get analytics for a session
import { createServiceClient, requireString, handleError, handleCors, corsResponse, getUserId, AppError } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const uid = getUserId(req);
    const { sessionId } = await req.json();
    
    requireString(sessionId, 'sessionId');
    
    const supabase = createServiceClient();
    
    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('host_uid')
      .eq('id', sessionId)
      .single();
    
    if (sessionError || !session) {
      throw new AppError(404, 'Session not found', 'not-found');
    }
    
    // Verify host
    if (session.host_uid !== uid) {
      throw new AppError(403, 'Only the host can view analytics', 'permission-denied');
    }
    
    // Get analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('session_analytics')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (analyticsError) {
      // Return default if not found
      return corsResponse({
        analytics: {
          joinedCount: 0,
          answerRate: 0,
          voteRate: 0,
          duration: 0,
        },
      });
    }
    
    return corsResponse({
      analytics: {
        joinedCount: analytics.joined_count,
        answerRate: analytics.answer_rate,
        voteRate: analytics.vote_rate,
        duration: analytics.duration,
      },
    });
  } catch (error) {
    return handleError(error);
  }
});


