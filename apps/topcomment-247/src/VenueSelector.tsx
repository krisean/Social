import { BackgroundAnimation } from './components/BackgroundAnimation';
import { Card } from './components/Card';
import { useTheme } from './shared/providers/ThemeProvider';

export function VenueSelector() {
  const { isDark } = useTheme();
  const exampleVenues = [
    { key: 'the-drunken-duck', name: 'The Drunken Duck' },
    { key: 'mabels-pub', name: "Mabel's Pub" },
    { key: 'craft-beer-house', name: 'Craft Beer House' },
    { key: 'sports-bar', name: 'Sports Bar' },
  ];

  return (
    <>
      <BackgroundAnimation show={true} />
      {/* Focus Band */}
      <div className="fixed inset-0 z-5 pointer-events-none" style={{
        background: !isDark
          ? 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 20%, transparent 80%, rgba(255,255,255,0.3) 100%)'
          : 'linear-gradient(to bottom, rgba(15,23,42,0.4) 0%, transparent 20%, transparent 80%, rgba(15,23,42,0.4) 100%)'
      }} />
      <main className="relative min-h-screen px-4 py-10 sm:px-6">
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-8">
        {/* Header */}
        <header className="text-center">
          <h1 className={`text-4xl font-black ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
            Top Comment 24/7
          </h1>
          <p className={`mt-2 text-lg ${!isDark ? 'text-slate-700' : 'text-cyan-300'}`}>
            Join pub conversations, share your thoughts
          </p>
        </header>

        {/* Venue Selection */}
        <Card className="text-center space-y-6">
          <h2 className={`text-2xl font-bold ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
            Choose Your Venue
          </h2>
          <p className={`text-base ${!isDark ? 'text-slate-700' : 'text-cyan-300'}`}>
            Select a pub to join their live comment wall
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {exampleVenues.map((venue) => (
              <a
                key={venue.key}
                href={`/${venue.key}`}
                className={`inline-flex items-center justify-center rounded-2xl px-6 py-4 text-lg font-semibold transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  !isDark
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-900 shadow-xl shadow-amber-500/30 focus-visible:outline-amber-500 hover:shadow-2xl hover:shadow-amber-500/50'
                    : 'bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-300 text-slate-900 shadow-xl shadow-cyan-500/30 focus-visible:outline-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/50'
                }`}
              >
                {venue.name}
              </a>
            ))}
          </div>
        </Card>

        {/* Footer */}
        <Card className="text-center space-y-4">
          <div className={`flex flex-col gap-4 text-sm ${!isDark ? 'text-slate-700' : 'text-cyan-300'}`}>
            <div className="flex items-center justify-center gap-2">
              <svg className={`h-5 w-5 ${!isDark ? 'text-amber-500' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Available at participating venues</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className={`h-5 w-5 ${!isDark ? 'text-amber-500' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Questions? Contact your venue</span>
            </div>
          </div>
        </Card>
        </div>
      </main>
    </>
  );
}