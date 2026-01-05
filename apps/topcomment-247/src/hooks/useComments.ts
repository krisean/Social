// Comments hook - fetch and manage comments on posts

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase/client';
import { supabaseFetch, supabasePost, supabaseDelete } from '../utils/fetchHelpers';
import { useAuth } from '../providers/AuthContext';
import type { Comment, CreateCommentData } from '../types';

interface UseCommentsResult {
  comments: Comment[];
  loading: boolean;
  error: Error | null;
  createComment: (data: CreateCommentData) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  refreshComments: () => Promise<void>;
}

export function useComments(postId: string): UseCommentsResult {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const userRef = useRef(user?.id);

  // Update ref when user changes
  useEffect(() => {
    userRef.current = user?.id;
  }, [user?.id]);

  // Transform database row to Comment type
  const transformComment = useCallback((row: any, currentUserId?: string): Comment => {
    return {
      id: row.id,
      postId: row.post_id,
      parentCommentId: row.parent_comment_id,
      content: row.content,
      likeCount: row.feed_comment_likes?.length || 0,
      isLikedByCurrentUser: currentUserId
        ? row.feed_comment_likes?.some((like: any) => like.user_id === currentUserId)
        : false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: {
        id: row.feed_users.id,
        username: row.feed_users.username,
        displayName: row.feed_users.display_name || undefined,
        avatarUrl: row.feed_users.avatar_url || undefined,
        isAnonymous: row.feed_users.is_anonymous,
        authUserId: row.feed_users.auth_user_id || undefined,
        createdAt: row.feed_users.created_at,
        lastActiveAt: row.feed_users.last_active_at,
      }
    };
  }, []);

  // Fetch comments for a post
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await supabaseFetch(
        `/rest/v1/feed_comments?post_id=eq.${postId}&parent_comment_id=is.null&select=*,feed_users(*),feed_comment_likes(user_id)&order=created_at.asc`
      );

      if (data) {
        const transformedComments = data.map((row: any) => transformComment(row, user?.id));
        setComments(transformedComments);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch comments'));
    } finally {
      setLoading(false);
    }
  }, [postId, user?.id, transformComment]);

  // Fetch comments on mount and when dependencies change
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Poll for optimistic comments to upgrade them to real comments
  useEffect(() => {
    if (comments.length === 0) return;

    const optimisticComments = comments.filter(comment => comment.id.startsWith('temp-'));
    if (optimisticComments.length === 0) return;

    const pollInterval = setInterval(async () => {
      if (!userRef.current) return;

      for (const optimistic of optimisticComments) {
        try {
          // Try to find recently created comments by this user on this post
          const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
          const searchData = await supabaseFetch(
            `/rest/v1/feed_comments?author_id=eq.${userRef.current}&post_id=eq.${optimistic.postId}&created_at=gte.${oneMinuteAgo}&select=*,feed_users(*),feed_comment_likes(user_id)&order=created_at.desc&limit=5`
          );

          if (searchData && searchData.length > 0) {
            // Find the comment that matches our optimistic content
            const matchingComment = searchData.find((row: any) =>
              row.content.trim() === optimistic.content.trim()
            );

            if (matchingComment) {
              const realComment = transformComment(matchingComment, userRef.current);

              // Replace the optimistic comment with the real one
              setComments((prev) =>
                prev.map(comment =>
                  comment.id === optimistic.id ? realComment : comment
                )
              );
            }
          }
        } catch (err) {
          console.warn('Polling error:', err);
        }
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [comments, transformComment]);

  // Real-time subscription for new comments
  useEffect(() => {
    const typedSupabase = supabase as any;
    
    const channel = typedSupabase
      .channel(`post-comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feed_comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload: any) => {
          const currentUserId = userRef.current;

          try {
            const data = await supabaseFetch(
              `/rest/v1/feed_comments?id=eq.${payload.new.id}&select=*,feed_users(*),feed_comment_likes(user_id)`
            );

            if (data && data[0]) {
              const newComment = transformComment(data[0], currentUserId);
              // Only add if it's a top-level comment (no parent)
              if (!newComment.parentCommentId) {
                setComments((prev) => {
                  // Replace any optimistic comment with the same content
                  const withoutOptimistic = prev.filter(comment =>
                    !(comment.id.startsWith('temp-') && comment.content === newComment.content)
                  );
                  return [...withoutOptimistic, newComment];
                });
              }
            }
          } catch (err) {
            console.error('Failed to fetch new comment:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'feed_comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload: any) => {
          setComments((prev) => prev.filter(comment => comment.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'feed_comment_likes',
        },
        async (payload: any) => {
          // When a comment like is added/removed, update the affected comment
          const commentId = payload.new?.comment_id || payload.old?.comment_id;
          if (commentId) {
            const currentUserId = userRef.current;

            try {
              const data = await supabaseFetch(
                `/rest/v1/feed_comments?id=eq.${commentId}&select=*,feed_users(*),feed_comment_likes(user_id)`
              );

              if (data && data[0]) {
                const updatedComment = transformComment(data[0], currentUserId);
                setComments((prev) =>
                  prev.map((comment) => (comment.id === updatedComment.id ? updatedComment : comment))
                );
              }
            } catch (err) {
              console.error('Failed to fetch updated comment after like change:', err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [postId, transformComment]);

  // Create a new comment
  const createComment = useCallback(async (data: CreateCommentData) => {
    if (!user) throw new Error('User must be authenticated');

    // Create optimistic comment object
    const optimisticComment = {
      id: `temp-${Date.now()}`, // Temporary ID
      postId: data.postId,
      parentCommentId: data.parentCommentId || undefined,
      content: data.content,
      likeCount: 0,
      isLikedByCurrentUser: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isAnonymous: user.isAnonymous,
        authUserId: user.authUserId,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
      }
    };

    // Add optimistic comment immediately
    if (!data.parentCommentId) {
      setComments((prev) => [...prev, optimisticComment]);
    }

    try {
      await supabasePost('/rest/v1/feed_comments', {
        post_id: data.postId,
        author_id: user.id,
        content: data.content,
        parent_comment_id: data.parentCommentId || null
      }, false); // false = don't return representation

      // Real-time subscription will update with correct data
    } catch (err) {
      // Remove optimistic comment on error
      setComments((prev) => prev.filter(comment => comment.id !== optimisticComment.id));
      throw err instanceof Error ? err : new Error('Failed to create comment');
    }
  }, [user]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string) => {
    // Handle optimistic comments (never saved to database)
    if (commentId.startsWith('temp-')) {
      setComments((prev) => prev.filter(comment => comment.id !== commentId));
      return; // Don't try to delete from database
    }

    // Store the comment for potential rollback
    const commentToDelete = comments.find(comment => comment.id === commentId);

    // Optimistically remove from UI
    setComments((prev) => prev.filter(comment => comment.id !== commentId));

    try {
      await supabaseDelete(
        `/rest/v1/feed_comments?id=eq.${commentId}`
      );
      // Comment will be removed via real-time subscription for other users
    } catch (err) {
      // Restore comment on error
      if (commentToDelete) {
        setComments((prev) => [...prev, commentToDelete]);
      }
      throw err instanceof Error ? err : new Error('Failed to delete comment');
    }
  }, [comments]);

  return {
    comments,
    loading,
    error,
    createComment,
    deleteComment,
    refreshComments: fetchComments
  };
}
