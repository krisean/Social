# Pub Feed - Twitter-Style Feed

A modern, extensible Twitter-like feed system for venues built with React, TypeScript, and Supabase.

## Architecture

### Clean Separation of Concerns

```
src/
├── types/              # Type definitions (user, venue, content)
├── providers/          # Context providers (Auth, Modal)
├── hooks/              # Data hooks (useFeed, useLikes, useVenue)
├── components/
│   ├── auth/          # Authentication UI
│   ├── content/       # Content cards (extensible registry)
│   ├── composers/     # Content creation UIs
│   └── VenueFeed.tsx  # Main feed component
└── utils/             # Utilities (formatters, validation)
```

### Key Features

- **Full Authentication**: Email/password sign-up and anonymous guest mode
- **Real-time Updates**: Supabase real-time subscriptions for live feed
- **Optimistic UI**: Instant like updates with rollback on error
- **Extensible Architecture**: Registry pattern for future content types (VIBox, polls)
- **Type-Safe**: Comprehensive TypeScript types throughout
- **Error Handling**: ErrorBoundary and graceful error states

## Database Schema

New tables in `20250103000000_create_feed_schema.sql`:

- `users` - User profiles (supports anonymous)
- `feed_posts` - Content posts (extensible via metadata)
- `feed_likes` - Like/reaction system
- `venues` - Venue information and feature flags

## Usage

### Development

```bash
# Install dependencies
pnpm install

# Run development server
cd apps/topcomment-247
pnpm dev
```

### Database Setup

```bash
# Run migrations
supabase migration up

# Migrations will create:
# - Feed tables
# - RLS policies
# - Indexes
# - Triggers
# - Demo venues
```

## Extensibility

### Adding New Content Types (e.g., VIBox Songs)

1. **Add type**: Update `src/types/content.ts`
```typescript
export type ContentType = 'comment' | 'song';

export interface SongContent extends BaseContent {
  contentType: 'song';
  metadata: {
    title: string;
    audioUrl: string;
    // ...
  };
}
```

2. **Create card**: Add `src/components/content/SongCard.tsx`

3. **Register**: Update `ContentRegistry.tsx`
```typescript
const ContentCardRegistry = {
  comment: CommentCard,
  song: SongCard,
};
```

4. **Add composer**: Create modal in `src/components/modals/ViboxModal.tsx`

5. **Enable**: Add feature flag to venue

## Authentication Flow

1. User clicks "Post" without auth → AuthModal opens
2. Options: Sign Up / Sign In / Continue as Guest
3. Anonymous users get generated username (e.g., `HappyPanda123`)
4. Session persists via Supabase Auth
5. `users` record created automatically

## Real-time Updates

- New posts appear instantly via Supabase subscriptions
- Like counts update in real-time
- Optimistic UI for immediate feedback
- Automatic rollback on errors

## Component Hierarchy

```
VenuePage
└── VenueFeed
    ├── VenueHeader
    ├── CommentComposer (or auth prompt)
    └── ContentCard[] (via ContentRegistry)
        └── CommentCard
            └── useLikes (optimistic updates)
```

## Performance

- Indexed database queries
- Efficient real-time subscriptions (per-venue channels)
- Optimistic UI updates
- Lazy loading ready (limit 50 posts)

## Future Enhancements

- [ ] VIBox song creation modal
- [ ] Poll content type
- [ ] Challenge content type
- [ ] User profiles page
- [ ] Venue discovery
- [ ] Search and filtering
- [ ] Notifications
- [ ] Rich media support (images, videos)

## Code Quality

- **Type Safety**: 100% TypeScript, no `any` types
- **Modularity**: Each feature in isolated files
- **Extensibility**: Registry patterns throughout
- **Error Handling**: Comprehensive boundaries and fallbacks
- **Performance**: Optimistic updates, efficient queries
