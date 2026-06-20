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

SvelteKit 2 / Svelte 5 prototype for tracking raw-material receptions in an industrial kitchen. Runs on an **in-memory mock database** — all data resets on server restart. Vercel adapter configured for future deployment.

### Auth

`src/hooks.server.ts` reads an httpOnly session cookie → `event.locals.user`. All routes except `/login` are guarded. Three mock users live in `src/lib/server/mock-auth.ts` (admin / quality / viewer roles — stored but not enforced yet).

### Data layer

`src/lib/server/mock-db.ts` — all in-memory state (materials, receptions, saved views). All CRUD functions are here. Validation for receptions lives in `src/lib/server/reception-actions.ts`; material validation is inline in each `+page.server.ts`.

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

### Supabase (future)

Schema in `supabase/schema.sql` is **not connected**. Field names differ from mock (`default_unit` vs `unit`, table `receipts` vs `receptions`). Do not assume mock names match the SQL schema.
