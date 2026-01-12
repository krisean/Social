import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ViboxQueueItem } from "../../types/vibox";
import { viboxApi } from "../../api/vibox";

interface UseRealtimeQueueReturn {
  queue: ViboxQueueItem[];
  isQueueLoading: boolean;
  queueChannelRef: React.MutableRefObject<RealtimeChannel | null>;
}

export const useRealtimeQueue = (): UseRealtimeQueueReturn => {
  const [queue, setQueue] = useState<ViboxQueueItem[]>([]);
  const [isQueueLoading] = useState(false);
  const queueChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    console.log('🔍 VIBox Debug - Setting up pure realtime');
    
    const fetchQueue = () => {
      console.log('🔍 VIBox Debug - Fetching queue');
      viboxApi.getQueue().then((response) => {
        if (response.success && response.data) {
          setQueue(response.data.queue);
          console.log('🔍 VIBox Debug - Queue fetched:', response.data.count, 'items');
        }
      });
    };

    // Initial fetch
    fetchQueue();
    
    // Setup realtime subscription
    const channel = supabase
      .channel('vibox-queue')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vibox_queue',
        },
        (payload) => {
          console.log('🔍 VIBox Debug - Realtime event received:', payload.eventType);
          // Immediate fetch for realtime events
          fetchQueue();
        }
      )
      .subscribe((status, err) => {
        console.log('🔍 VIBox Debug - Realtime status:', status, err?.message);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ VIBox Debug - Realtime connected successfully');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('❌ VIBox Debug - Realtime failed:', status, err?.message);
        }
      });

    queueChannelRef.current = channel;

    return () => {
      console.log('🔍 VIBox Debug - Cleaning up realtime subscription');
      channel.unsubscribe();
    };
  }, []);

  return {
    queue,
    isQueueLoading,
    queueChannelRef,
  };
};
