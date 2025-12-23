/**
 * Database Query Helpers
 * Common Supabase queries for game sessions
 */
export async function getSession(client, sessionId) {
    const { data, error } = await client
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
    if (error) {
        console.error('Error fetching session:', error);
        return null;
    }
    return data;
}
export async function getSessionPlayers(client, sessionId) {
    const { data, error } = await client
        .from('players')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .order('score', { ascending: false });
    if (error) {
        console.error('Error fetching players:', error);
        return [];
    }
    return data;
}
export async function getSessionSubmissions(client, sessionId, roundNumber) {
    const query = client
        .from('submissions')
        .select('*')
        .eq('session_id', sessionId);
    if (roundNumber !== undefined) {
        query.eq('round_number', roundNumber);
    }
    const { data, error } = await query.order('vote_count', { ascending: false });
    if (error) {
        console.error('Error fetching submissions:', error);
        return [];
    }
    return data;
}
export async function createSession(client, sessionData) {
    const { data, error } = await client
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();
    if (error) {
        console.error('Error creating session:', error);
        return null;
    }
    return data;
}
export async function updateSession(client, sessionId, updates) {
    const { error } = await client
        .from('sessions')
        .update(updates)
        .eq('id', sessionId);
    if (error) {
        console.error('Error updating session:', error);
        return false;
    }
    return true;
}
export async function addPlayer(client, playerData) {
    const { data, error } = await client
        .from('players')
        .insert(playerData)
        .select()
        .single();
    if (error) {
        console.error('Error adding player:', error);
        return null;
    }
    return data;
}
export async function addSubmission(client, submissionData) {
    const { data, error } = await client
        .from('submissions')
        .insert(submissionData)
        .select()
        .single();
    if (error) {
        console.error('Error adding submission:', error);
        return null;
    }
    return data;
}
export async function addVote(client, sessionId, submissionId, voterId) {
    try {
        // Insert vote
        const { error: voteError } = await client
            .from('votes')
            .insert({
            session_id: sessionId,
            submission_id: submissionId,
            voter_id: voterId,
        });
        if (voteError) {
            console.error('Error adding vote:', voteError);
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('Error in addVote:', error);
        return false;
    }
}
//# sourceMappingURL=queries.js.map