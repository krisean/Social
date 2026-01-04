// Venue Feed component - Main feed UI

import { useState } from 'react';
import { useFeed } from '../hooks';
import { useAuth } from '../providers';
import { ContentCard } from './content';
import { Card } from './Card';
import { AuthModal } from './auth/AuthModal';
import { useTheme } from '../shared/providers/ThemeProvider';
import type { Venue } from '../types';

interface VenueFeedProps {
  venue: Venue;
}

export function VenueFeed({ venue }: VenueFeedProps) {
  const { user, loading: authLoading } = useAuth();
  const { posts, loading, error, submitPost } = useFeed(venue.id);
  const { isDark } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isClinking, setIsClinking] = useState(false);
  const [showToastSuccess, setShowToastSuccess] = useState(false);

  const handleFabClick = () => {
    setIsClinking(true);
    setTimeout(() => setIsClinking(false), 800); // Reset after animation (0.8s)
    user ? setShowPostModal(true) : setShowAuthModal(true);
  };

  const handleSubmit = async (content: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    await submitPost({
      contentType: 'comment',
      content,
    });
  };

  if (authLoading || loading) {
    return (
      <>
        <Card className="space-y-6 backdrop-blur">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 mx-auto" style={{
              borderColor: !isDark ? '#f59e0b' : '#06b6d4',
              borderTopColor: 'transparent'
            }}></div>
          </div>
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Card className="space-y-6 backdrop-blur">
          <div className="text-center py-8">
            <p className={!isDark ? 'text-slate-700' : 'text-cyan-300'}>
              Error: {error.message}
            </p>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="text-center mb-8 relative z-10">
        <h1 className={`text-3xl font-black ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
          {venue.name}
        </h1>
        {venue.description && (
          <p className={`mt-2 text-lg ${!isDark ? 'text-slate-700' : 'text-cyan-300'}`}>
            {venue.description}
          </p>
        )}
      </header>

      {/* Feed Surface - Semi-opaque overlay to isolate from background */}
      <div className="relative z-10 backdrop-blur-sm pb-20" style={{
        backgroundColor: !isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.7)'
      }}>

        {/* Feed */}
        {posts.length === 0 ? (
          <div className={`text-center py-12 px-4 ${
            !isDark ? 'border-slate-100' : 'border-slate-800'
          } border-b`} style={{ borderWidth: '0.5px' }}>
            <p className={`text-lg ${!isDark ? 'text-slate-700' : 'text-cyan-300'}`}>No posts yet</p>
            <p className={`text-sm mt-2 ${!isDark ? 'text-slate-700' : 'text-cyan-400'}`}>
              Be the first to start the conversation!
            </p>
          </div>
        ) : (
          posts.map((post, index) => (
            <div
              key={post.id}
              className={`${
                !isDark ? 'border-slate-100' : 'border-slate-800'
              } ${index === 0 ? 'border-t' : ''} border-b`}
              style={{ borderWidth: '0.5px' }}
            >
              <ContentCard content={post} />
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      {venue.features.comments && (
        <button
          onClick={handleFabClick}
          className={`fixed bottom-6 right-6 z-20 w-14 h-14 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 ${
            !isDark
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 shadow-amber-500/30'
              : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-white shadow-cyan-500/30'
          }`}
          aria-label="Create new post"
        >
          <style>
            {`
              @keyframes cheers-clink {
                0% { transform: translate(0, 0) rotate(0deg); }
                15% { transform: translate(-1px, -1px) rotate(-2deg); }
                30% { transform: translate(-2px, -3px) rotate(-3deg); }
                45% { transform: translate(-1px, -2px) rotate(-1deg); }
                60% { transform: translate(0px, 0px) rotate(0deg); }
                100% { transform: translate(0px, 0px) rotate(0deg); }
              }
              @keyframes cheers-clink-upper {
                0% { transform: translate(0, 0) rotate(0deg); }
                15% { transform: translate(1px, 1px) rotate(2deg); }
                30% { transform: translate(2px, 3px) rotate(3deg); }
                45% { transform: translate(1px, 2px) rotate(1deg); }
                60% { transform: translate(0px, 0px) rotate(0deg); }
                100% { transform: translate(0px, 0px) rotate(0deg); }
              }
              @keyframes spark {
                0% { opacity: 0; transform: scale(0); }
                30% { opacity: 1; transform: scale(1.2); }
                60% { opacity: 0.8; transform: scale(0.8); }
                100% { opacity: 0; transform: scale(0); }
              }
              .cheers-clink {
                animation: cheers-clink 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
              }
              .cheers-clink-upper {
                animation: cheers-clink-upper 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.05s both;
              }
              .spark circle {
                animation: spark-move 0.8s ease-out 0.1s both;
              }
              @keyframes spark-move {
                0% { cx: 8; cy: 8; opacity: 0; r: 0.5; }
                20% { opacity: 1; r: 1; }
                80% { opacity: 1; r: 1; }
                100% { cx: 16; cy: 2; opacity: 0; r: 0.5; }
              }
            `}
          </style>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.75"
            className="w-6 h-6 mx-auto"
          >
            {/* Upper arc (left) - swings downward */}
            <g className={isClinking ? 'cheers-clink-upper' : ''}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.5 2.5c2.2 2.8 3.6 4.8 3.6 7.4s-1.4 4.6-3.6 7.4"
              />
            </g>
            {/* Lower arc (right) - swings upward */}
            <g className={isClinking ? 'cheers-clink' : ''}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.5 8.5c-2.2 2.8-3.6 4.8-3.6 7.4s1.4 4.6 3.6 7.4"
              />
            </g>
            {/* Spark effect at collision point */}
            {isClinking && (
              <g className="spark">
                {/* Circular spark that moves from bottom left to top right */}
                <circle
                  cx="8"
                  cy="8"
                  r="1"
                  fill="currentColor"
                  opacity="0.9"
                />
              </g>
            )}
          </svg>
        </button>
      )}

      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4" style={{
          backgroundColor: !isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)'
        }}>
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl ${!isDark ? 'bg-white' : 'bg-slate-800'}`}>
            {showToastSuccess ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                  <style>
                    {`
                      @keyframes toast-clink {
                        0% { transform: translate(0, 0) rotate(0deg) scale(1); }
                        15% { transform: translate(2px, -6px) rotate(-8deg) scale(1.1); }
                        30% { transform: translate(4px, -10px) rotate(-12deg) scale(1.2); }
                        45% { transform: translate(2px, -8px) rotate(-6deg) scale(1.15); }
                        60% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
                        100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
                      }
                      @keyframes toast-clink-upper {
                        0% { transform: translate(0, 0) rotate(0deg) scale(1); }
                        15% { transform: translate(-2px, 2px) rotate(6deg) scale(0.95); }
                        30% { transform: translate(-4px, 4px) rotate(8deg) scale(0.9); }
                        45% { transform: translate(-2px, 3px) rotate(4deg) scale(0.95); }
                        60% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
                        100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
                      }
                      @keyframes spark-burst {
                        0% { opacity: 0; transform: scale(0) rotate(0deg); }
                        20% { opacity: 1; transform: scale(1) rotate(0deg); }
                        100% { opacity: 0; transform: scale(1.5) rotate(180deg); }
                      }
                      .toast-arc-lower { animation: toast-clink 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
                      .toast-arc-upper { animation: toast-clink-upper 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.1s both; }
                      .spark-particle { animation: spark-burst 0.4s ease-out both; }
                    `}
                  </style>
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-lg"
                  >
                    {/* Upper arc - moves downward */}
                    <g className="toast-arc-upper">
                      <path
                        d="M4.5 3.5c2.2 2.8 3.6 4.8 3.6 7.4s-1.4 4.6-3.6 7.4"
                        stroke={!isDark ? '#f59e0b' : '#06b6d4'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    {/* Lower arc - swings upward */}
                    <g className="toast-arc-lower">
                      <path
                        d="M19.5 9.5c-2.2 2.8-3.6 4.8-3.6 7.4s1.4 4.6 3.6 7.4"
                        stroke={!isDark ? '#f59e0b' : '#06b6d4'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    {/* Spark particles radiating from collision */}
                    <circle className="spark-particle" cx="12" cy="8" r="1.5" fill={!isDark ? '#fbbf24' : '#67e8f9'} style={{animationDelay: '0.1s'}} />
                    <circle className="spark-particle" cx="10" cy="6" r="1" fill={!isDark ? '#f59e0b' : '#06b6d4'} style={{animationDelay: '0.15s'}} />
                    <circle className="spark-particle" cx="14" cy="6" r="1" fill={!isDark ? '#f59e0b' : '#06b6d4'} style={{animationDelay: '0.2s'}} />
                    <circle className="spark-particle" cx="9" cy="9" r="0.8" fill={!isDark ? '#d97706' : '#0891b2'} style={{animationDelay: '0.25s'}} />
                    <circle className="spark-particle" cx="15" cy="9" r="0.8" fill={!isDark ? '#d97706' : '#0891b2'} style={{animationDelay: '0.3s'}} />
                  </svg>
                </div>
                <p className={`mt-4 text-lg font-semibold ${!isDark ? 'text-slate-900' : 'text-white'}`}>
                  Toast submitted! 🥂
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-semibold ${!isDark ? 'text-slate-900' : 'text-white'}`}>
                    Create Toast
                  </h2>
                  <button
                    onClick={() => setShowPostModal(false)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110 ${
                      !isDark ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const content = formData.get('content') as string;
                  if (content?.trim()) {
                    await handleSubmit(content.trim());
                    setShowToastSuccess(true);
                    setTimeout(() => {
                      setShowToastSuccess(false);
                      setShowPostModal(false);
                    }, 800);
                  }
                }}>
                  <textarea
                    name="content"
                    placeholder="What's happening?"
                    rows={4}
                    className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none ${
                      !isDark
                        ? 'border border-slate-300 bg-white text-slate-900 focus:ring-amber-500 focus:border-amber-500'
                        : 'border border-slate-600 bg-slate-700 text-white focus:ring-cyan-500 focus:border-cyan-500'
                    }`}
                    required
                  />

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className={`px-4 py-2 rounded-lg transition ${
                        !isDark ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        !isDark
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 shadow-lg hover:from-amber-600 hover:to-yellow-500 focus:ring-amber-500'
                          : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-white shadow-lg hover:from-cyan-600 hover:to-teal-500 focus:ring-cyan-500'
                      }`}
                    >
                      Toast
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}