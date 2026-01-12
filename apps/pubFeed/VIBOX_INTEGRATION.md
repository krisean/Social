# VIBox Integration for pubFeed

## Overview

pubFeed is now integrated with the VIBox API, enabling shared music queue functionality across all Social apps.

## What Was Added

### 1. Dependencies
- Added `@social/vibox-client` to `package.json`

### 2. Hooks (`src/hooks/vibox/`)
- **`useViboxQueue.ts`**: Main hook for queue management
  - `queue`: Current queue items
  - `isLoading`: Loading state
  - `error`: Error messages
  - `addToQueue()`: Add track to queue
  - `removeFromQueue()`: Remove track
  - `markPlayed()`: Mark track as played
  - `skipTrack()`: Skip track
  - `clearQueue()`: Clear entire queue
  - `refresh()`: Manually refresh queue

### 3. Components (`src/components/vibox/`)
- **`VIBoxPlayer.tsx`**: Full-featured music player
  - Audio playback controls
  - Queue display
  - Real-time updates
  - Track management

### 4. Pages (`src/pages/`)
- **`VIBoxPage.tsx`**: Example page showing VIBox integration

### 5. Environment Variables
- **`.env.example`**: Template for required environment variables

## Setup

### 1. Install Dependencies

```bash
cd apps/pubFeed
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` in `apps/pubFeed/`:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local`:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_VIBOX_API_URL=http://localhost:3000
```

For production, use your deployed Vercel URL:
```bash
VITE_VIBOX_API_URL=https://your-vibox-api.vercel.app
```

### 3. Add Route (Optional)

If you want a dedicated VIBox page, add to your router:

```typescript
import { VIBoxPage } from './pages/VIBoxPage';

// In your router configuration
{
  path: '/vibox',
  element: <VIBoxPage />
}
```

## Usage Examples

### Basic Usage

```typescript
import { useViboxQueue } from './hooks/vibox';

function MyComponent() {
  const { queue, addToQueue, removeFromQueue } = useViboxQueue();

  const handleAddTrack = async () => {
    await addToQueue({
      track_id: 'song-123',
      track_title: 'My Song',
      track_artist: 'Artist Name',
      track_url: 'https://example.com/song.mp3',
      added_by: 'pubFeed User',
    });
  };

  return (
    <div>
      <h2>Queue: {queue.length} tracks</h2>
      <button onClick={handleAddTrack}>Add Track</button>
      {queue.map(track => (
        <div key={track.id}>
          {track.track_title} - {track.track_artist}
          <button onClick={() => removeFromQueue(track.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

### Using the Player Component

```typescript
import { VIBoxPlayer } from './components/vibox';

function MyPage() {
  return (
    <div>
      <h1>Music Player</h1>
      <VIBoxPlayer />
    </div>
  );
}
```

### Custom Integration

```typescript
import { useViboxQueue } from './hooks/vibox';

function CustomPlayer() {
  const { 
    queue, 
    isLoading, 
    error,
    addToQueue,
    markPlayed,
    skipTrack 
  } = useViboxQueue();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Your custom UI */}
    </div>
  );
}
```

## Features

### Real-time Synchronization
- Changes made in pubFeed appear instantly in dashboard and other apps
- Changes made in other apps appear instantly in pubFeed
- Powered by Supabase real-time subscriptions

### Queue Management
- Add tracks from any app
- Remove tracks from queue
- Mark tracks as played with analytics
- Skip tracks
- Clear entire queue

### Analytics
- Track play duration
- Completion percentage
- Skip counts
- User engagement metrics

## API Methods

### `useViboxQueue()` Hook

```typescript
const {
  queue,              // ViboxQueueItem[]
  isLoading,          // boolean
  error,              // string | null
  addToQueue,         // (track) => Promise<ApiResponse>
  removeFromQueue,    // (id) => Promise<ApiResponse>
  markPlayed,         // (id, options) => Promise<ApiResponse>
  skipTrack,          // (id) => Promise<ApiResponse>
  clearQueue,         // () => Promise<ApiResponse>
  refresh,            // () => Promise<void>
} = useViboxQueue();
```

### Track Object

```typescript
interface ViboxQueueInsert {
  track_id: string;           // Unique track identifier
  track_title: string;        // Track title
  track_artist: string;       // Artist name
  track_url: string;          // Audio file URL
  track_genre?: string;       // Genre (optional)
  track_duration?: number;    // Duration in seconds (optional)
  primary_vibe?: string;      // Primary vibe/mood (optional)
  secondary_vibe?: string;    // Secondary vibe/mood (optional)
  added_by: string;           // User who added the track
}
```

## Testing

### 1. Start VIBox API (if running locally)

```bash
cd apps/vibox-api
pnpm dev
```

### 2. Start pubFeed

```bash
cd apps/pubFeed
pnpm dev
```

### 3. Test Operations

1. Navigate to `/vibox` (or wherever you added the component)
2. Click "Add Sample Track"
3. Verify track appears in queue
4. Test playback controls
5. Open dashboard or another app to verify real-time sync

## Troubleshooting

### "Cannot find module @social/vibox-client"
- Run `pnpm install` in the root directory
- Verify `@social/vibox-client` is in `package.json`

### "Failed to fetch queue"
- Check `VITE_VIBOX_API_URL` is correct
- Verify VIBox API is running (local or deployed)
- Check browser console for CORS errors

### Real-time updates not working
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase real-time is enabled for `vibox_queue` table
- Look for WebSocket connection errors in console

### Audio not playing
- Verify `track_url` points to a valid audio file
- Check browser console for CORS or loading errors
- Ensure audio file format is supported (MP3, WAV, OGG)

## Architecture

```
pubFeed Component
    ↓
useViboxQueue Hook
    ↓
@social/vibox-client
    ↓
VIBox API (Vercel)
    ↓
Supabase Database
    ↓
Real-time Updates
    ↓
All Connected Apps
```

## Next Steps

1. **Deploy VIBox API** to Vercel (if not already done)
2. **Update environment variables** with production URLs
3. **Test cross-app synchronization** with dashboard
4. **Add custom tracks** from your music library
5. **Customize UI** to match pubFeed design system

## Benefits

✅ **Unified Queue**: One queue shared across all apps  
✅ **Real-time Sync**: Instant updates everywhere  
✅ **Easy Integration**: Simple hook-based API  
✅ **Type-safe**: Full TypeScript support  
✅ **Analytics**: Track usage and engagement  

## Support

For issues or questions:
- Check `VIBOX_DEPLOYMENT_GUIDE.md` in project root
- Review `VIBOX_API_IMPLEMENTATION_GUIDE.md` for technical details
- Test API health: `curl https://your-api.vercel.app/api/health`
