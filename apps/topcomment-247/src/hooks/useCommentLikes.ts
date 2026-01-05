// Comment Likes hook - toggle comment likes with optimistic updates

import { useState, useCallback } from 'react';
import { supabasePost, supabaseDelete } from '../utils/fetchHelpers';
import { useAuth } from '../providers/AuthContext';

interface UseCommentLikesResult {
  isLiked: boolean;
  likeCount: number;
  toggleLike: () => Promise<void>;
  loading: boolean;
}

export function useCommentLikes(
  commentId: string,
  initialLiked: boolean,
  initialCount: number
): UseCommentLikesResult {
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
          `/rest/v1/feed_comment_likes?comment_id=eq.${commentId}&user_id=eq.${user.id}`
        );
      } else {
        // Like
        await supabasePost('/rest/v1/feed_comment_likes', {
          comment_id: commentId,
          user_id: user.id,
        }, false); // false = don't return representation
      }
    } catch (err) {
      // Rollback on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      console.error('Error toggling comment like:', err);
    } finally {
      setLoading(false);
    }
  }, [user, commentId, isLiked, likeCount, loading]);

  return {
    isLiked,
    likeCount,
    toggleLike,
    loading,
  };
}
