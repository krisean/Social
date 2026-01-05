// Venue Header component

import type { Venue } from '../types';
import { useTheme } from '../shared/providers/ThemeProvider';

interface VenueHeaderProps {
  venue: Venue;
}

export function VenueHeader({ venue }: VenueHeaderProps) {
  const { isDark } = useTheme();

  return (
    <div className={`p-6 border-b ${!isDark ? 'border-slate-200' : 'border-slate-700'}`}>
      <h1 className={`text-2xl font-bold mb-2 ${!isDark ? 'text-slate-900' : 'text-cyan-300'}`}>
        {venue.name}
      </h1>
      {venue.description && (
        <p className={`text-base ${!isDark ? 'text-slate-700' : 'text-cyan-400'}`}>
          {venue.description}
        </p>
      )}
    </div>
  );
}
