/**
 * Realtime Subscription Helpers
 * Simplifies Supabase realtime subscriptions for game events
 */
export function subscribeToSession(client, sessionId, onUpdate) {
    return client
        .channel(`session:${sessionId}`)
        .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
    }, (payload) => {
        onUpdate(payload.new);
    })
        .subscribe();
}
export function subscribeToPlayers(client, sessionId, onUpdate) {
    const channel = client.channel(`players:${sessionId}`);
    const fetchPlayers = async () => {
        const { data } = await client
            .from('players')
            .select('*')
            .eq('session_id', sessionId)
            .eq('is_active', true)
            .order('score', { ascending: false });
        if (data) {
            onUpdate(data);
        }
    };
    channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `session_id=eq.${sessionId}`,
    }, () => {
        fetchPlayers();
    });
    channel.subscribe(() => {
        fetchPlayers();
    });
    return channel;
}
export function subscribeToSubmissions(client, sessionId, onUpdate, roundNumber) {
    const channel = client.channel(`submissions:${sessionId}:${roundNumber ?? 'all'}`);
    const fetchSubmissions = async () => {
        let query = client
            .from('submissions')
            .select('*')
            .eq('session_id', sessionId);
        if (roundNumber !== undefined) {
            query = query.eq('round_number', roundNumber);
        }
        const { data } = await query.order('vote_count', { ascending: false });
        if (data) {
            onUpdate(data);
        }
    };
    channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'submissions',
        filter: `session_id=eq.${sessionId}`,
    }, () => {
        fetchSubmissions();
    });
    // Also listen to votes to update submission counts
    channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'votes',
        filter: `session_id=eq.${sessionId}`,
    }, () => {
        fetchSubmissions();
    });
    channel.subscribe(() => {
        fetchSubmissions();
    });
    return channel;
}
export function unsubscribe(channel) {
    channel.unsubscribe();
}
//# sourceMappingURL=realtime.js.map