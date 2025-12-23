/**
 * Supabase Client Configuration
 * Centralized Supabase client instance
 */
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';
export declare function getSupabaseClient(): SupabaseClient<Database>;
export declare function resetClient(): void;
export type { Database };
export type Tables = Database['public']['Tables'];
export type Session = Tables['sessions']['Row'];
export type Player = Tables['players']['Row'];
export type Submission = Tables['submissions']['Row'];
export type Vote = Tables['votes']['Row'];
export type Venue = Tables['venues']['Row'];
export type EventRound = Tables['event_rounds']['Row'];
//# sourceMappingURL=client.d.ts.map