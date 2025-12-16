# Game Engine Architecture

## Overview

This application has been refactored from a single game ("Top Comment") into a flexible **Game Engine** that supports multiple games, each with two modes:

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
│  │   Firebase   │  │   Firestore  │  │    Auth      │      │
│  │   Functions  │  │   Database   │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

### Backend (`functions/src/`)

```
functions/src/
├── engine/                      # Core game engine
│   ├── types.ts                # Engine type definitions
│   ├── GameEngine.ts           # GameEngine interface & base class
│   ├── GameRegistry.ts         # Game registration system
│   └── GameManager.ts          # Routes requests to games
├── games/                       # Game implementations
│   ├── index.ts                # Game initialization
│   └── topComment/             # Top Comment game
│       ├── types.ts            # Game-specific types
│       ├── sharedLogic.ts      # Common game logic
│       ├── TopCommentEventGame.ts  # Event mode implementation
│       └── TopCommentSoloGame.ts   # Patron mode implementation
├── shared/                      # Shared utilities
│   ├── promptLibraries.ts
│   └── mascots.ts
└── index.ts                     # Cloud Functions entry point
```

### Frontend (`client/src/`)

```
client/src/
├── engine/                      # Core engine types (frontend)
│   ├── types.ts
│   ├── GameEngine.ts
│   └── GameRegistry.ts
├── games/                       # Game implementations
│   └── topComment/
│       ├── types.ts            # Game-specific types
│       ├── components/         # Shared components
│       │   ├── AnswerCard.tsx
│       │   ├── GroupCard.tsx
│       │   ├── Leaderboard.tsx
│       │   └── RoundSummaryCard.tsx
│       ├── event/              # Event mode UI
│       │   ├── host/
│       │   ├── team/
│       │   └── presenter/
│       └── patron/             # Patron mode UI
│           └── SoloPage.tsx
├── features/                    # Legacy structure (to be migrated)
│   ├── host/
│   ├── team/
│   └── presenter/
└── shared/                      # Shared utilities
    ├── types.ts
    └── utils/
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

Sessions are stored in Firestore with a generic structure:

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

### Step 1: Create Game Implementation

Create a new directory in `functions/src/games/[game-name]/`:

```typescript
// functions/src/games/myGame/MyGameEventGame.ts
import { BaseGameEngine } from "../../engine/GameEngine";

export class MyGameEventGame extends BaseGameEngine {
  descriptor = {
    id: "my-game-event",
    name: "My Game (Event)",
    mode: "event",
    description: "...",
  };

  async createSession(sessionId, creator, settings, tx) {
    // Initialize game state
    const state = { /* ... */ };
    return {
      gameId: this.descriptor.id,
      phase: { id: "lobby" },
      settings: this.validateSettings(settings),
      state,
      createdAt: this.now(),
    };
  }

  // Implement other required methods...
}
```

### Step 2: Register the Game

```typescript
// functions/src/games/index.ts
import { MyGameEventGame } from "./myGame/MyGameEventGame";

export function initializeGames(): void {
  GameRegistry.register(new TopCommentEventGame());
  GameRegistry.register(new TopCommentSoloGame());
  GameRegistry.register(new MyGameEventGame()); // Add here
}
```

### Step 3: Create Frontend UI

Create UI components in `client/src/games/[game-name]/`:

```typescript
// client/src/games/myGame/event/host/HostPage.tsx
export function MyGameHostPage() {
  // Implement host interface
}
```

### Step 4: Add Routes

Update `client/src/app/router.tsx` to include your game's routes.

## Event Mode vs Patron Mode

### Event Mode Features
- Host creates session with unique code
- Multiple players join via QR code
- Synchronized phases (lobby → answer → vote → results)
- Presenter view for TV displays
- Real-time updates via Firestore listeners
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
GameManager
  ↓ registry.get(gameId)
TopCommentEventGame
  ↓ createSession()
Firestore: sessions/{sessionId}
  ↓ real-time listener
Client (All players)
```

### Player Action

```
Client (Player)
  ↓ submitAnswer({ text })
GameManager
  ↓ handlePlayerAction()
TopCommentEventGame
  ↓ saveAnswer()
Firestore: sessions/{sessionId}/answers/{answerId}
  ↓ auto-advance check
advancePhase() [if all answered]
```

## Firestore Collections

### Event Mode

```
sessions/{sessionId}
  gameId: "top-comment-event"
  code: "ABC123"
  hostUid: "user123"
  phase: { id: "answer", endsAt: Timestamp }
  settings: { answerSecs: 45, voteSecs: 25, ... }
  state: { roundIndex: 0, rounds: [...], ... }
  
  players/{playerId}
    uid, name, score, isHost, joinedAt, mascotId
  
  answers/{answerId}
    teamId, roundIndex, groupId, text, createdAt
  
  votes/{voteId}
    voterId, answerId, roundIndex, groupId, createdAt
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
Always use Firestore transactions for operations that read and write:

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
    expect(session.state.roundIndex).toBe(0);
  });
});
```

### Integration Tests
Test full flows with Firebase emulators:

```bash
npm run test:integration
```

### E2E Tests
Use Playwright to test complete user flows:

```bash
npm run test:e2e
```

## Migration Guide

### Migrating Existing Sessions

When deploying the new architecture, existing sessions should continue to work. The current implementation maintains backward compatibility by:

1. Keeping existing Cloud Functions as wrappers
2. Using the same Firestore collections
3. Maintaining the same data structures
4. Supporting legacy routes

### Gradual Migration

1. **Phase 1**: Deploy engine with Top Comment Event (✅ Complete)
2. **Phase 2**: Add Top Comment Patron mode (✅ Complete)
3. **Phase 3**: Add new games using the engine
4. **Phase 4**: Migrate legacy frontend code to new structure
5. **Phase 5**: Remove deprecated legacy functions

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
- See `architecture.md` for system overview
- Check `README.md` for setup instructions
- Review game implementations in `functions/src/games/` for examples


