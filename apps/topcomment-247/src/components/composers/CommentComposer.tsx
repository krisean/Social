// Comment Composer - Create new comments

import { useState } from 'react';
import { useTheme } from '../../shared/providers/ThemeProvider';

interface CommentComposerProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  maxLength?: number;
}

export function CommentComposer({
  onSubmit,
  placeholder = "What's happening?",
  maxLength = 280,
}: CommentComposerProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className={`rounded-2xl p-4 text-sm ${
          !isDark ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-red-900/20 text-red-400 border border-red-800/30'
        }`}>
          {error}
        </div>
      )}

      <div className={`rounded-2xl p-4 space-y-4 ${
        !isDark ? 'bg-amber-50/60 border border-amber-200/50' : 'bg-slate-800/60 border border-cyan-400/30'
      }`}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className={`w-full resize-none border-0 focus:ring-0 focus:outline-none placeholder-current/50 bg-transparent ${
            !isDark ? 'text-slate-900 placeholder-slate-500' : 'text-cyan-100 placeholder-cyan-400/50'
          }`}
        />

        <div className={`flex justify-between items-center pt-4 ${
          !isDark ? 'border-t border-amber-200/50' : 'border-t border-cyan-400/30'
        }`}>
          <span className={`text-sm ${
            !isDark ? 'text-slate-700' : 'text-cyan-400'
          }`}>
            {content.length}/{maxLength}
          </span>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              !isDark
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-900 shadow-lg shadow-amber-500/30 focus-visible:outline-amber-500 hover:shadow-xl hover:shadow-amber-500/50'
                : 'bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-300 text-slate-900 shadow-lg shadow-cyan-500/30 focus-visible:outline-cyan-500 hover:shadow-xl hover:shadow-cyan-500/50'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                <span>Posting...</span>
              </div>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
