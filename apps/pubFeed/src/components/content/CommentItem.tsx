// Comment Item - Individual comment display with like button

import { useState, useEffect } from 'react';
import { useCommentLikes } from '../../hooks/useCommentLikes';
import { useTheme } from '../../shared/providers/ThemeProvider';
import type { Comment } from '../../types';

interface CommentItemProps {
  comment: Comment;
  onReply?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  canDelete?: boolean;
}

export function CommentItem({ comment, onReply, onDelete, canDelete }: CommentItemProps) {
  const { isLiked, likeCount, toggleLike, loading: likeLoading } = useCommentLikes(
    comment.id,
    comment.isLikedByCurrentUser,
    comment.likeCount
  );
  const { isDark } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  // Format relative time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
  };

  // Generate avatar color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      'from-cyan-400 to-cyan-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Handle like animation
  useEffect(() => {
    if (isLiked) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLiked]);

  return (
    <div className="flex space-x-3 py-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br shadow-md ring-1 transition-all duration-300 ${
            !isDark ? 'ring-amber-200/50' : 'ring-cyan-400/20'
          } ${getAvatarColor(comment.author.username)}`}
        >
          <span className="text-white font-bold text-xs drop-shadow">
            {comment.author.username[0]?.toUpperCase() || '?'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className={`font-semibold text-sm ${
            !isDark ? 'text-slate-900' : 'text-cyan-300'
          }`}>
            {comment.author.displayName || comment.author.username}
          </span>
          {comment.author.isAnonymous && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              !isDark ? 'bg-slate-100 text-slate-600' : 'bg-slate-700/60 text-cyan-400'
            }`}>
              Guest
            </span>
          )}
          <span className={`text-xs ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
            {formatTime(comment.createdAt)}
          </span>
        </div>

        <p className={`text-sm mb-2 whitespace-pre-wrap break-words ${
          !isDark ? 'text-slate-800' : 'text-cyan-100'
        }`}>
          {comment.content}
        </p>

        <div className="flex items-center space-x-4">
          {/* Like button */}
          <button
            onClick={toggleLike}
            disabled={likeLoading}
            className={`flex items-center space-x-1 text-xs transition-all disabled:opacity-50 hover:scale-105 rounded px-1.5 py-0.5 ${
              !isDark ? 'hover:bg-amber-100/50' : 'hover:bg-cyan-900/30'
            } ${isAnimating ? 'animate-pulse' : ''}`}
            style={{ color: isLiked ? '#ef4444' : (!isDark ? '#64748b' : '#94a3b8') }}
          >
            <svg
              className={`w-4 h-4 transition-all ${
                isLiked ? `fill-current scale-110 ${isAnimating ? 'animate-bounce' : ''}` : 'fill-none stroke-current'
              }`}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {likeCount > 0 && (
              <span className={`${
                isLiked ? 'font-semibold' : ''
              }`}>
                {likeCount}
              </span>
            )}
          </button>

          {/* Reply button */}
          {onReply && (
            <button
              onClick={() => onReply(comment.id)}
              className={`text-xs transition-colors font-medium ${
                !isDark ? 'text-slate-500 hover:text-slate-700' : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              Reply
            </button>
          )}

          {/* Delete button */}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              disabled={comment.id.startsWith('temp-')}
              className={`text-xs transition-colors font-medium ${
                comment.id.startsWith('temp-')
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-red-500 hover:text-red-700'
              }`}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
