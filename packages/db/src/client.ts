/**
 * Supabase Client Configuration
 * Centralized Supabase client instance
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../supabase/types';

let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
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

export function resetClient(): void {
  supabaseClient = null;
}

// Export types for convenience
export type { Database };
export type Tables = Database['public']['Tables'];
export type Session = Tables['sessions']['Row'];
export type Player = Tables['players']['Row'];
export type Submission = Tables['submissions']['Row'];
export type Vote = Tables['votes']['Row'];
export type Venue = Tables['venues']['Row'];
export type EventRound = Tables['event_rounds']['Row'];

