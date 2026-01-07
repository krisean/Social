# Backend Migration Guide

## Overview

The backend logic needs to be migrated from Firebase Functions to either:
1. **Supabase Edge Functions** (Deno-based, runs on Supabase infrastructure)
2. **Vercel API Routes** (Node.js, runs on Vercel infrastructure)

## Current Firebase Functions

Located in `functions/src/`:
- `sessionManager.ts` - Session CRUD operations
- `engine/GameManager.ts` - Routes game operations
- `games/topComment/` - Top Comment game logic

## Recommended Approach: Supabase Edge Functions

**Advantages:**
- Co-located with database
- Automatic type inference from database
- Built-in auth integration
- Direct database access (no HTTP overhead)

**Migration Steps:**

1. Create `supabase/functions/` directory
2. Port Firebase Functions to Supabase Edge Functions:
   - `session-create/` - Create game sessions
   - `session-start/` - Start sessions
   - `player-join/` - Join sessions
   - `player-action/` - Handle player actions
   - `phase-advance/` - Advance game phases

3. Update game engine to work server-side:
   - Port `packages/game-engine/` logic to Edge Functions
   - Use Supabase Admin client (bypasses RLS)
   - Maintain same interfaces

4. Deploy Edge Functions:
   ```bash
   supabase functions deploy session-create
   supabase functions deploy player-action
   # etc.
   ```

## Alternative: Vercel API Routes

If you prefer Vercel:

1. Create `apps/api/` app in monorepo
2. Use Vercel serverless functions
3. Import game engine packages
4. Deploy alongside frontend apps

## Game Logic Location

The game logic from `functions/src/games/` should move to:
- **`packages/games/topcomment/api/`** - Server-side game logic
- **`packages/games/vibox/api/`** - Server-side game logic

This keeps game logic co-located with the game package (modular design).

## Next Steps

1. Choose backend platform (Supabase Edge Functions recommended)
2. Create function stubs
3. Port game engine server-side logic
4. Port game-specific logic to game packages
5. Update client to call new endpoints
6. Test thoroughly
7. Deploy

## Status

⏳ **Pending Implementation**

The backend migration is out of scope for this initial restructuring. The new architecture is ready, but the actual function migration requires:
- Testing each game flow
- Ensuring feature parity with Firebase
- Validating realtime subscriptions work correctly

This should be done as a separate phase after the structure is validated.

