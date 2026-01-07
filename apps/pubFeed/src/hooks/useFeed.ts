// Feed hook - fetch and manage feed posts

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase/client';
import { supabaseFetch, supabasePost } from '../utils/fetchHelpers';
import { useAuth } from '../providers';
import type { Content, CreateContentInput } from '../types';

interface UseFeedResult {
  posts: Content[];
  loading: boolean;
  error: Error | null;
  submitPost: (input: Omit<CreateContentInput, 'venueId'>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFeed(venueId: string): UseFeedResult {
  const [posts, setPosts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, loading: authLoading } = useAuth();
  // Use ref to track current user ID for real-time subscription callbacks
  const userRef = useRef(user?.id);
  
  // Update ref when user changes
  useEffect(() => {
    userRef.current = user?.id;
  }, [user?.id]);

  // Transform database row to Content type
  const transformPost = useCallback((row: any, currentUserId?: string): Content => {
    return {
      id: row.id,
      contentType: row.content_type,
      content: row.content,
      author: {
        id: row.feed_users.id,
        username: row.feed_users.username,
        displayName: row.feed_users.display_name || undefined,
        avatarUrl: row.feed_users.avatar_url || undefined,
        isAnonymous: row.feed_users.is_anonymous,
        authUserId: row.feed_users.auth_user_id || undefined,
        createdAt: row.feed_users.created_at,
        lastActiveAt: row.feed_users.last_active_at,
      },
      venueId: row.venue_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      likeCount: row.feed_likes?.length || 0,
      commentCount: row.comment_count || 0,
      isLikedByCurrentUser: currentUserId
        ? row.feed_likes?.some((like: any) => like.user_id === currentUserId)
        : false,
      metadata: row.metadata,
    };
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use direct fetch helper
      const data = await supabaseFetch(
        `/rest/v1/feed_posts?venue_id=eq.${venueId}&select=*,feed_users(*),feed_likes(user_id)&order=created_at.desc&limit=50`
      );

      if (data) {
        const transformedPosts = data.map((row: any) => transformPost(row, user?.id));
        setPosts(transformedPosts);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
    }
  }, [venueId, user?.id, transformPost]);

  // Clear posts when venue or user changes, then fetch
  useEffect(() => {
    setPosts([]);
    setError(null);
  }, [venueId, user?.id]);

  // Fetch posts when auth loading completes or dependencies change
  useEffect(() => {
    if (!authLoading) {
      fetchPosts();
    }
  }, [authLoading, user?.id, venueId, fetchPosts]);

  // Temporary type assertion to bypass TypeScript resolution issues
  const typedSupabase = supabase as any;

  // Real-time subscription - only after auth loading completes
  useEffect(() => {
    if (authLoading) return;

    const channel = typedSupabase
      .channel(`venue-feed-${venueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feed_posts',
          filter: `venue_id=eq.${venueId}`,
        },
        async (payload: any) => {
          // Fetch the full post with relations
          // Use ref to get current user ID (avoids stale closure)
          const currentUserId = userRef.current;

          try {
            const data = await supabaseFetch(
              `/rest/v1/feed_posts?id=eq.${payload.new.id}&select=*,feed_users(*),feed_likes(user_id)`
            );
            
            if (data && data[0]) {
              const newPost = transformPost(data[0], currentUserId);
              setPosts((prev) => [newPost, ...prev.slice(0, 49)]);
            }
          } catch (err) {
            console.error('Failed to fetch new post:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'feed_posts',
          filter: `venue_id=eq.${venueId}`,
        },
        async (payload: any) => {
          // Refetch updated post
          // Use ref to get current user ID (avoids stale closure)
          const currentUserId = userRef.current;

          try {
            const data = await supabaseFetch(
              `/rest/v1/feed_posts?id=eq.${payload.new.id}&select=*,feed_users(*),feed_likes(user_id)`
            );
            
            if (data && data[0]) {
              const updatedPost = transformPost(data[0], currentUserId);
              setPosts((prev) =>
                prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
              );
            }
          } catch (err) {
            console.error('Failed to fetch updated post:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'feed_likes',
        },
        async (payload: any) => {
          // When a like is added/removed, update the affected post
          const postId = payload.new?.post_id || payload.old?.post_id;
          if (postId) {
            const currentUserId = userRef.current;

            try {
              const data = await supabaseFetch(
                `/rest/v1/feed_posts?id=eq.${postId}&select=*,feed_users(*),feed_likes(user_id)`
              );

              if (data && data[0]) {
                const updatedPost = transformPost(data[0], currentUserId);
                setPosts((prev) =>
                  prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
                );
              }
            } catch (err) {
              console.error('Failed to fetch updated post after like change:', err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [venueId, transformPost, authLoading]);

  // Submit new post
  const submitPost = useCallback(
    async (input: Omit<CreateContentInput, 'venueId'>) => {
      if (!user) {
        throw new Error('Must be authenticated to post');
      }

      try {
        await supabasePost('/rest/v1/feed_posts', {
          venue_id: venueId,
          author_id: user.id,
          content_type: input.contentType,
          content: input.content,
          metadata: input.metadata || {},
        }, false); // false = don't return representation

        // Post will be added via real-time subscription
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to submit post');
      }
    },
    [venueId, user]
  );

  return {
    posts,
    loading,
    error,
    submitPost,
    refresh: fetchPosts,
  };
}
