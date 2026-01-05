// Comment Card - Twitter-style card for comment content

import { useState, useEffect } from 'react';
import { useLikes, useComments } from '../../hooks';
import type { CommentContent } from '../../types';
import { useTheme } from '../../shared/providers/ThemeProvider';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useAuth } from '../../providers/AuthContext';

interface CommentCardProps {
  content: CommentContent;
  onModalStateChange?: (post: CommentContent | null) => void;
  isModalOnly?: boolean;
}

export function CommentCard({ content, onModalStateChange, isModalOnly = false }: CommentCardProps) {
  const { isLiked, likeCount, toggleLike, loading: likeLoading } = useLikes(
    content.id,
    content.isLikedByCurrentUser,
    content.likeCount
  );
  const { comments, loading, error, createComment, deleteComment } = useComments(content.id);
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFullScreenComments, setShowFullScreenComments] = useState(false);

  // Use actual comment count from loaded comments, fallback to content.commentCount
  const actualCommentCount = comments.length || content.commentCount || 0;


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

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // If modal only, render just the modal
  if (isModalOnly) {
    return (
      <div className={`w-full max-w-md h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
        !isDark ? 'bg-white' : 'bg-slate-800'
      }`}>
        {/* Header - Facebook style */}
        <div className="border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          {/* Navigation bar */}
          <div className="flex items-center p-4">
            <button
              onClick={() => {
                setShowFullScreenComments(false);
                onModalStateChange?.(null);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110 mr-4 ${
                !isDark ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${!isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Comments
                </span>
              </div>
            </div>
          </div>

          {/* Original post content */}
          <div className="px-4 pb-4">
            <div className="flex space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg ${
                    getAvatarColor(content.author.username)
                  }`}
                >
                  <span className="text-white font-bold text-sm drop-shadow">
                    {content.author.username[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              </div>

              {/* Post content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center space-x-1 mb-1">
                  <span className={`font-bold text-sm ${!isDark ? 'text-slate-900' : 'text-cyan-300'}`}>
                    {content.author.displayName || content.author.username}
                  </span>
                  <span className={`text-xs ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>·</span>
                  <span className={`text-xs ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                    {formatTime(content.createdAt)}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  !isDark ? 'text-slate-900' : 'text-cyan-100'
                }`}>
                  {content.content}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className={`flex items-center space-x-1 ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>{content.likeCount}</span>
                  </span>
                  <span className={`flex items-center space-x-1 ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                    <span>{actualCommentCount}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments list - scrollable middle section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
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
                No comments yet. Be the first to comment!
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
        </div>

        {/* Comment form - fixed at bottom */}
        <div className={`flex-shrink-0 border-t p-4 ${
          !isDark ? 'border-slate-200 bg-white' : 'border-slate-700 bg-slate-800'
        }`}>
          <CommentForm postId={content.id} onSubmit={createComment} showFooter={false} />
        </div>
      </div>
    );
  }

  return (
    <>
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

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
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

            {/* Comment button */}
            <button
              onClick={() => {
                setShowFullScreenComments(true);
                onModalStateChange?.(content);
              }}
              className={`flex items-center space-x-1 transition-all duration-200 hover:scale-110 rounded-lg px-2 py-1 ${
                !isDark ? 'hover:bg-amber-100/50 text-slate-500 hover:text-slate-700' : 'hover:bg-cyan-900/30 text-cyan-400 hover:text-cyan-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {actualCommentCount > 0 && (
                <span className="text-sm font-medium">
                  {actualCommentCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Full-screen comment modal - only render when isModalOnly */}
      {showFullScreenComments && isModalOnly && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
          <div className={`w-full max-w-md h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
            !isDark ? 'bg-white' : 'bg-slate-800'
          }`}>
            {/* Header - Facebook style */}
            <div className="border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              {/* Navigation bar */}
              <div className="flex items-center p-4">
                <button
                  onClick={() => {
                    setShowFullScreenComments(false);
                    onModalStateChange?.(null);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110 mr-4 ${
                    !isDark ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className={`text-sm ${!isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Comments
                    </span>
                  </div>
                </div>
              </div>

              {/* Original post content */}
              <div className="px-4 pb-4">
                <div className="flex space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg ${
                        getAvatarColor(content.author.username)
                      }`}
                    >
                      <span className="text-white font-bold text-sm drop-shadow">
                        {content.author.username[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>

                  {/* Post content */}
                  <div className="flex-1 min-w-0">
                    {/* Author and timestamp */}
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-semibold text-sm ${
                        !isDark ? 'text-slate-900' : 'text-cyan-300'
                      }`}>
                        {content.author.displayName || content.author.username}
                      </span>
                      {content.author.isAnonymous && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          !isDark ? 'bg-slate-100 text-slate-600' : 'bg-slate-700/60 text-cyan-400'
                        }`}>
                          Guest
                        </span>
                      )}
                      <span className={`text-xs ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>·</span>
                      <span className={`text-xs ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                        {formatTime(content.createdAt)}
                      </span>
                    </div>

                    {/* Post text */}
                    <p className={`text-sm leading-relaxed mb-3 ${
                      !isDark ? 'text-slate-900' : 'text-cyan-100'
                    }`}>
                      {content.content}
                    </p>

                    {/* Engagement stats */}
                    <div className="flex items-center space-x-4 text-xs">
                      <div className={`flex items-center space-x-1 ${
                        !isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{likeCount}</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${
                        !isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{actualCommentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments list - scrollable middle section */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
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
                    No comments yet. Be the first to comment!
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
            </div>

            {/* Comment form - fixed at bottom */}
            <div className={`flex-shrink-0 border-t p-4 ${
              !isDark ? 'border-slate-200 bg-white' : 'border-slate-700 bg-slate-800'
            }`}>
              <CommentForm postId={content.id} onSubmit={createComment} showFooter={false} />
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
