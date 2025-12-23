# Vercel Deployment Guide

## Project Setup

This monorepo contains 5 separate Vercel projects:

1. **event-platform** - Universal event host (Top Comment Event Mode)
   - Deploy from: `apps/event-platform/`
   - Domain: `events.social.gg` (or similar)

2. **topcomment-247** - Top Comment 24/7 Mode (Facebook wall)
   - Deploy from: `apps/topcomment-247/`
   - Domain: `topcomment.social.gg`

3. **vibox-247** - VIBox 24/7 Jukebox
   - Deploy from: `apps/vibox-247/`
   - Domain: `vibox.social.gg`

4. **web** - Landing page + admin panel
   - Deploy from: `apps/web/`
   - Domain: `social.gg`

5. **dashboard** - Venue analytics dashboard
   - Deploy from: `apps/dashboard/`
   - Domain: `dashboard.social.gg`

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to https://vercel.com/new
2. Import your Git repository
3. Create 5 separate projects (one for each app)

### 2. Configure Each Project

For each project, set:

**Build & Development Settings:**
- Framework Preset: Vite
- Root Directory: `apps/{app-name}/`
- Build Command: Uses turbo (configured in vercel.json)
- Output Directory: `dist`
- Install Command: `pnpm install`

**Environment Variables:**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_OPENAI_API_KEY`: OpenAI API key (for moderation)
- `STRIPE_SECRET_KEY`: Stripe secret key (for web/dashboard)

### 3. Turborepo Remote Caching (Optional)

Enable faster builds with Turborepo Remote Caching:

```bash
pnpm turbo login
pnpm turbo link
```

Then add to each Vercel project:
- Environment Variable: `TURBO_TOKEN` (from `turbo login`)
- Environment Variable: `TURBO_TEAM` (your team slug)

## Build Commands

Each app's `vercel.json` specifies the Turborepo build command:

```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@social/app-name"
}
```

This ensures:
- All dependencies are built first
- Shared packages are included
- Turborepo caching is utilized

## Domain Configuration

After deployment, configure custom domains:

1. **social.gg** → apps/web
2. **events.social.gg** → apps/event-platform
3. **topcomment.social.gg** → apps/topcomment-247
4. **vibox.social.gg** → apps/vibox-247
5. **dashboard.social.gg** → apps/dashboard

## Post-Deployment Checklist

- [ ] All 5 apps deployed successfully
- [ ] Custom domains configured
- [ ] Environment variables set for all projects
- [ ] Supabase URL and keys configured
- [ ] Test each app in production
- [ ] Verify Turborepo caching (optional)

