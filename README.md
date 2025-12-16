# Bar Scores - Social Gaming Platform

A flexible game engine supporting multiple social games with **Event Mode** (host-controlled multiplayer) and **Patron Mode** (self-service solo play).

## 🎮 Features

- **Game Engine Architecture**: Modular system for multiple games
- **Event Mode**: Host-controlled multiplayer sessions with QR codes and presenter views
- **Patron Mode**: Self-service solo play for patrons (NEW!)
- **Real-time Updates**: Live synchronization via Firebase
- **Beautiful UI**: Modern, responsive design with TailwindCSS
- **TypeScript**: Full type safety across frontend and backend

## 🎯 Current Games

### Top Comment
- **Event Mode**: Teams compete to write the funniest answers to prompts, then vote on favorites
- **Patron Mode**: Solo play against historical answers from other patrons

## 📚 Documentation

- **[Game Engine Architecture](./GAME_ENGINE.md)** - Detailed architecture and development guide
- **[System Architecture](./architecture.md)** - High-level system design

## 🚀 Deployment & Access

### Live Application
- **Main App**: https://game.barscores.ca
- **Product Page**: https://barscores.ca

### Testing the Application

#### Event Mode (Multiplayer)
1. **Host Interface**: Visit `https://game.barscores.ca/host` to create and manage game sessions
2. **Player Interface**: Visit `https://game.barscores.ca/play` to join games as a player
3. **Presenter Interface**: Use `https://game.barscores.ca/presenter/{sessionId}` for TV display

#### Patron Mode (Solo Play)
1. Visit `https://game.barscores.ca/solo` for self-service solo play
2. No host or room code required!

### Test Scenario
1. **Host Setup**: Open the host interface on a laptop/desktop
2. Create a new session - room code and QR code will be displayed
3. **Team Setup**: Have players scan the QR code or enter the room code
4. Once teams have joined, the host starts the game
5. Teams answer prompts, vote, and compete through multiple rounds

## 🛠️ Development Setup

### Prerequisites
- **Node.js 20** (use `nvm install 20 && nvm use 20`)
- **Firebase CLI**: `npm install -g firebase-tools`

### Installation

```bash
# Install dependencies
cd client && npm install
cd ../functions && npm install
```

### Local Development

```bash
# 1. Start Firebase emulators
firebase emulators:start --only auth,firestore,functions,database

# 2. In another terminal, start the client
cd client
npm run dev -- --host
```

### Environment Variables

Create `client/.env.local`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
VITE_USE_FIREBASE_EMULATORS=true  # Set to false for production
```

## 🏗️ Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── engine/        # Game engine types (frontend)
│   │   ├── games/         # Game implementations
│   │   │   └── topComment/
│   │   │       ├── event/     # Event mode UI
│   │   │       ├── patron/    # Patron mode UI
│   │   │       └── components/
│   │   ├── features/      # Legacy feature modules
│   │   └── shared/        # Shared utilities
│   └── package.json
│
├── functions/             # Firebase Cloud Functions
│   ├── src/
│   │   ├── engine/       # Game engine core
│   │   │   ├── types.ts
│   │   │   ├── GameEngine.ts
│   │   │   ├── GameRegistry.ts
│   │   │   └── GameManager.ts
│   │   ├── games/        # Game implementations
│   │   │   └── topComment/
│   │   │       ├── TopCommentEventGame.ts
│   │   │       ├── TopCommentSoloGame.ts
│   │   │       └── sharedLogic.ts
│   │   └── shared/       # Shared utilities
│   └── package.json
│
├── GAME_ENGINE.md        # Architecture documentation
├── architecture.md       # System architecture
└── README.md            # This file
```

## 🎨 Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS, React Router, TanStack Query
- **Backend**: Firebase Functions v2, Firestore, Firebase Auth
- **Build Tools**: Vite, ESLint, PostCSS
- **Testing**: Playwright (E2E), Vitest (Unit)

## 📦 Deployment

```bash
# Deploy functions
cd functions
npm run build
firebase deploy --only functions,firestore:rules

# Deploy client
cd ../client
npm run build
firebase deploy --only hosting
```

## 🎮 Adding New Games

See the **[Game Engine Documentation](./GAME_ENGINE.md)** for a complete guide on:
- Creating new game implementations
- Implementing Event and Patron modes
- Registering games in the engine
- Building game-specific UI

Quick example:

```typescript
// 1. Implement the game engine
export class MyGameEventGame extends BaseGameEngine {
  descriptor = {
    id: "my-game-event",
    name: "My Game",
    mode: "event",
    // ...
  };
  
  async createSession(/* ... */) { /* ... */ }
  async advancePhase(/* ... */) { /* ... */ }
  // ... implement other methods
}

// 2. Register it
GameRegistry.register(new MyGameEventGame());

// 3. Create UI components
// client/src/games/myGame/event/HostPage.tsx
```

## 🧪 Testing

```bash
# Frontend build check
cd client && npm run build

# Functions build check
cd functions && npm run build

# E2E tests (requires emulators running)
cd client && npm run test:e2e
```

## 📝 Game Flow (Event Mode)

1. **Lobby**: Host creates session, players join via QR code
2. **Answer Phase**: Teams write creative answers to prompts (45s)
3. **Vote Phase**: Teams vote for their favorite answers (25s)
4. **Results Phase**: See winners and updated leaderboard (10s)
5. **Repeat**: Multiple rounds, ending with final scores

## 📝 Game Flow (Patron Mode)

1. **Welcome**: Player starts a solo session
2. **Answer**: Write answer to prompt (45s)
3. **Vote**: Vote between your answer and historical answers from others
4. **Results**: See how you did
5. **Repeat**: 5 quick rounds, final score

## 🔒 Security

- Anonymous authentication for instant access
- Session-scoped Firestore security rules
- All game state mutations via authenticated Cloud Functions
- Input validation and profanity filtering

## 🚧 Roadmap

- [ ] More game types (trivia, drawing, etc.)
- [ ] Tournament mode
- [ ] Global leaderboards
- [ ] Achievements system
- [ ] Custom prompt libraries
- [ ] AI-generated prompts
- [ ] Multiplayer patron mode (matchmaking)

## 📄 License

Proprietary - Bar Scores

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

**Recent UI improvements**: Solid white cards, floating lobby mascots, optimized background animations, modal improvements, QR code integration in presenter view, and social media-style heart voting (implemented November 2025).
