import { useParams } from 'react-router-dom';
import { useVenue } from './hooks';
import { VenueFeed } from './components/VenueFeed';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { Card } from './components/Card';
import { useTheme } from './shared/providers/ThemeProvider';

export function VenuePage() {
  const { venueKey } = useParams();
  const { venue, loading, error } = useVenue(venueKey);
  const { isDark } = useTheme();

  if (loading) {
    return (
      <>
        <BackgroundAnimation show={true} />
        <main className="relative min-h-screen px-4 py-10 sm:px-6">
          <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-6">
            <Card className="text-center space-y-6 backdrop-blur">
              <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto" style={{
                borderColor: !isDark ? '#f59e0b' : '#06b6d4',
                borderTopColor: 'transparent'
              }}></div>
              <div className="space-y-2">
                <h2 className={`text-2xl font-bold ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
                  Loading Venue
                </h2>
                <p className={`text-base ${!isDark ? 'text-slate-700' : 'text-cyan-300'}`}>
                  Please wait...
                </p>
              </div>
            </Card>
          </div>
        </main>
      </>
    );
  }

  if (error || !venue) {
    return (
      <>
        <BackgroundAnimation show={true} />
        <main className="relative min-h-screen px-4 py-10 sm:px-6">
          <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-6">
            <Card className="text-center space-y-6 backdrop-blur">
              <h2 className={`text-3xl font-bold ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
                Venue Not Found
              </h2>
              <p className={`text-base ${!isDark ? 'text-slate-700' : 'text-cyan-300'}`}>
                {venueKey ? `The venue "${venueKey}" doesn't exist yet.` : 'No venue specified.'}
              </p>
              <a
                href="/"
                className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold transition hover:scale-[1.02] ${
                  !isDark
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-900 shadow-xl shadow-amber-500/30'
                    : 'bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-300 text-slate-900 shadow-xl shadow-cyan-500/30'
                }`}
              >
                Browse Venues
              </a>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <BackgroundAnimation show={true} />
      {/* Focus Band - Vertical gradient to calm center while allowing edge motion */}
      <div className="fixed inset-0 z-5 pointer-events-none" style={{
        background: !isDark
          ? 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 20%, transparent 80%, rgba(255,255,255,0.3) 100%)'
          : 'linear-gradient(to bottom, rgba(15,23,42,0.4) 0%, transparent 20%, transparent 80%, rgba(15,23,42,0.4) 100%)'
      }} />
      <main className="relative min-h-screen px-4 py-10 sm:px-6">
        <div className="relative z-10">
          <VenueFeed venue={venue} />
        </div>
      </main>
    </>
  );
}

