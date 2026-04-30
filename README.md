# Health Journal AI

An open-source AI-powered health journaling app. Write freely — the AI extracts health signals from your entries and builds a picture of your wellbeing over time.

**This is a bring-your-own-keys project. You run your own database and AI keys. No data is shared with anyone.**

## What it does

- Rich text journal editor
- AI extracts 40+ health signals per entry: exercise, nutrition, sleep, stress, mood, symptoms, medications, and more
- Health analytics dashboard with trends over time
- Voice dictation via Whisper
- Ask your journal questions via AI coaching

## Stack

- Next.js 15, TypeScript
- Neon (Postgres) + Drizzle ORM
- Better Auth
- Claude Sonnet (Anthropic) — health analysis
- Whisper (OpenAI) — voice dictation
- TipTap — rich text editor
- Vercel — deployment

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/cykj40/health-journal-ai.git
cd health-journal-ai
npm install
```

### 2. Set up your database

Create a free Postgres database at [neon.tech](https://neon.tech). Copy the connection string.

### 3. Get your API keys

- **Anthropic** (required): [console.anthropic.com](https://console.anthropic.com) — used for journal analysis and health extraction
- **OpenAI** (required): [platform.openai.com](https://platform.openai.com) — used for voice dictation (Whisper)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`. See `.env.example` for descriptions of each variable.

### 5. Run database migrations

```bash
npx drizzle-kit push
```

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example` in the Vercel dashboard under Settings → Environment Variables
4. Deploy

## Data & Privacy

Every user who runs this app owns their own data completely. The app stores journal entries and health metrics in **your** Neon database. AI analysis is done via **your** API keys. No data ever touches a shared server.

This project does not collect, aggregate, or store any user data on behalf of contributors or maintainers.

## License

MIT
