import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import type { Submission, Venue } from '@social/db';

interface UseVenueWallResult {
  venue: Venue | null;
  submissions: Submission[];
  submitComment: (content: string) => Promise<void>;
  loading: boolean;
}

export function useVenueSession(venueKey?: string): UseVenueWallResult {
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

    // For now, we'll create a simple wall where submissions are tied directly to venue
    // This is a simplified approach - in production you'd want proper session management
    const fetchSubmissions = async () => {
      // For the demo, we'll fetch all submissions and filter by venue
      // In production, you'd want a proper venue_submissions table or session-based approach
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          players!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        // Filter submissions that might be related to this venue
        // This is a temporary solution - proper implementation would need venue-specific submissions
        setSubmissions(data.slice(0, 20)); // Just show recent submissions for demo
      }
    };

    fetchSubmissions();

    // Listen for new submissions
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

  // Submit comment function - simplified for demo
  const submitComment = useCallback(async (content: string) => {
    if (!venue?.id || !content.trim()) return;

    try {
      // For demo purposes, create a mock submission
      // In production, this would create proper player and submission records
      console.log('Would submit comment:', content, 'for venue:', venue.name);

      // Temporary: just add to local state for demo
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

