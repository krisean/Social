// Comment Section - Display and manage comments on a post

import { useState } from 'react';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../providers/AuthContext';
import { useTheme } from '../../shared/providers/ThemeProvider';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';

interface CommentSectionProps {
  postId: string;
  commentCount: number;
  isCompact?: boolean;
  showComments?: boolean;
  onToggleComments?: () => void;
}

export function CommentSection({ postId, commentCount, isCompact = false, showComments: externalShowComments, onToggleComments }: CommentSectionProps) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { comments, loading, error, createComment, deleteComment } = useComments(postId);
  const [internalShowComments, setInternalShowComments] = useState(false);

  // Use external showComments if provided, otherwise use internal state
  const showComments = externalShowComments !== undefined ? externalShowComments : internalShowComments;

  const handleToggleComments = () => {
    if (externalShowComments !== undefined && onToggleComments) {
      onToggleComments();
    } else {
      setInternalShowComments(!internalShowComments);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const totalComments = commentCount || comments.length;


  return (
    <div className={isCompact || showComments ? "" : "border-t border-slate-200 dark:border-slate-700 pt-4 mt-4"}>
      {/* Comments header - hide when controlled externally */}
      {externalShowComments === undefined && (
        <button
          onClick={handleToggleComments}
          className={`flex items-center space-x-2 mb-4 transition-all hover:scale-105 ${
            !isDark ? 'text-slate-600 hover:text-slate-800' : 'text-cyan-400 hover:text-cyan-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-semibold">
            {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${showComments ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Comments list */}
      {showComments && (
        <div className="space-y-2 mb-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className={`animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent ${
                !isDark ? 'text-amber-500' : 'text-cyan-400'
              }`}></div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500 text-sm">
              Error loading comments. Please try again.
            </div>
          ) : comments.length === 0 ? (
            <div className={`text-center py-4 text-sm ${
              !isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              No comments yet
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                canDelete={user?.id === comment.author.id}
                onDelete={handleDeleteComment}
              />
            ))
          )}
        </div>
      )}

      {/* Comment form - always visible when comments are expanded */}
      {showComments && (
        <CommentForm postId={postId} onSubmit={createComment} />
      )}
    </div>
  );
}
