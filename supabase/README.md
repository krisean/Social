# Supabase Backend for Event Platform

Modern, clean Supabase implementation for the multiplayer event platform.

## 🚀 Features

- **Real-time multiplayer game sessions** with Supabase Realtime
- **Row Level Security (RLS)** for secure data access
- **Edge Functions** for game logic (Deno/TypeScript)
- **PostgreSQL** with JSONB for flexible data structures
- **Automatic database triggers** for activity tracking

## 📁 Structure

```
supabase/
├── functions/           # Edge Functions (Deno)
│   ├── _shared/        # Shared utilities and types
│   ├── sessions-create/
│   ├── sessions-join/
│   ├── sessions-start/
│   ├── sessions-advance/
│   ├── sessions-end/
│   ├── sessions-kick-player/
│   ├── sessions-set-prompt-library/
│   ├── sessions-analytics/
│   ├── answers-submit/
│   └── votes-submit/
├── migrations/         # Database migrations
└── config.toml        # Supabase configuration
```

## 🗄️ Database Schema

### Core Tables

- **sessions** - Game sessions with rounds, prompts, and state
- **teams** - Players/teams in sessions
- **answers** - Team submissions for prompts
- **votes** - Votes on answers
- **session_analytics** - Session statistics

### Key Features

- **Realtime enabled** on all game tables
- **RLS policies** for security
- **JSONB columns** for flexible game state
- **Automatic triggers** for timestamps and activity tracking
- **Helper functions** for common operations

## 🛠️ Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Link to your Supabase project

```bash
cd Social/supabase
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Push database migrations

```bash
supabase db push
```

### 4. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy sessions-create
supabase functions deploy sessions-join
supabase functions deploy sessions-start
supabase functions deploy sessions-advance
supabase functions deploy sessions-end
supabase functions deploy sessions-kick-player
supabase functions deploy sessions-set-prompt-library
supabase functions deploy sessions-analytics
supabase functions deploy answers-submit
supabase functions deploy votes-submit

# Or deploy all at once (if you have the batch script)
npm run deploy:functions
```

### 5. Set environment variables

In your Supabase dashboard, set the following secrets for Edge Functions:
- `SUPABASE_URL` (auto-configured)
- `SUPABASE_ANON_KEY` (auto-configured)
- `SUPABASE_SERVICE_ROLE_KEY` (auto-configured)

### 6. Configure your app

Update your `.env` files:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📡 Edge Functions

All Edge Functions follow a consistent pattern:

1. **CORS handling** for web requests
2. **Authentication** via JWT tokens
3. **Input validation** with proper error messages
4. **Database operations** with Supabase client
5. **Error handling** with appropriate HTTP status codes

### Example Usage

```typescript
// From your frontend
const { data, error } = await supabase.functions.invoke('sessions-create', {
  body: {
    teamName: 'My Team',
    venueName: 'My Venue',
    promptLibraryId: 'classic'
  }
});
```

## 🔒 Security

- **Row Level Security** enabled on all tables
- **Anonymous auth** supported for public games
- **Host-only actions** verified in Edge Functions
- **Input validation** on all user data
- **Profanity filtering** on text submissions

## 🎮 Game Flow

1. **Create Session** (`sessions-create`) - Host creates a game
2. **Join Session** (`sessions-join`) - Players join with code
3. **Start Game** (`sessions-start`) - Host starts, generates rounds
4. **Answer Phase** (`answers-submit`) - Teams submit answers
5. **Vote Phase** (`votes-submit`) - Teams vote on answers
6. **Advance** (`sessions-advance`) - Progress through phases
7. **Results** - Scores calculated automatically
8. **End** (`sessions-end`) - Host ends game

## 📊 Realtime Subscriptions

Enable real-time updates in your frontend:

```typescript
// Subscribe to session changes
supabase
  .channel(`session:${sessionId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'sessions',
    filter: `id=eq.${sessionId}`
  }, (payload) => {
    // Handle session update
  })
  .subscribe();

// Subscribe to teams
supabase
  .channel(`teams:${sessionId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'teams',
    filter: `session_id=eq.${sessionId}`
  }, (payload) => {
    // Handle team changes
  })
  .subscribe();
```

## 🧪 Testing

Test Edge Functions locally:

```bash
# Start Supabase locally
supabase start

# Run a specific function
supabase functions serve sessions-create

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/sessions-create' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"teamName":"Test Team"}'
```

## 📝 Notes

- All Edge Functions use **Deno** (not Node.js)
- Database uses **snake_case** (Postgres convention)
- Frontend types use **camelCase** (JavaScript convention)
- Type conversions handled in `_shared/types.ts`

## 🔄 Differences from Firebase

| Feature | Firebase | Supabase |
|---------|----------|----------|
| Database | Firestore (NoSQL) | PostgreSQL (SQL) |
| Functions | Cloud Functions (Node) | Edge Functions (Deno) |
| Realtime | onSnapshot | Realtime subscriptions |
| Auth | Firebase Auth | Supabase Auth |
| Security | Security Rules | RLS Policies |

## 🚢 Deployment

Edge Functions deploy to Supabase's global edge network for low latency worldwide.

```bash
# Production deployment
supabase functions deploy --project-ref YOUR_PROJECT_REF

# View logs
supabase functions logs sessions-create
```

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)


