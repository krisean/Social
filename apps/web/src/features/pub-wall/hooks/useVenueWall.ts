import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabase/client';
import type { Submission, Venue } from '@social/db';

interface UseVenueWallResult {
  venue: Venue | null;
  submissions: Submission[];
  submitComment: (content: string) => Promise<void>;
  loading: boolean;
}

export function useVenueWall(venueKey?: string): UseVenueWallResult {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Find venue by slug
  useEffect(() => {
    if (!venueKey) {
      setLoading(false);
      return;
    }

    const findVenue = async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('slug', venueKey)
        .single();

      if (error) {
        console.error('Error finding venue:', error);
        setLoading(false);
        return;
      }

      setVenue(data);
      setLoading(false);
    };

    findVenue();
  }, [venueKey]);

  // Subscribe to submissions for this venue
  useEffect(() => {
    if (!venue?.id) return;

    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setSubmissions(data.slice(0, 20));
      }
    };

    fetchSubmissions();

    const channel = supabase
      .channel(`wall-${venue.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions',
        },
        (payload) => {
          if (payload.new) {
            setSubmissions(prev => [payload.new as Submission, ...prev.slice(0, 49)]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [venue?.id]);

  const submitComment = useCallback(async (content: string) => {
    if (!venue?.id || !content.trim()) return;

    try {
      console.log('Would submit comment:', content, 'for venue:', venue.name);

      const mockSubmission: Submission = {
        id: Date.now().toString(),
        session_id: 'demo-session',
        player_id: 'demo-player',
        round_number: null,
        content: content.trim(),
        metadata: {},
        vote_count: 0,
        is_winner: false,
        is_moderated: false,
        moderation_result: null,
        created_at: new Date().toISOString(),
      };

      setSubmissions(prev => [mockSubmission, ...prev]);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  }, [venue?.id, venue?.name]);

  return {
    venue,
    submissions,
    submitComment,
    loading,
  };
}

