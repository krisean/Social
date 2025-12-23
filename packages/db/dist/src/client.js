/**
 * Supabase Client Configuration
 * Centralized Supabase client instance
 */
import { createClient } from '@supabase/supabase-js';
let supabaseClient = null;
export function getSupabaseClient() {
    if (!supabaseClient) {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase environment variables');
        }
        supabaseClient = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
            },
            realtime: {
                params: {
                    eventsPerSecond: 10,
                },
            },
        });
    }
    return supabaseClient;
}
export function resetClient() {
    supabaseClient = null;
}
//# sourceMappingURL=client.js.map