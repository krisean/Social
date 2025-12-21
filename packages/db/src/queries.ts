/**
 * Database Query Helpers
 * Common Supabase queries for game sessions
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Session, Player, Submission } from './client';

export async function getSession(
  client: SupabaseClient<Database>,
  sessionId: string,
): Promise<Session | null> {
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

export async function getSessionPlayers(
  client: SupabaseClient<Database>,
  sessionId: string,
): Promise<Player[]> {
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

export async function getSessionSubmissions(
  client: SupabaseClient<Database>,
  sessionId: string,
  roundNumber?: number,
): Promise<Submission[]> {
  let query = client
    .from('submissions')
    .select('*')
    .eq('session_id', sessionId);

  if (roundNumber !== undefined) {
    query = query.eq('round_number', roundNumber);
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
  sessionData: Partial<Session>,
): Promise<Session | null> {
  const { data, error } = await client
    .from('sessions')
    .insert(sessionData as any)
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
  updates: Partial<Session>,
): Promise<boolean> {
  const { error } = await client
    .from('sessions')
    .update(updates as any)
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating session:', error);
    return false;
  }

  return true;
}

export async function addPlayer(
  client: SupabaseClient<Database>,
  playerData: Partial<Player>,
): Promise<Player | null> {
  const { data, error } = await client
    .from('players')
    .insert(playerData as any)
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
  submissionData: Partial<Submission>,
): Promise<Submission | null> {
  const { data, error } = await client
    .from('submissions')
    .insert(submissionData as any)
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

  // Increment vote count on submission
  const { error: updateError } = await client.rpc('increment_vote_count', {
    submission_id: submissionId,
  });

  if (updateError) {
    // Fallback to manual increment
    const { data: submission } = await client
      .from('submissions')
      .select('vote_count')
      .eq('id', submissionId)
      .single();

    if (submission) {
      await client
        .from('submissions')
        .update({ vote_count: submission.vote_count + 1 })
        .eq('id', submissionId);
    }
  }

  return true;
}

