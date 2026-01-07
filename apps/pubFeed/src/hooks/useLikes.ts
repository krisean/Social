// Likes hook - toggle likes with optimistic updates

import { useState, useCallback } from 'react';
import { supabasePost, supabaseDelete } from '../utils/fetchHelpers';
import { useAuth } from '../providers';

interface UseLikesResult {
  isLiked: boolean;
  likeCount: number;
  toggleLike: () => Promise<void>;
  loading: boolean;
}

export function useLikes(postId: string, initialLiked: boolean, initialCount: number): UseLikesResult {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const toggleLike = useCallback(async () => {
    if (!user || loading) return;

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setLoading(true);

    try {
      if (isLiked) {
        // Unlike
        await supabaseDelete(
          `/rest/v1/feed_likes?post_id=eq.${postId}&user_id=eq.${user.id}`
        );
      } else {
        // Like
        await supabasePost('/rest/v1/feed_likes', {
          post_id: postId,
          user_id: user.id,
        }, false); // false = don't return representation
      }
    } catch (err) {
      // Rollback on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      console.error('Error toggling like:', err);
    } finally {
      setLoading(false);
    }
  }, [user, postId, isLiked, likeCount, loading]);

  return {
    isLiked,
    likeCount,
    toggleLike,
    loading,
  };
}
