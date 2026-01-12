# Game Engine Architecture

## Overview

This application has been refactored from a single Firebase-based game ("Top Comment") into a flexible **Game Engine** that supports multiple games, each with two modes. The backend has been migrated from Firebase to **Supabase** with **PostgreSQL** database and **Edge Functions**.

- **Event Mode**: Host-controlled multiplayer sessions with QR codes, presenter views, and synchronized phases
- **Patron Mode**: Self-service solo play for patrons who want to play anytime without a host

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Host Page   │  │  Team Page   │  │  Solo Page   │      │
│  │  (Event)     │  │  (Event)     │  │  (Patron)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                     Game Engine Layer                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Game Registry                         │     │
│  │  - TopCommentEventGame                             │     │
│  │  - TopCommentSoloGame                              │     │
│  │  - ViBoxEventGame                                   │     │
│  │  - ViBoxSoloGame                                    │     │
│  │  - [Future games...]                               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │              GameEngine Interface                  │     │
│  │  - createSession()                                 │     │
│  │  - startSession()                                  │     │
│  │  - advancePhase()                                  │     │
│  │  - handlePlayerAction()                            │     │
│  │  - calculateScores()                               │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                    Infrastructure Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │ PostgreSQL   │  │  Auth/Token  │      │
│  │ Edge Functions│  │   Database   │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

### Backend (`supabase/functions/`)

```
supabase/functions/
├── _shared/                     # Shared utilities
│   ├── prompts.ts              # Prompt management
│   ├── types.ts                # Shared type definitions
│   └── utils.ts                # Utility functions
├── [game-functions]/           # Game-specific Edge Functions
│   ├── answers-submit/
│   ├── sessions-advance/
│   ├── sessions-analytics/
│   ├── sessions-create/
│   ├── sessions-end/
│   ├── sessions-join/
│   ├── sessions-kick-player/
│   ├── sessions-set-prompt-library/
│   ├── sessions-start/
│   └── votes-submit/
└── types.d.ts                  # Generated Supabase types
```

### Game Engine Packages (`packages/`)

```
packages/
├── game-engine/                 # Core game engine
│   ├── src/
│   │   ├── GameEngine.ts       # GameEngine interface & base class
│   │   ├── GameRegistry.ts     # Game registration system
│   │   ├── EventManager.ts     # Event coordination
│   │   ├── types.ts            # Engine type definitions
│   │   └── index.ts
│   └── package.json
├── games/                       # Game implementations
│   ├── topcomment/
│   │   ├── src/
│   │   │   ├── EventMode.ts    # Event mode game logic
│   │   │   ├── PatronMode.ts   # Patron mode game logic
│   │   │   ├── components.ts   # Game UI components
│   │   │   ├── logic.ts        # Shared game logic
│   │   │   ├── types.ts        # Game-specific types
│   │   │   └── index.ts
│   │   └── package.json
│   └── vibox/                  # ViBox game implementation
└── ui/                          # Shared UI components
    ├── src/components/
    │   ├── Card.tsx
    │   ├── Timer.tsx
    │   ├── QRCodeBlock.tsx
    │   └── ...
    └── package.json
```

### Frontend Applications (`apps/`)

```
apps/
├── event-platform/              # Main event platform
│   ├── src/
│   │   ├── features/
│   │   │   ├── host/           # Host interface
│   │   │   ├── team/           # Team/player interface
│   │   │   └── presenter/      # Presenter display
│   │   ├── shared/             # Shared utilities
│   │   └── components/         # App-specific components
│   └── package.json
├── dashboard/                   # Admin dashboard
├── topcomment-247/             # Legacy TopComment app
└── vibox/                  # Legacy ViBox app
```

## Key Concepts

### 1. Game Engine Interface

Every game must implement the `GameEngine` interface:

```typescript
interface GameEngine<TPhaseId, TSettings, TState> {
  descriptor: GameDescriptor;
  
  // Lifecycle
  createSession(sessionId, creator, settings, tx): Promise<GameSessionDoc>;
  startSession(sessionId, players, tx): Promise<void>;
  endSession(sessionId, tx): Promise<void>;
  
  // Phase management
  advancePhase(sessionId, context, tx): Promise<void>;
  canAdvancePhase(sessionId, tx): Promise<boolean>;
  
  // Actions
  handlePlayerAction(sessionId, playerId, action, tx): Promise<void>;
  
  // Scoring
  calculateScores(sessionId, tx): Promise<PlayerScore[]>;
  getLeaderboard(sessionId, tx): Promise<LeaderboardEntry[]>;
  
  // Validation
  validateSettings(settings): TSettings;
}
```

### 2. Game Descriptors

Each game variant (Event/Patron) has a descriptor:

```typescript
const TOP_COMMENT_EVENT_DESCRIPTOR: GameDescriptor = {
  id: "top-comment-event",
  name: "Top Comment (Event)",
  mode: "event",
  description: "Host-controlled multiplayer game",
  minPlayers: 2,
  maxPlayers: 24,
};
```

### 3. Game Sessions

Sessions are stored in PostgreSQL with a generic structure:

```typescript
interface GameSessionDoc<TPhaseId, TSettings, TState> {
  gameId: string;              // e.g., "top-comment-event"
  code?: string;               // Only for event mode
  hostUid?: string;            // Only for event mode
  phase: GamePhase<TPhaseId>;  // Current game phase
  settings: TSettings;         // Game-specific settings
  state: TState;               // Game-specific state
  createdAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
}
```

### 4. Game Manager

The `GameManager` routes all game operations:

```typescript
// Create a session
GameManager.createSession(uid, {
  gameId: "top-comment-event",
  creatorName: "Alice",
  settings: { /* ... */ }
});

// Handle player actions
GameManager.handlePlayerAction(sessionId, playerId, {
  type: "submit-answer",
  payload: { text: "My funny answer" }
});
```

## Adding a New Game

### Step 1: Create Game Package

Create a new game package in `packages/games/[game-name]/`:

```typescript
// packages/games/myGame/src/EventMode.ts
import { GameEngine } from "@social/game-engine";

export class MyGameEventMode implements GameEngine {
  descriptor = {
    id: "my-game-event",
    name: "My Game (Event)",
    mode: "event",
    description: "...",
  };

  async createSession(sessionId, creator, settings, tx) {
    // Initialize game state in PostgreSQL
    const state = { /* ... */ };
    return {
      gameId: this.descriptor.id,
      phase: { id: "lobby" },
      settings: this.validateSettings(settings),
      state,
      createdAt: new Date(),
    };
  }

  // Implement other required methods...
}
```

### Step 2: Register the Game

```typescript
// packages/games/myGame/src/index.ts
import { MyGameEventMode } from "./EventMode";

export const myGameEventMode = new MyGameEventMode();
export const myGamePatronMode = new MyGamePatronMode();
```

Update the main game registry:

```typescript
// packages/games/index.ts
import { myGameEventMode, myGamePatronMode } from "./myGame";

export const games = [
  // ... existing games
  myGameEventMode,
  myGamePatronMode,
];
```

### Step 3: Create UI Components

Add game-specific components:

```typescript
// packages/games/myGame/src/components.ts
export const MyGameComponents = {
  AnswerCard: MyGameAnswerCard,
  GroupCard: MyGameGroupCard,
  // ... other components
};
```

### Step 4: Integrate with Apps

Update the event platform to support your game:

```typescript
// apps/event-platform/src/features/host/HostPage.tsx
import { games } from "@social/games";

// Use game-specific logic and components
```

## Event Mode vs Patron Mode

### Event Mode Features
- Host creates session with unique code
- Multiple players join via QR code
- Synchronized phases (lobby → answer → vote → results)
- Presenter view for TV displays
- Real-time updates via Supabase realtime subscriptions
- Host controls phase advancement

### Patron Mode Features
- No host required
- Single player experience
- Self-paced gameplay
- Compete against historical data
- Simplified UI for quick play
- No room codes needed

## Data Flow

### Event Mode Session Creation

```
Client (Host)
  ↓ createSession({ gameId, teamName })
Supabase Edge Function
  ↓ sessions-create
GameEngine.createSession()
  ↓ PostgreSQL: sessions table (id = sessionId)
  ↓ Real-time subscription
Client (All players)
```

### Player Action

```
Client (Player)
  ↓ submitAnswer({ text })
Supabase Edge Function
  ↓ answers-submit
GameEngine.handlePlayerAction()
  ↓ PostgreSQL: sessions/answers tables
  ↓ Auto-advance check
advancePhase() [if all answered]
```

## PostgreSQL Tables

### Event Mode

```
sessions (table)
  id: sessionId
  code: "ABC123"
  host_uid: "user123"
  status: "answer"
  ends_at: Timestamp
  settings: { answerSecs: 45, voteSecs: 25, ... }
  prompt_deck: [...]
  prompt_cursor: 0

teams (table, session_id = sessionId)
  id: teamId
  team_name, uid, score, is_host, mascot_id, joined_at

answers (table, session_id = sessionId)
  id: answerId
  team_id, round_index, group_id, text, created_at

votes (table, session_id = sessionId)
  id: voteId
  voter_id, answer_id, round_index, group_id, created_at
```

### Patron Mode

```
soloSessions/{sessionId}
  gameId: "top-comment-solo"
  phase: { id: "answer", endsAt: Timestamp }
  settings: { answerSecs: 45, ... }
  state: { currentRound: 0, prompts: [...], score: 0, ... }
  
  players/{playerId}
    uid, name, score, joinedAt

historicalAnswers/{answerId}
  prompt: "Question text"
  text: "Answer text"
  createdAt: Timestamp
```

## Best Practices

### 1. Use Transactions
Always use database transactions for operations that read and write:

```typescript
async handlePlayerAction(sessionId, playerId, action, tx) {
  const sessionSnap = await tx.get(sessionRef);
  // ... logic ...
  tx.update(sessionRef, updates);
}
```

### 2. Validate Input
Always validate and sanitize user input:

```typescript
validateSettings(settings: unknown): MyGameSettings {
  const defaults = getDefaultSettings();
  return {
    answerSecs: settings.answerSecs ?? defaults.answerSecs,
    // ... validate all fields
  };
}
```

### 3. Handle Edge Cases
- Players joining mid-game
- Phase timeouts
- Duplicate submissions
- Network disconnections

### 4. Maintain Backward Compatibility
When refactoring existing games, ensure old sessions continue to work.

## Testing

### Unit Tests
Test game logic in isolation:

```typescript
describe("TopCommentEventGame", () => {
  it("should create session with correct initial state", async () => {
    const game = new TopCommentEventGame();
    const session = await game.createSession(/* ... */);
    expect(session.roundIndex).toBe(0);
  });
});
```

### Integration Tests
Test with Supabase local development:

```bash
# Start Supabase locally
supabase start

# Run tests
npm run test:integration
```

### E2E Tests
Use Playwright to test complete user flows:

```bash
npm run test:e2e
```

## Migration Status

### Firebase → Supabase Migration (✅ Complete)

The application has been successfully migrated from Firebase/Firestore to Supabase/PostgreSQL:

1. **✅ Database Migration**: Firestore collections → PostgreSQL tables
2. **✅ Function Migration**: Firebase Cloud Functions → Supabase Edge Functions
3. **✅ Authentication**: Firebase Auth → Supabase Auth
4. **✅ Real-time**: Firestore listeners → Supabase realtime subscriptions
5. **✅ Architecture**: Monorepo with shared packages

### Current Architecture

1. **✅ Top Comment Event Mode**: Host-controlled multiplayer sessions
2. **✅ Top Comment Patron Mode**: Self-service solo play
3. **✅ ViBox Event Mode**: Chart-based music game
4. **✅ ViBox Patron Mode**: Solo music quiz
5. **🔄 Multiple Apps**: event-platform, dashboard, legacy apps
6. **📦 Shared Packages**: game-engine, games, ui, db, auth

### Future Enhancements

- Add new games using the engine
- Expand patron mode features
- Enhanced analytics and reporting
- Tournament and competition modes

## Future Enhancements

- Game difficulty levels
- Custom prompt libraries per game
- Achievements and badges
- Global leaderboards
- Tournament mode
- Game scheduling
- Analytics dashboard
- AI-generated prompts
- Multiplayer patron mode (matchmaking)

## Support

For questions or issues:
- See `docs/04-tech-architecture.md` for system overview
- Check `README.md` for setup instructions
- Review game implementations in `packages/games/` for examples
- Check `SUPABASE_MIGRATION.md` for migration details
- See `MIGRATION_STATUS.md` for current status








