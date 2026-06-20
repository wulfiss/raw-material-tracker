# AGENTS.md

Project instructions and task list for OpenCode agents (Qwen 3.6 35B A3B).

## Project overview

SvelteKit 2 / Svelte 5 app for tracking raw-material receptions in an industrial
kitchen. Currently backed by an **in-memory mock database** (`src/lib/server/mock-db.ts`).
The active migration replaces that with a **local Supabase instance** (PostgreSQL via
Docker), then applies a set of bug fixes and cleanups on top.

All UI text is in Spanish (es-AR). Translation keys live in
`src/lib/i18n/translations.ts`. Never hardcode user-visible strings — always use `t.*`.

## Stack

- SvelteKit 2 / Svelte 5 (runes: `$props`, `$state`, `$derived`)
- Tailwind CSS 4 via Vite plugin — use theme vars (`bg-primary`, `ring-warning`)
- shadcn-svelte UI components in `src/lib/components/ui/`
- Supabase JS client (`@supabase/supabase-js`) — server only, service-role key
- Vitest for tests (`npx vitest run`)

## Key files

| File | Purpose |
|------|---------|
| `src/lib/server/mock-db.ts` | Data layer — being replaced with Supabase |
| `src/lib/server/db.ts` | Supabase client (created in S3) |
| `src/lib/server/reception-actions.ts` | Shared form validation for receptions |
| `src/lib/server/mock-auth.ts` | Cookie-based mock auth — keep as-is |
| `src/hooks.server.ts` | Auth guard — redirects unauthenticated users |
| `src/lib/i18n/translations.ts` | All UI strings (es / es-AR) |
| `supabase/schema.sql` | Postgres schema applied via `supabase db reset` |
| `supabase/seed.sql` | Seed data applied after reset |

## DB field mapping (TypeScript ↔ Postgres)

| TS field | DB column |
|----------|-----------|
| `storageCondition` | `storage_condition` |
| `minStock` | `min_stock` |
| `expirationRequired` | `expiration_required` |
| All other fields | identical (already snake_case) |

## Testing conventions

- Test files: `src/**/*.test.ts`
- Run all: `npx vitest run`
- Integration tests hit the **local Supabase instance** (must be running: `npx supabase start`)
- Use `created_by = 'test-user'` for all test insertions
- Clean up after each test: delete rows where `created_by = 'test-user'`
- Import the DB client with relative path: `import { db } from '../db'`
- Import vitest: `import { describe, it, expect, afterEach } from 'vitest'`

## Verification commands

```bash
npm run check          # TypeScript + Svelte type check
npx vitest run         # All tests
npm run build          # Production build (must pass before done)
npx supabase db reset  # Reapply schema + seed (wipes all data)
```

---

## Task checklist

Tasks are ordered — complete them in sequence. Mark each `[x]` when done and
verified. Do not start a task until the previous one passes its verify step.

### PHASE 0 — Manual prerequisites (no AI needed)

- [ ] **P0** Install Supabase CLI, run `npx supabase init`, run `npx supabase start`
- [ ] **P0** Install packages: `npm install @supabase/supabase-js && npm install -D dotenv`
- [ ] **P0** Install vitest: `npm install -D vitest`
- [ ] **P0** Create `.env.local` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **P0** Create `vitest.config.ts` (see below)

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
config({ path: '.env.local' });
export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] }
});
```

---

### PHASE 1 — Schema

- [ ] **S1** Replace `supabase/schema.sql` — rename `receipts`→`receptions`,
  `default_unit`→`unit`, fix unit enum `'l'`→`'liter'`, add missing columns
  (`storage_condition`, `min_stock`, `expiration_required`, `created_by`,
  `created_by_name` on both tables), add `reception_views` table.
  **Verify:** `npx supabase db reset` — 3 tables visible in Studio at `localhost:54323`

- [ ] **S2** Create `supabase/seed.sql` — 3 materials (Chicken breast, Tomato, Cooking oil)
  and 1 reception for Chicken breast. Use `ON CONFLICT DO NOTHING`.
  **Verify:** `npx supabase db reset` — materials table has 3 rows, receptions has 1

- [ ] **S3** Create `src/lib/server/db.ts` — Supabase client using `process.env`.
  Update `vitest.config.ts` to load `.env.local` via `dotenv` at module level.
  **Verify:** `npm run check`

---

### PHASE 2 — Data layer migration

- [ ] **M1** Rewrite `src/lib/server/mock-db.ts` — keep all exported types, constants,
  type-guards, `computeExpirationStatus`, `todayInTimeZone`. Delete all in-memory
  state (`let materials`, `let receptions`, etc.), seed data, `now()`, `id()`.
  Add `import { db } from './db'`. Remove CRUD function bodies (added in M2–M4).
  **Verify:** `npm run check` (errors about missing exports are expected at this stage)

- [ ] **M2** Add materials CRUD to `mock-db.ts` using Supabase.
  Functions: `listMaterials`, `listActiveMaterials`, `getMaterial`, `toggleMaterialStatus`,
  `deleteMaterial`, `createMaterial`, `updateMaterial`.
  Map snake_case DB columns to camelCase TS fields via a private `toMaterial()` helper.
  **Verify:** `npm run check` — materials errors gone. Dev server: `/materials` shows seed data

- [ ] **M3** Add receptions CRUD + `getExpirationSummary` to `mock-db.ts` using Supabase.
  Functions: `listReceptions` (returns `{ rows, truncated }`), `getReception`,
  `createReception`, `updateReception`, `deleteReception`, `getExpirationSummary`.
  Post-filter in JS for: search (incl. material name), category, storageCondition,
  expirationStatus. Apply 100-row cap and return `truncated` flag.
  **Verify:** `npm run check`. Dev server: `/receptions` shows seed reception

- [ ] **M4** Add reception views CRUD to `mock-db.ts` using Supabase.
  Functions: `listReceptionViews`, `saveReceptionView`, `deleteReceptionView`.
  Keep `defaultReceptionViews` constant in-code (not in DB). Custom views go to
  `reception_views` table. Include uniqueness check (case-insensitive) in `saveReceptionView`.
  **Verify:** `npm run check`. Dev server: save a custom view → persists on reload

- [ ] **M5** Update callers of `listReceptions` that expect a plain array.
  Files: `receptions/+page.server.ts`, `receptions/mobile/+page.server.ts`,
  `receptions/print/+page.server.ts`, `receptions/export/+server.ts`.
  Add `{#if data.truncated}` notice to `receptions/+page.svelte`.
  Add translation key `truncatedNotice` to both locale objects in `translations.ts`.
  **Verify:** `npm run check && npm run dev` — all pages load without errors

---

### PHASE 3 — Bug fixes and cleanups

- [ ] **F1** Fix `computeExpirationStatus` — `nearThreshold` must be anchored to
  `referenceDate` when provided, not real-today. Add private `offsetDate(str, days)`
  helper. Write `src/lib/server/mock-db.test.ts` with 8 test cases covering null,
  expired, near_expiry at boundaries (+3, +7, +8 days), and referenceDate isolation.
  **Verify:** `npx vitest run src/lib/server/mock-db.test.ts`

- [ ] **F2** Wire `getExpirationSummary` into the receptions page.
  In `receptions/+page.server.ts`: call it in parallel with other load queries.
  In `receptions/+page.svelte`: delete the `$derived expirationCounts` block,
  replace with `data.expirationSummary.*`. Append integration tests to `mock-db.test.ts`.
  **Verify:** `npm run check && npx vitest run src/lib/server/mock-db.test.ts`

- [ ] **F3** Extract shared validation from `reception-actions.ts`.
  Create private `validateReceptionInput(fields, input, t)` helper used by both
  `validateAndCreateReception` and `validateAndUpdateReception` (identical logic deduped).
  Write `src/lib/server/reception-actions.test.ts` with 4 test cases.
  **Verify:** `npm run check && npx vitest run src/lib/server/reception-actions.test.ts`

- [ ] **F4** Move `getT()` calls inside request handlers (not module-level).
  Files: `receptions/export/+server.ts`, `login/+page.server.ts`,
  `materials/[id]/edit/+page.server.ts`, `materials/new/+page.server.ts`.
  **Verify:** `npm run check`

- [ ] **F5** Add `locals.user` guards to two action handlers that use `locals.user!`.
  Files: `receptions/mobile/+page.server.ts`, `materials/new/+page.server.ts`.
  Add `if (!locals.user) throw error(401, 'Unauthorized');` before first use.
  **Verify:** `npm run check`

- [ ] **F6** Add `secure: process.env.NODE_ENV === 'production'` to `cookies.set()`
  in `login/+page.server.ts`.
  **Verify:** `npm run check`

- [ ] **F7** Replace 4 hardcoded error strings with translation keys.
  Add keys: `receptions.viewNameRequired`, `newMaterial.messages.invalidStorageCondition`
  to both locale objects. Update: `materials/+page.server.ts` (2×),
  `receptions/+page.server.ts` (2×), `materials/[id]/edit/+page.server.ts`,
  `materials/new/+page.server.ts`. Add `getT()` inside each affected action.
  **Verify:** `npm run check`

- [ ] **F8** Set `observationPreviewLength` from `8` to `60` in `receptions/+page.svelte`.
  Remove dead `loadError` pattern from all 6 load functions and their corresponding
  page templates. Remove unused `Alert` imports.
  **Verify:** `npm run check`

- [ ] **F9** Deduplicate locale objects in `translations.ts`. Extract content into
  a single `baseTranslations` const. Assign both `es` and `es-AR` keys to it.
  File should shrink from ~620 lines to ~320 lines.
  **Verify:** `npm run check && npx vitest run`

---

### Final gate

All of the following must pass before the migration is considered complete:

```bash
npm run check
npx vitest run
npm run build
```

Manual smoke test on `npm run dev`:
- Login / logout works
- `/materials` — create, edit, toggle active, delete
- `/receptions` — create, edit, delete, search, all filters
- Expiration summary cards show correct counts independent of active filters
- Save and delete custom filter views (persist across page reload)
- Export CSV downloads
- Print page renders
- `/receptions/mobile` entry page works

---

## Out of scope (future work)

- **Signed session cookie** — requires JWT/iron-session; do when migrating to Supabase Auth
- **Role enforcement** — `admin`/`quality`/`viewer` roles are stored but not enforced yet; spec needed
- **Supabase Auth** — currently using mock cookie auth; separate migration
