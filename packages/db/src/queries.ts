/**
 * Database Query Helpers
 * Common Supabase queries for game sessions
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './client';

export async function getSession(
  client: SupabaseClient<Database>,
  sessionId: string,
): Promise<any> {
  const { data, error } = await (client as any)
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

export async function getSessionPlayers(
  client: SupabaseClient<Database>,
  sessionId: string,
): Promise<any[]> {
  const { data, error } = await (client as any)
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

export async function getSessionSubmissions(
  client: SupabaseClient<Database>,
  sessionId: string,
  roundNumber?: number,
): Promise<any[]> {
  const query = (client as any)
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

export async function createSession(
  client: SupabaseClient<Database>,
  sessionData: any,
): Promise<any> {
  const { data, error } = await (client as any)
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

export async function updateSession(
  client: SupabaseClient<Database>,
  sessionId: string,
  updates: any,
): Promise<boolean> {
  const { error } = await (client as any)
    .from('sessions')
    .update(updates)
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating session:', error);
    return false;
  }

  return true;
}

export async function addPlayer(
  client: SupabaseClient<Database>,
  playerData: any,
): Promise<any> {
  const { data, error } = await (client as any)
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

export async function addSubmission(
  client: SupabaseClient<Database>,
  submissionData: any,
): Promise<any> {
  const { data, error } = await (client as any)
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

export async function addVote(
  client: SupabaseClient<Database>,
  sessionId: string,
  submissionId: string,
  voterId: string,
): Promise<boolean> {
  try {
    // Insert vote
    const { error: voteError } = await (client as any)
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
  } catch (error) {
    console.error('Error in addVote:', error);
    return false;
  }
}

