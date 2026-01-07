# Social Game Engine

**Host-less bar games powered by QR codes and AI.** Two games, one button, infinite revenue.

[![Built with Supabase](https://img.shields.io/badge/Built%20with-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

## 🎮 What We Build

**Social** is a B2B SaaS platform ($299/month) powering host-less bar entertainment through QR codes, targeting Victoria, BC venues.

### Top Comment (Week 1)
- Twitter-parody live voting game
- QR scan → anonymous team → submit creative roasts → vote on favorites → live leaderboards
- **$1.50 per play** = $60/night venue revenue

### VIBox (Week 4)
- AI jukebox powered by Suno API
- QR scan → vibe picker (chill/hype/party) → AI generates track → plays to venue speakers
- **$2.00 per song** = $40/night venue revenue

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm
- Supabase account

### Setup
```bash
# Clone the repo
git clone <repository-url>
cd social

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### Environment Setup
```bash
# Copy environment file
cp .env.example .env.local

# Add your Supabase keys
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key
SUNO_API_KEY=your_suno_key
HELCIM_API_KEY=your_helcim_key
```

## 🏗️ Architecture

```
social/
├── apps/
│   ├── event-platform/    # Game host dashboard + player PWAs
│   ├── pubFeed/           # Pub Feed social game PWA
│   ├── vibox-247/         # VIBox game PWA
│   ├── dashboard/         # Venue analytics dashboard
│   └── web/               # Marketing site
├── packages/
│   ├── ui/                # Shared React components
│   ├── db/                # Supabase types + queries
│   ├── ai/                # OpenAI + Suno integrations
│   └── payments/          # Helcim/Stripe webhooks
├── supabase/
│   ├── migrations/        # Database schema
│   └── functions/         # Edge functions
└── docs/                  # Product docs
```

## 🛠️ Tech Stack

- **Framework:** Turborepo monorepo + React/TypeScript
- **Database:** Supabase (PostgreSQL + realtime)
- **Hosting:** Vercel
- **Payments:** Helcim/Stripe
- **AI:** OpenAI (moderation) + Suno (music generation)
- **Styling:** Tailwind CSS

## 📊 Business Model

- **Venue Subscription:** $299/month (Pro plan)
- **Venue Revenue:** 100% of patron payments ($1.50–$2.00 per play)
- **Trial:** 14-day free trial with library lock-in
- **Target:** $44k MRR from 59 Victoria venues by Week 12

## 🏃‍♂️ Development

### Available Scripts
```bash
pnpm dev          # Start all apps in development
pnpm build        # Build all packages and apps
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
pnpm test         # Run tests
```

### Database
```bash
# Start local Supabase
pnpm supabase:start

# Run migrations
pnpm supabase:db:push

# Generate types
pnpm supabase:gen-types
```

## 📁 Project Structure

### Apps
- **event-platform:** Host controls + shared game engine
- **pubFeed:** Pub Feed social game PWA
- **vibox-247:** VIBox AI jukebox
- **dashboard:** Venue analytics
- **web:** Marketing site

### Packages
- **ui:** Shared React components + Tailwind config
- **db:** Supabase client + type definitions
- **ai:** OpenAI moderation + Suno API wrapper
- **payments:** Payment processing integrations

## 📚 Documentation

- [Product Vision](docs/01-product-vision.md)
- [Technical Architecture](docs/04-tech-architecture.md)
- [Feature Roadmap](docs/05-feature-roadmap.md)
- [API Endpoints](docs/04-tech-architecture.md#api-architecture)
- [Database Schema](docs/04-tech-architecture.md#supabase-schema-shared-across-games)

## 🎯 Validation

**Pilot Results (Christie's Carriage House Pub):**
- 35 participants, 2-hour engagement
- Immediate pricing interest from venue
- 15-25% dwell time increase validated

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Website:** [playnow.social](https://playnow.social)
- **Email:** team@playnow.social
- **Demo:** [topcomment.playnow.social](https://topcomment.playnow.social)

---

*"Two games. One button. Infinite revenue."*