# Social Game Engine **Social** — Comprehensive Project Report

**Date:** December 16, 2025
**Version:** 1.0 (MVP Launch Roadmap)
**Team:** 4 UVic Co-founders (Kris, Pat, Eric, Braden) — **140 hrs/week capacity**
**Target:** **$44k MRR** from **59 Victoria venues** by **Week 12**
**Platform:** Turborepo monorepo → React PWA games (**Top Comment + VIBox**) on Supabase

---

## Executive Summary

**Social** is a B2B SaaS platform (**$299/mo per venue**, 14‑day free trial) powering **hostless bar games** via QR codes.

* **Week 1:** Launch **Top Comment** (Twitter‑parody live voting game)
* **Week 4:** Launch **VIBox** (AI jukebox)

A shared monorepo powers Supabase realtime queues, OpenAI moderation, and React/Tailwind UI across all games.

### Financial Snapshot

* **Week 4:** 5 venues → **$1.5k MRR**
* **Week 12:** 59 pubs → **$44k MRR (projected)**

**Revenue Split**

* 60% servers ($45/shift)
* 40% venue / Social (Helcim‑tracked tips)

**Patron Microtransactions**

* $1.50 per game play

**Tech Costs**

* $500 startup
* ~$50/month at scale

**ROI**

* Break‑even by **Week 8**
* UVic co‑op validation by **Week 12**

---

## Pricing & Revenue Model

| Tier           | Price / Month (CAD) | Features                                 | Target           | Conversion KPI     |
| -------------- | ------------------- | ---------------------------------------- | ---------------- | ------------------ |
| **Freemium**   | $0 (14 days)        | Top Comment, 100 scans/month             | Felicita’s pilot | 70% → Pro          |
| **Pro**        | **$299**            | Top Comment + VIBox, 5k scans, custom QR | 59 Victoria pubs | 40% scan rate      |
| **Enterprise** | Custom ($999+)      | 3+ games, API, white‑label, 50k scans    | Chains (10+)     | $6k MRR by Week 12 |

### Patron Revenue (Per Venue / Night)

* Top Comment: 40 plays × $1.50 = **$60**
* VIBox: 20 songs × $2.00 = **$40**
* Server tips (60% cut): **$45 / shift**

**Total:** ~$145/night → **$750/month per venue**

**Team Revenue Split:** 60% servers, 40% Social/venue

---

## Technical Architecture (Turborepo Monorepo)

```text
social/
├── apps/
│   ├── web/        # social.gg landing + venue dashboard
│   ├── topcomment/ # Game 1: Twitter parody PWA
│   ├── vibox/      # Game 2: AI jukebox PWA
│   └── admin/      # Supabase venue analytics
├── packages/
│   ├── ui/         # Shared Button, Leaderboard, QR scanner
│   ├── db/         # Supabase schema + realtime queries
│   ├── ai/         # OpenAI moderation + Suno wrapper
│   └── payments/   # Stripe / Helcim webhooks
├── turbo.json      # Build orchestration
└── pnpm-workspace.yaml
```

### Week 1 Setup

```bash
pnpm create turbo@latest social --use-pnpm
cd social
pnpm add -w @supabase/supabase-js openai lucide-react react-hook-form
pnpm add -D turbo @tailwindcss/vite
mkdir -p apps/topcomment packages/{ui,db,ai}
pnpm dev --filter=topcomment
vercel deploy --prod
```

Live at: `social.gg/topcomment`

---

## Supabase Schema (Shared Across Games)

```sql
CREATE TABLE venues (
  id UUID PRIMARY KEY,
  name TEXT,
  qr_code TEXT UNIQUE
);

CREATE TABLE games (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES venues,
  type TEXT CHECK (type IN ('topcomment', 'vibox')),
  status TEXT CHECK (status IN ('waiting', 'playing', 'voting'))
);

CREATE TABLE rounds (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games,
  prompt TEXT,
  entries JSONB[]
);
```

**Realtime Subscriptions**

* Channel: `games:venue_id`
* RLS: `venue_id = auth.jwt()->venue_id`

---

## Feature Specifications

### Game 1: Top Comment (Twitter Parody)

**MVP Scope (Weeks 1–4)**

* QR scan → anonymous nickname → join table
* 3‑round flow: prompt → submit roast → emoji voting
* Live leaderboard on bar TVs (Supabase realtime)
* $1.50 tip‑to‑vote (Helcim / Stripe)

**Technical Flow**

* Auth: `supabase.auth.signInAnonymously()`
* State machine: `waiting → entries → voting → winners`
* Moderation: OpenAI `gpt-4o-mini` (~$0.001/scan)

---

### Game 2: VIBox (AI Jukebox)

**Alpha Scope (Weeks 4–6)**

* QR scan → vibe picker (chill / hype / party)
* Suno API → custom AI track (£2 per play)
* Queue display on TVs + skip voting
* No persistent history (alpha)

**Technical Flow**

* `vibe → sunoapi.org/v1/generate`
* Store tracks in Supabase Storage
* Schema reuse via `games.type = 'vibox'`

---

### Venue Dashboard (Weeks 7–8)

**Metrics**

* Scans/day
* Revenue/hour
* Server tips

**Controls**

* Start/stop games
* Regenerate QR codes

**Exports**

* CSV for Helcim reconciliation

---

## 12‑Week Timeline

| Phase       | Focus                 | Owner(s)          | Cost |
| ----------- | --------------------- | ----------------- | ---- |
| Weeks 1–3   | Engine + shared infra | Braden, Kris, Pat | $50  |
| Week 4      | Top Comment MVP       | Kris, Pat, Eric   | $250 |
| Weeks 5–6   | VIBox Alpha           | Eric, Braden      | $25  |
| Weeks 7–8   | Venue dashboard       | Kris, Pat         | $0   |
| Weeks 9–10  | 10 venue pilots       | Pat               | $0   |
| Weeks 11–12 | Validation + pipeline | Full team         | $0   |

---

## Team Roles & Capacity

| Role                    | Name   | Hours / Week | Split             | Ownership         |
| ----------------------- | ------ | ------------ | ----------------- | ----------------- |
| Hybrid Visionary        | Kris   | 40           | 60% Dev / 40% Biz | Engine + sales    |
| Hybrid Growth Engineer  | Pat    | 40           | 60% Dev / 40% Biz | Games + growth    |
| Product / UX Lead       | Eric   | 40           | 100% Dev          | UI + PWAs         |
| Infrastructure Engineer | Braden | 20           | 100% Dev          | Supabase + deploy |

---

## Week 1 Action Plan (Solo: Kris / Pat)

### Today (4 hrs)

* Create Turborepo
* Top Comment QR join screen
* Shared UI components
* Supabase schema
* Local PWA running

### Tomorrow (6 hrs)

* OpenAI moderation endpoint
* Supabase auth + realtime
* Deploy `social.gg/topcomment`
* Generate 10 test QR codes

### Day 3 (3 hrs)

* Felicita’s table mockup
* Sticker design
* UVic co‑op pitch deck

---

## Cost Breakdown

| Category          | Item               | Cost (CAD)  | Timing |
| ----------------- | ------------------ | ----------- | ------ |
| Domain            | social.gg          | $100 / year | Week 1 |
| Trademark         | CIPO intent‑to‑use | $250        | Week 1 |
| Stickers          | 1,000 prints       | $100        | Week 2 |
| Supabase          | Pro tier           | $25 / month | Week 4 |
| Vercel            | Pro                | $20 / month | Week 4 |
| OpenAI            | Moderation         | $5 / month  | Week 4 |
| Suno              | Credits            | $10         | Week 5 |
| **Total Startup** |                    | **$485**    |        |

---

## Success Metrics & KPIs

| Week    | Metric               | Target        | Measurement    |
| ------- | -------------------- | ------------- | -------------- |
| 4       | Top Comment adoption | 40% scan rate | Supabase       |
| 8       | Paid venues          | 5 @ $299      | Stripe         |
| 12      | MRR projection       | $44k          | Sales pipeline |
| Ongoing | Server income        | $45/shift     | Helcim         |

---

## Risk Mitigation

| Risk               | Probability | Mitigation              |
| ------------------ | ----------- | ----------------------- |
| Low venue adoption | Medium      | Free Felicita’s pilot   |
| Supabase scaling   | Low         | Dedicated infra owner   |
| Moderation failure | Low         | Regex + manual fallback |
| Team ramp delay    | Medium      | Solo Weeks 1–2          |

---

## Appendices

### Supabase RLS Policy

```sql
ALTER POLICY "Patron venue access" ON games
FOR ALL USING (venue_id = auth.jwt()->>'venue_id');
```

### Sticker Copy

> 🔥 **TOP COMMENT: Scan to Roast Live**
> Own tonight’s feed → **$1.50 votes**

QR: `social.gg/topcomment?venue=felicitas`

### UVic Co‑op Pitch

**“4.5 co‑op units → $44k MRR by graduation”**

* Engine + 2 games live by Week 4
* Felicita’s pilot data Week 2
* 59‑pub pipeline by Week 12

---

**Next Action:** `pnpm create turbo social` → **Week 1 complete by EOD**
