/**
 * Event Manager for Multi-Game Events
 * Orchestrates events that combine multiple games
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { GameRegistry } from './GameRegistry';
import type { GameId } from './types';

export interface EventRound {
  gameId: GameId;
  duration: number; // seconds
  settings?: Record<string, unknown>;
}

export interface EventConfig {
  name: string;
  venueId?: string;
  rounds: EventRound[];
}

export class EventManager {
  constructor(private registry: GameRegistry) {}

  async createEvent(
    client: SupabaseClient,
    config: EventConfig,
  ): Promise<string> {
    // Create a session for the event platform
    const { data: session, error } = await client
      .from('sessions')
      .insert({
        game_id: 'event-platform',
        mode: 'event',
        venue_id: config.venueId,
        settings: { name: config.name, rounds: config.rounds },
        phase_id: 'setup',
      })
      .select()
      .single();

    if (error || !session) {
      throw new Error(`Failed to create event: ${error?.message}`);
    }

    // Create event rounds
    const roundsData = config.rounds.map((round, index) => ({
      session_id: session.id,
      round_number: index + 1,
      game_id: round.gameId,
      duration_seconds: round.duration,
      settings: round.settings || {},
    }));

    const { error: roundsError } = await client
      .from('event_rounds')
      .insert(roundsData);

    if (roundsError) {
      throw new Error(`Failed to create event rounds: ${roundsError.message}`);
    }

    return session.id;
  }

  async startEvent(
    client: SupabaseClient,
    sessionId: string,
  ): Promise<void> {
    // Update session to started
    await client
      .from('sessions')
      .update({
        started_at: new Date().toISOString(),
        phase_id: 'round_1',
      })
      .eq('id', sessionId);
  }

  async advanceToNextRound(
    client: SupabaseClient,
    sessionId: string,
    currentRound: number,
  ): Promise<void> {
    // Get next round
    const { data: nextRound } = await client
      .from('event_rounds')
      .select('*')
      .eq('session_id', sessionId)
      .eq('round_number', currentRound + 1)
      .single();

    if (nextRound) {
      // Update to next round
      await client
        .from('sessions')
        .update({ phase_id: `round_${nextRound.round_number}` })
        .eq('id', sessionId);
    } else {
      // No more rounds, end event
      await client
        .from('sessions')
        .update({
          phase_id: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', sessionId);
    }
  }
}

