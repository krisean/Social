// Comment Card - Twitter-style card for comment content

import { useState, useEffect } from 'react';
import { useLikes } from '../../hooks';
import type { CommentContent } from '../../types';
import { useTheme } from '../../shared/providers/ThemeProvider';

interface CommentCardProps {
  content: CommentContent;
}

export function CommentCard({ content }: CommentCardProps) {
  const { isLiked, likeCount, toggleLike, loading: likeLoading } = useLikes(
    content.id,
    content.isLikedByCurrentUser,
    content.likeCount
  );
  const { isDark } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle like animation
  useEffect(() => {
    if (isLiked) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000); // Stop after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isLiked]);

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

  return (
    <div className={`transition-all duration-300 group ${
      !isDark ? 'hover:bg-amber-50/20' : 'hover:bg-cyan-900/5'
    } px-4 py-6`}>
      <div className="flex space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg ring-2 transition-all duration-300 ${
              !isDark ? 'ring-amber-200/50 group-hover:ring-amber-300/70' : 'ring-cyan-400/30 group-hover:ring-cyan-300/50'
            } ${getAvatarColor(content.author.username)}`}
          >
            <span className="text-white font-bold text-sm drop-shadow">
              {content.author.username[0]?.toUpperCase() || '?'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          {/* Author and timestamp */}
          <div className="flex items-center space-x-2 mb-2">
            <span className={`font-bold text-base group-hover:scale-105 transition-transform duration-200 ${
              !isDark ? 'text-slate-900' : 'text-cyan-300'
            }`}>
              {content.author.displayName || content.author.username}
            </span>
            {content.author.isAnonymous && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                !isDark ? 'bg-slate-100 text-slate-600' : 'bg-slate-700/60 text-cyan-400'
              }`}>
                Guest
              </span>
            )}
            <span className={`text-sm ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>·</span>
            <span className={`text-sm ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
              {formatTime(content.createdAt)}
            </span>
          </div>

          {/* Post content */}
          <p className={`mb-4 text-base leading-relaxed whitespace-pre-wrap break-words group-hover:text-lg transition-all duration-200 ${
            !isDark ? 'text-slate-900' : 'text-cyan-100'
          }`}>
            {content.content}
          </p>

          {/* Like button */}
          <button
            onClick={toggleLike}
            disabled={likeLoading}
            className={`flex items-center space-x-1 transition-all duration-200 disabled:opacity-50 group/like hover:scale-110 rounded-lg px-2 py-1 ${
              !isDark ? 'hover:bg-amber-100/50' : 'hover:bg-cyan-900/30'
            } ${isAnimating ? 'animate-pulse' : ''}`}
            style={{ color: isLiked ? '#ef4444' : (!isDark ? '#64748b' : '#94a3b8') }}
          >
            <svg
              className={`w-5 h-5 transition-all duration-300 group-hover/like:scale-125 ${
                isLiked ? `fill-current text-red-500 drop-shadow-sm scale-110 ${isAnimating ? 'animate-bounce' : ''}` : 'fill-none stroke-current'
              }`}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                fill={isLiked ? 'currentColor' : 'none'}
              />
            </svg>
            {likeCount > 0 && (
              <span className={`text-sm font-medium transition-all duration-200 ${
                isLiked ? 'text-red-500 font-semibold' : `group-hover/like:${!isDark ? 'text-amber-600' : 'text-cyan-400'}`
              }`}>
                {likeCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
