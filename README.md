# Raw Material Tracker

SvelteKit 5 / Svelte 5 app for registering raw-material receptions in an industrial kitchen.

## Tech stack

- **Framework:** SvelteKit 5 + Svelte 5
- **Styling:** Tailwind CSS 4 + shadcn-svelte-style UI components
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email + password)
- **Deployment:** Vercel (`@sveltejs/adapter-vercel`)

## Prerequisites

1. [Supabase project](https://supabase.com) — create one and run the schema from `supabase/schema.sql` in the SQL Editor
2. [Vercel account](https://vercel.com) — connected to your Git repository

## Environment variables

Copy `.env.example` to `.env` and fill in the values from your Supabase project dashboard:

```bash
cp .env.example .env
```

| Variable | Where to find it |
|---|---|
| `PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → service_role key |

**Never commit `.env` to Git.** The `.env.example` file is safe to commit.

## Run locally

```bash
npm install
npm run dev
```

## Validate

```bash
npm run check
npm run build
```

## Deploy to Vercel

1. Push the repo to GitHub/GitLab
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the three environment variables above in Vercel's project settings
4. Deploy — Vercel detects SvelteKit automatically via `@sveltejs/adapter-vercel`

## Project structure

```
src/
  lib/
    supabase.ts              # Browser-side Supabase client (anon key)
    server/
      supabase.ts            # Server-side Supabase client (service-role key)
      auth.ts                # User type + profile loader
      db.ts                  # All database queries (replaces mock-db)
  routes/
    login/                   # Login page
    logout/                  # Logout action
    materials/               # Material catalogue
    receptions/              # Reception list, forms, export, print
  hooks.server.ts            # Auth session handling
supabase/schema.sql          # Full database schema
```
