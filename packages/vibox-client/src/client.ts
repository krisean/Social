import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type {
  ViboxQueueItem,
  ViboxQueueInsert,
  ApiResponse,
  ViboxClientConfig,
  QueueEvent,
} from './types';

export class ViboxClient {
  private apiUrl: string;
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;

  constructor(config: ViboxClientConfig) {
    this.apiUrl = config.apiUrl;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  async getQueue(): Promise<ApiResponse<{ queue: ViboxQueueItem[]; count: number }>> {
    try {
      const response = await fetch(`${this.apiUrl}/api/queue`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch queue',
      };
    }
  }

  async addToQueue(track: ViboxQueueInsert): Promise<ApiResponse<{ queueItem: ViboxQueueItem }>> {
    try {
      const response = await fetch(`${this.apiUrl}/api/queue/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(track),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add track',
      };
    }
  }

  async removeFromQueue(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/api/queue/${id}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove track',
      };
    }
  }

  async markPlayed(
    id: string,
    options?: {
      play_duration?: number;
      completion_percentage?: number;
      was_skipped?: boolean;
    }
  ): Promise<ApiResponse<{ queueItem: ViboxQueueItem }>> {
    try {
      const response = await fetch(`${this.apiUrl}/api/queue/${id}/play`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {}),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark track as played',
      };
    }
  }

  async skipTrack(id: string): Promise<ApiResponse<{ queueItem: ViboxQueueItem }>> {
    try {
      const response = await fetch(`${this.apiUrl}/api/queue/${id}/skip`, {
        method: 'PUT',
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to skip track',
      };
    }
  }

  async clearQueue(): Promise<ApiResponse<{ clearedCount: number }>> {
    try {
      const response = await fetch(`${this.apiUrl}/api/queue/clear`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear queue',
      };
    }
  }

  subscribe(callback: (event: QueueEvent) => void): () => void {
    this.channel = this.supabase
      .channel('vibox-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vibox_queue',
        },
        (payload) => {
          const event: QueueEvent = {
            type: this.mapEventType(payload.eventType),
            data: payload.new || payload.old,
            timestamp: new Date().toISOString(),
          };
          callback(event);
        }
      )
      .subscribe();

    return () => {
      if (this.channel) {
        this.channel.unsubscribe();
        this.channel = null;
      }
    };
  }

  private mapEventType(eventType: string): QueueEvent['type'] {
    switch (eventType) {
      case 'INSERT':
        return 'track_added';
      case 'DELETE':
        return 'track_removed';
      case 'UPDATE':
        return 'track_played';
      default:
        return 'track_added';
    }
  }

  async getHealth(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/api/health`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }
}
