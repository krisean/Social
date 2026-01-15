# @social/vibox-client

TypeScript client library for interacting with the VIBox API.

## Installation

```bash
pnpm add @social/vibox-client
```

## Usage

```typescript
import { ViboxClient } from '@social/vibox-client';

// Initialize client
const vibox = new ViboxClient({
  apiUrl: 'https://your-vibox-api.vercel.app',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
});

// Get queue
const { data } = await vibox.getQueue();
console.log(data?.queue);

// Add track to queue
await vibox.addToQueue({
  track_id: 'track-123',
  track_title: 'Epic Song',
  track_artist: 'Amazing Artist',
  track_url: 'https://example.com/song.mp3',
  added_by: 'user-name',
});

// Subscribe to real-time updates
const unsubscribe = vibox.subscribe((event) => {
  console.log('Queue updated:', event);
});

// Clean up when done
unsubscribe();
```

## API Methods

### Queue Management
- `getQueue()` - Get current queue
- `addToQueue(track)` - Add track to queue
- `removeFromQueue(id)` - Remove track from queue
- `markPlayed(id, options)` - Mark track as played
- `skipTrack(id)` - Skip track
- `clearQueue()` - Clear entire queue

### Real-time
- `subscribe(callback)` - Subscribe to queue updates

### Health
- `getHealth()` - Check API health

## React Hook Example

```typescript
import { useEffect, useState } from 'react';
import { ViboxClient, ViboxQueueItem } from '@social/vibox-client';

export function useViboxQueue() {
  const [queue, setQueue] = useState<ViboxQueueItem[]>([]);
  const [client] = useState(() => new ViboxClient({
    apiUrl: process.env.VIBOX_API_URL!,
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_ANON_KEY!,
  }));

  useEffect(() => {
    // Initial fetch
    client.getQueue().then(({ data }) => {
      if (data) setQueue(data.queue);
    });

    // Subscribe to updates
    const unsubscribe = client.subscribe(() => {
      client.getQueue().then(({ data }) => {
        if (data) setQueue(data.queue);
      });
    });

    return unsubscribe;
  }, [client]);

  return { queue, client };
}
```
