/**
 * Realtime Subscription Helpers
 * Simplifies Supabase realtime subscriptions for game events
 */
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Database, Session, Player, Submission } from './client';
export type SessionUpdateCallback = (session: Session) => void;
export type PlayerUpdateCallback = (players: Player[]) => void;
export type SubmissionUpdateCallback = (submissions: Submission[]) => void;
export declare function subscribeToSession(client: SupabaseClient<Database>, sessionId: string, onUpdate: SessionUpdateCallback): RealtimeChannel;
export declare function subscribeToPlayers(client: SupabaseClient<Database>, sessionId: string, onUpdate: PlayerUpdateCallback): RealtimeChannel;
export declare function subscribeToSubmissions(client: SupabaseClient<Database>, sessionId: string, onUpdate: SubmissionUpdateCallback, roundNumber?: number): RealtimeChannel;
export declare function unsubscribe(channel: RealtimeChannel): void;
//# sourceMappingURL=realtime.d.ts.map