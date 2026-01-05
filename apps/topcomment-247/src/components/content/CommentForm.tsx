// Comment Form - Handle creating new comments
import { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthContext';
import { useTheme } from '../../shared/providers/ThemeProvider';
import type { CreateCommentData } from '../../types';

interface CommentFormProps {
  postId: string;
  onSubmit: (data: CreateCommentData) => Promise<void>;
  showFooter?: boolean;
}

export function CommentForm({ postId, onSubmit, showFooter = true }: CommentFormProps) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset animation after it completes
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 800); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || submitting) return;

    setSubmitting(true);
    setIsAnimating(true); // Trigger animation
    try {
      const commentData: CreateCommentData = {
        postId,
        content: newComment.trim()
      };
      await onSubmit(commentData);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    if (!showFooter) return null;

    return (
      <div className="border-t border-slate-200 dark:border-slate-700 mt-4">
        <div className={`text-center py-4 text-sm ${
          !isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Sign in to comment
        </div>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className={showFooter ? "p-4" : ""}>
      <div className="relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={1}
          className={`w-full p-3 pr-12 rounded-lg border resize-none transition-colors min-h-[44px] overflow-hidden ${
            !isDark
              ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200'
              : 'border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-900'
          }`}
          style={{ height: 'auto', minHeight: '44px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 120) + 'px'; // Max height of ~4 lines
          }}
          required
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className={`absolute bottom-4 right-3 p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-full ${
            !isDark
              ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
              : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/50'
          }`}
        >
          <style>
            {`
              @keyframes submit-clink {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
              @keyframes submit-clink-upper {
                0% { transform: scale(1); }
                20% { transform: scale(1.1) rotate(-2deg); }
                40% { transform: scale(1.2) rotate(-3deg); }
                60% { transform: scale(1.15) rotate(-1deg); }
                100% { transform: scale(1); }
              }
              .submit-clink {
                animation: submit-clink 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
              }
              .submit-clink-upper {
                animation: submit-clink-upper 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.05s both;
              }
            `}
          </style>
          {submitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          ) : (
            <svg
              className={`w-5 h-5 ${isAnimating ? 'submit-clink' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Upper arc */}
              <g className={isAnimating ? 'submit-clink-upper' : ''}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.5 3.5c2.2 2.8 3.6 4.8 3.6 7.4s-1.4 4.6-3.6 7.4"
                />
              </g>
              {/* Lower arc */}
              <g className={isAnimating ? 'submit-clink' : ''}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.5 9.5c-2.2 2.8-3.6 4.8-3.6 7.4s1.4 4.6 3.6 7.4"
                />
              </g>
            </svg>
          )}
        </button>
      </div>
    </form>
  );

  if (!showFooter) {
    return formContent;
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 mt-4">
      {formContent}
    </div>
  );
}