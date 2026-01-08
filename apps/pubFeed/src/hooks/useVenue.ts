// Venue hook - fetch venue by slug

import { useState, useEffect } from 'react';
import { supabaseFetch } from '../utils/fetchHelpers';
import type { Venue } from '../types';

interface UseVenueResult {
  venue: Venue | null;
  loading: boolean;
  error: Error | null;
}

export function useVenue(venueSlug?: string): UseVenueResult {

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(!!venueSlug);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!venueSlug) {
      setVenue(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let cancelled = false;

    const fetchVenue = async () => {
      try {
        // Use direct fetch helper
        const results = await supabaseFetch(`/rest/v1/venues?slug=eq.${venueSlug}`);
        const data = results[0]; // PostgREST returns array, take first item
        const fetchError = data ? null : new Error('Venue not found');

        if (fetchError) throw fetchError;

        if (!cancelled && data) {
          setVenue({
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description || undefined,
            features: (data.features as any) || { comments: true },
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch venue'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchVenue();

    return () => {
      cancelled = true;
    };
  }, [venueSlug]);

  return { venue, loading, error };
}
