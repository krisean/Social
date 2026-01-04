// Authentication Modal with Sign In/Up and Anonymous options

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../providers/AuthContext';
import { useTheme } from '../../shared/providers/ThemeProvider';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { isDark } = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, signInAnonymously } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        await signUp(email, password, username);
      }
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setError(null);
    setLoading(true);

    try {
      await signInAnonymously();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue as guest');
    } finally {
      setLoading(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      backgroundColor: !isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)'
    }}>
      <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl ${
        !isDark ? 'bg-white' : 'bg-slate-800'
      }`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className={`text-xl font-semibold flex-1 text-center ${
            !isDark ? 'text-slate-900' : 'text-white'
          }`}>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className={`-mr-2 h-8 w-8 rounded-full flex items-center justify-center text-xl transition hover:scale-110 ${
              !isDark ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
            }`}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <>
        <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className={`rounded-lg p-3 text-sm ${
            !isDark
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-red-900/20 text-red-400 border border-red-800/30'
          }`}>
            {error}
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <label htmlFor="username" className={`block text-sm font-medium mb-1 ${
              !isDark ? 'text-slate-900' : 'text-white'
            }`}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                !isDark
                  ? 'border border-slate-300 bg-white text-slate-900 focus:ring-amber-500 focus:border-amber-500'
                  : 'border border-slate-600 bg-slate-700 text-white focus:ring-cyan-500 focus:border-cyan-500'
              }`}
              required
              maxLength={20}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className={`block text-sm font-medium mb-1 ${
            !isDark ? 'text-slate-900' : 'text-white'
          }`}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              !isDark
                ? 'border border-slate-300 bg-white text-slate-900 focus:ring-amber-500 focus:border-amber-500'
                : 'border border-slate-600 bg-slate-700 text-white focus:ring-cyan-500 focus:border-cyan-500'
            }`}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className={`block text-sm font-medium mb-1 ${
            !isDark ? 'text-slate-900' : 'text-white'
          }`}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              !isDark
                ? 'border border-slate-300 bg-white text-slate-900 focus:ring-amber-500 focus:border-amber-500'
                : 'border border-slate-600 bg-slate-700 text-white focus:ring-cyan-500 focus:border-cyan-500'
            }`}
            required
            minLength={6}
          />
          {mode === 'signup' && (
            <p className={`mt-1 text-xs ${
              !isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              At least 6 characters
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            !isDark
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 shadow-lg hover:from-amber-600 hover:to-yellow-500 focus:ring-amber-500'
              : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-white shadow-lg hover:from-cyan-600 hover:to-teal-500 focus:ring-cyan-500'
          }`}
        >
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${
              !isDark ? 'border-slate-300' : 'border-slate-600'
            }`} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${
              !isDark ? 'bg-white text-slate-500' : 'bg-slate-800 text-slate-400'
            }`}>
              Or
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAnonymous}
          disabled={loading}
          className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            !isDark
              ? 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus:ring-amber-500'
              : 'border border-slate-600 bg-slate-700 text-white hover:bg-slate-600 focus:ring-cyan-500'
          }`}
        >
          Continue as Guest
        </button>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className={`underline hover:no-underline ${
              !isDark ? 'text-amber-600 hover:text-amber-700' : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </form>

        {mode === 'signin' && (
          <p className={`mt-4 text-xs text-center ${
            !isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Guest mode allows you to post without an account, but your session won't persist.
          </p>
        )}
        </>
      </div>
    </div>,
    document.body,
  );
}
