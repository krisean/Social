import { useEffect, useState, useCallback } from 'react';
import { ViboxClient } from '@social/vibox-client';
import type { ViboxQueueItem } from '@social/vibox-client';

const viboxClient = new ViboxClient({
  apiUrl: import.meta.env.VITE_VIBOX_API_URL || 'http://localhost:3000',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
});

export function useViboxQueue() {
  const [queue, setQueue] = useState<ViboxQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      const response = await viboxClient.getQueue();
      if (response.success && response.data) {
        setQueue(response.data.queue);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch queue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();

    const unsubscribe = viboxClient.subscribe(() => {
      fetchQueue();
    });

    return unsubscribe;
  }, [fetchQueue]);

  const addToQueue = useCallback(async (track: {
    track_id: string;
    track_title: string;
    track_artist: string;
    track_url: string;
    track_genre?: string;
    track_duration?: number;
    primary_vibe?: string;
    secondary_vibe?: string;
    added_by: string;
  }) => {
    const response = await viboxClient.addToQueue(track);
    if (response.success) {
      await fetchQueue();
    }
    return response;
  }, [fetchQueue]);

  const removeFromQueue = useCallback(async (id: string) => {
    const response = await viboxClient.removeFromQueue(id);
    if (response.success) {
      await fetchQueue();
    }
    return response;
  }, [fetchQueue]);

  const markPlayed = useCallback(async (
    id: string,
    options?: {
      play_duration?: number;
      completion_percentage?: number;
      was_skipped?: boolean;
    }
  ) => {
    const response = await viboxClient.markPlayed(id, options);
    if (response.success) {
      await fetchQueue();
    }
    return response;
  }, [fetchQueue]);

  const skipTrack = useCallback(async (id: string) => {
    const response = await viboxClient.skipTrack(id);
    if (response.success) {
      await fetchQueue();
    }
    return response;
  }, [fetchQueue]);

  const clearQueue = useCallback(async () => {
    const response = await viboxClient.clearQueue();
    if (response.success) {
      await fetchQueue();
    }
    return response;
  }, [fetchQueue]);

  return {
    queue,
    isLoading,
    error,
    addToQueue,
    removeFromQueue,
    markPlayed,
    skipTrack,
    clearQueue,
    refresh: fetchQueue,
  };
}
