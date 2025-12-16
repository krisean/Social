# Bar Scores MVP

Bar Scores is a mobile-first party game for bars and venues. Hosts spin up live prompt battles, players join via room code or QR, and everyone writes, votes, and celebrates the best ideas in three fast rounds.

## Recent UI Improvements

**Recent UI enhancements include: solid white cards, floating lobby mascots, optimized background animations (reduced lag), modal improvements, QR code integration in presenter view, and social media-style heart voting (implemented November 18, 2025).**

## Deployment & Access

### Live Application
The application is deployed and accessible at: **https://game.barscores.ca**
Product Page: https://barscores.ca

Architecture: https://github.com/SideBets/SideBets_V2/blob/main/architecture.md

### Access Instructions
- **No account required** - The app uses anonymous authentication for instant access
- **No special credentials needed** - Simply visit the URL above to start using the application

### Testing the Application
1. **Host Interface**: Visit `https://barscores.ca/host` to create and manage game sessions
2. **Player Interface**: Visit `https://barscores.ca/play` to join games as a player
3. **Presenter Interface**: Use `https://barscores.ca/presenter/{sessionId}` for TV display (requires active session)

### Test Scenario
1. **Host Setup**: Open the host interface on a laptop/desktop computer at `https://barscores.ca/host`
2. Create a new session - the room code and QR code will be displayed, and a "Presenter" link will appear at the top of the host page for TV display
3. **Team Setup**: Have 4 different people open `https://barscores.ca/play` on their phones, or simulate multiple teams using different browser windows/incognito mode on the same device if phones aren't available
4. Each person/device joins as a team by **scanning the QR code** displayed by the host (recommended) or manually entering the room code
5. Once at least 4 teams have joined, the host can start the game
6. Teams follow the prompts on their devices through the complete answer → vote → results flow

## Game flow highlights

- Hosts create sessions, share a 6-character code and QR, manage lobby controls, and move through `answer → vote → results` phases.
- Players join on `/play`, submit answers (auto-submitted at 0 seconds), vote for anonymous cards, and track results plus personal feedback.
- Presenter view `/presenter/:sessionId` offers a TV-friendly layout with large timers, prompt text, and live results.
- Analytics captured at end-of-game: players joined, completion %, average votes per round, and duration.

## Project structure

- `client/` – React + TypeScript + Vite front-end with Tailwind styling.
- `functions/` – Firebase Cloud Functions (Node.js 20) with Firestore data model and game orchestration.
- `firestore.rules` – Baseline Firestore security rules for session-scoped access.
- `firebase.json` / `.firebaserc` – Firebase CLI configuration placeholders.

## Getting started

### 1. Prerequisites
- **Node.js 20** – the Cloud Functions runtime and TypeScript build both target Node 20. If you use `nvm`, run `nvm install 20 && nvm use 20` in every terminal before continuing.
- **Firebase CLI** – install globally with `npm install -g firebase-tools` if you have not already.

### 2. Authenticate with Firebase
Run the following once on your machine to let the Firebase CLI access your project:
```bash
firebase login
```
Confirm that `.firebaserc` points to the intended Firebase project (update the `default` entry if needed).

### 3. Install dependencies
Install packages for the client and Functions workspaces:
```bash
cd client && npm install
cd ../functions && npm install
```

### 4. Configure environment variables
Create `client/.env.local` if it does not exist and supply your Firebase web app credentials:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
VITE_USE_FIREBASE_EMULATORS=true
```
The values come from **Project Settings → General** in the Firebase console. Leave the emulator flag on `true` while developing locally so the app connects to the emulator suite instead of production.

### 5. Start the local Firebase stack
From the project root (and still using Node 20):
```bash
firebase emulators:start --only auth,firestore,functions,database
```
This launches anonymous Auth, Firestore, Functions, and Realtime Database emulators on the standard ports declared in `firebase.json`. Keep this process running while you develop.

### 6. Run the client
In a new terminal window, start the Vite dev server:
```bash
cd client
npm run dev -- --host
```
Vite prints a local URL (e.g. `http://localhost:5173`) and a LAN URL you can share on the same Wi‑Fi network for multi-device testing. Each browser window uses anonymous auth against the emulator instance, so open additional browser profiles or devices to simulate multiple players.

> Tip: for faster function rebuilds during development, run `npm run watch` inside the `functions` directory to keep TypeScript compiling into `functions/lib`.

### 7. Deploying (optional)
When you are ready to demo from production infrastructure, flip `VITE_USE_FIREBASE_EMULATORS` to `false`, then:
```bash
cd functions && npm run build && firebase deploy --only functions,firestore:rules
cd ../client && npm run build
firebase deploy --only hosting
```
This publishes the callable functions, Firestore rules, and static client bundle to your Firebase project.

## Tech stack

- **Front-end:** React 19, TypeScript, TailwindCSS, React Router, TanStack Query, Firebase Web SDK.
- **Back-end:** Firebase Functions (v2 `onCall` handlers), Firestore data model, bad-words profanity filtering, transactional state transitions.

## Testing & linting

- Front-end build: `cd client && npm run build`
- Functions build/typecheck: `cd functions && npm run build`

## Notes

- Security rules restrict read access to participants; all writes go through server functions.
- `PROMPTS` for the MVP are defined in `functions/src/config.ts` and mirrored in client fallback text.
- Update Tailwind theme or prompts as the brand evolves.
