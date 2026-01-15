# VIBox API

Centralized API server for VIBox music queue system. Serves multiple applications with a unified queue.

## Features

- REST API for queue management
- Real-time updates via Supabase subscriptions
- Analytics endpoints
- Health monitoring
- CORS-enabled for multi-app access

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your Supabase credentials

4. Run development server:
```bash
pnpm dev
```

## API Endpoints

### Queue Management
- `GET /api/queue` - Get current queue
- `POST /api/queue` - Add track to queue
- `DELETE /api/queue/:id` - Remove track
- `PUT /api/queue/:id/play` - Mark track as played
- `PUT /api/queue/:id/skip` - Skip track
- `DELETE /api/queue/clear` - Clear entire queue

### Analytics
- `GET /api/analytics/popular` - Popular tracks
- `GET /api/analytics/engagement` - User engagement stats
- `GET /api/analytics/time` - Time-based analytics

### Health
- `GET /api/health` - API health check

## Deployment

Deploy to Vercel:
```bash
pnpm deploy
```

## Real-time Updates

Clients should connect to Supabase directly for real-time queue updates:
```typescript
const channel = supabase
  .channel('vibox-queue')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'vibox_queue' }, handler)
  .subscribe();
```
