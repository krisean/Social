/**
 * Database Query Helpers
 * Common Supabase queries for game sessions
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './client';
export declare function getSession(client: SupabaseClient<Database>, sessionId: string): Promise<any>;
export declare function getSessionPlayers(client: SupabaseClient<Database>, sessionId: string): Promise<any[]>;
export declare function getSessionSubmissions(client: SupabaseClient<Database>, sessionId: string, roundNumber?: number): Promise<any[]>;
export declare function createSession(client: SupabaseClient<Database>, sessionData: any): Promise<any>;
export declare function updateSession(client: SupabaseClient<Database>, sessionId: string, updates: any): Promise<boolean>;
export declare function addPlayer(client: SupabaseClient<Database>, playerData: any): Promise<any>;
export declare function addSubmission(client: SupabaseClient<Database>, submissionData: any): Promise<any>;
export declare function addVote(client: SupabaseClient<Database>, sessionId: string, submissionId: string, voterId: string): Promise<boolean>;
//# sourceMappingURL=queries.d.ts.map