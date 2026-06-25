# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite)
npm run check     # Type-check with svelte-check (run this before committing)
npm run build     # Production build (also catches type errors)
npm run preview   # Preview the production build locally
```

There is no test suite. `npm run check` is the primary validation command.

## Environment Setup

Copy `.env.example` to `.env` and fill in three Supabase values:

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The database schema lives in `supabase/schema.sql` — run it once in the Supabase SQL Editor when setting up a new project.

## Architecture

**SvelteKit 5 + Svelte 5** app using Svelte 5 runes syntax (`$props()`, `$derived`, `$state`). Deployed to Vercel via `@sveltejs/adapter-vercel`.

### Data layer

All database access goes through **`src/lib/server/db.ts`** — this is the single source of truth for:
- All TypeScript types (`Material`, `Reception`, `ReceptionListItem`, etc.)
- All enum constants (`units`, `storageConditions`, `receptionStatuses`)
- All validation type guards (`isUnit`, `isReceptionStatus`, `isDateString`, etc.)
- All CRUD functions against Supabase

The DB layer uses two distinct Supabase clients:
- `src/lib/server/supabase.ts` — singleton **service-role** client (`supabaseAdmin`), used by all server-side DB queries (bypasses RLS)
- `src/lib/supabase.ts` — singleton **anon** client, used browser-side and in `hooks.server.ts` for auth session management

### Auth flow

`src/hooks.server.ts` runs on every request:
1. Creates a per-request Supabase SSR client and attaches it to `event.locals.supabase`
2. Calls `getProfile()` (from `src/lib/server/auth.ts`) and sets `event.locals.user`
3. Redirects unauthenticated requests to `/login` (only `/login` is public)

`User` type has three roles: `admin`, `quality`, `viewer`. The `locals.user` is passed down to server actions via `locals.user!`.

### Route pattern

Each feature route (`materials/`, `receptions/`) follows the same convention:
- `+page.server.ts` — `load()` fetches from `db.ts`; `actions` handle form `POST`s
- Validation is done in the page server action before calling `db.ts`
- On error: `return fail(400, { message, fields })` to repopulate the form
- On success: `redirect(303, '/receptions')` or similar
- Form error messages come from `translations['es-AR']` imported directly in server files

Notable special routes:
- `receptions/export/+server.ts` — `GET` endpoint that streams a CSV response
- `receptions/mobile/` — simplified single-page reception entry for mobile use
- `receptions/print/` — print-optimised view

### i18n

Translations live in `src/lib/i18n/translations.ts` with two locales: `en` and `es-AR`. The default locale is **`es-AR`** (set in `src/lib/i18n/store.ts`).

- In Svelte components: import the reactive `t` store from `$lib/i18n` and use `$t.section.key`
- In server files: import `translations` directly and use `translations['es-AR'].section.key`
- The CSV export hard-codes `es-AR` for column headers

### UI components

`src/lib/components/ui/` contains shadcn-svelte-style components (Button, Card, Input, Table, Badge, etc.). The `cn()` utility in `src/lib/utils.ts` merges Tailwind classes via `clsx` + `tailwind-merge`. The alias `@/*` resolves to `src/lib/*`.

### Key behaviours to preserve

- **`deleteMaterial`** soft-deletes (sets `active: false`) instead of hard-deleting when the material has existing reception records. This is intentional for traceability.
- **`listReceptions`** caps results at 100 rows from Supabase, then applies in-memory filtering for search text, category, supplier, storage condition, and expiration status. Date range and `materialId` filters are pushed to the DB query.
- **`todayInTimeZone`** always uses `America/Argentina/Buenos_Aires` for date comparisons. Expiration "near expiry" threshold is 7 days.
- **`reception_views`** table stores saved filter presets. Four built-in default views (All, Expired, Near expiry, Missing) are returned from `listReceptionViews()` without being stored in the DB.
