# Vercel Deployment Guide

## Project Setup

This monorepo contains multiple Vercel projects:

### **Primary Projects** (Recommended)

1. **web** - Main site with subdomain routing
   - Deploy from: `apps/web/`
   - Domains: 
     - `playnow.social` (main landing page)
     - `pub.playnow.social` (pub comment walls)
   - Features subdomain-based routing for different experiences

2. **event-platform** - Live event hosting platform
   - Deploy from: `apps/event-platform/`
   - Domain: `events.playnow.social`

3. **dashboard** - Venue analytics dashboard
   - Deploy from: `apps/dashboard/`
   - Domain: `dashboard.playnow.social`

### **Optional Standalone Apps**

4. **vibox** - VIBox 24/7 Jukebox (if deployed separately)
   - Deploy from: `apps/vibox/`
   - Domain: `vibox.playnow.social`

5. **topcomment-247** - Deprecated (functionality moved to web app)
   - ~~Deploy from: `apps/topcomment-247/`~~
   - Use `pub.playnow.social` instead (routed via web app)

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

1. **playnow.social** → apps/web (main landing)
2. **pub.playnow.social** → apps/web (pub walls - subdomain routing)
3. **events.playnow.social** → apps/event-platform
4. **dashboard.playnow.social** → apps/dashboard
5. **vibox.playnow.social** → apps/vibox (optional)

## Post-Deployment Checklist

- [ ] All 5 apps deployed successfully
- [ ] Custom domains configured
- [ ] Environment variables set for all projects
- [ ] Supabase URL and keys configured
- [ ] Test each app in production
- [ ] Verify Turborepo caching (optional)

