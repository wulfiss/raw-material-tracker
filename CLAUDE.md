# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build
npm run check     # Type-check with svelte-check
npx vitest run    # Run tests (after vitest is installed per qwend.md)
```

## Architecture

SvelteKit 2 / Svelte 5 prototype for tracking raw-material receptions in an industrial kitchen. Uses a local Supabase PostgreSQL database for development and a hosted Supabase project for production. Data persists across server restarts when using Supabase. Vercel adapter configured for deployment.

### Auth

`src/hooks.server.ts` reads an httpOnly session cookie → `event.locals.user`. All routes except `/login` are guarded. Three mock users live in `src/lib/server/mock-auth.ts` (admin / quality / viewer roles — stored but not enforced yet).

### Data layer

`src/lib/server/db.ts` — Supabase client initialized with the service-role key for server-side access.

`src/lib/server/repository.ts` — all database queries (materials, receptions, saved views). Validation for receptions lives in `src/lib/server/reception-actions.ts`; material validation is inline in each `+page.server.ts`.

`computeExpirationStatus()` uses a hardcoded `America/Argentina/Buenos_Aires` timezone and a 7-day near-expiry window.

### Routing conventions

- `+page.server.ts` exports `load` + named `actions` (create / update / delete / toggle)
- `+page.svelte` binds to `data` from `load`, posts via SvelteKit `enhance`
- `src/routes/receptions/export/+server.ts` — GET CSV download
- `src/routes/receptions/mobile/` — mobile-optimised observation entry
- `src/routes/receptions/print/` — print layout

### Components

`src/lib/components/ui/` — thin shadcn-svelte wrappers (button, card, input, select, table, badge, alert, label, textarea). Import via `$lib/components/ui/...`.

`src/lib/components/receptions/ReceptionFormFields.svelte` — shared form used by new and edit reception pages.

`src/lib/utils.ts` — exports `cn()` (clsx + tailwind-merge).

### i18n

`src/lib/i18n/` — Svelte store-based i18n. `t` is a derived store; `getT()` is for server-side use. Spanish (es-AR) only. All UI strings must use translation keys — no hard-coded English labels.

### Styling

Tailwind CSS 4 via Vite plugin. Theme defined as CSS variables in `src/styles.css`. Primary: green `hsl(150 60% 29%)`. Use theme vars (`bg-primary`, `ring-warning`) — avoid raw Tailwind color utilities that bypass the theme.

### Path alias

`$lib` → `src/lib/`

### Local Supabase development

Install [Supabase CLI](https://supabase.com/docs/guides/cli), then:

```bash
supabase start      # Start local PostgreSQL + Auth + Studio
supabase db reset   # Apply migrations + seed data
npm run dev         # Dev server at localhost:5173
supabase stop       # Stop containers
```

Schema source of truth is `supabase/migrations/001_initial_schema.sql`. The app connects via service-role key (`SUPABASE_SERVICE_ROLE_KEY`) which bypasses RLS. Seed data lives in `supabase/seed.sql` and disables RLS for local dev convenience.
