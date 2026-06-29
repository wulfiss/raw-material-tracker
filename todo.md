# Todo — Bugs to fix

## Task 1 — Start the local dev environment (Critical — causes all 500 errors)

**Error seen on every route:**
```
TypeError: fetch failed
  at Object.list (src/lib/server/repository/supabase-stores.ts:50)
```

**Root cause:** Docker is not running, so the local Supabase containers are stopped. The app connects to `http://127.0.0.1:54321` (correct URL in `.env`) but nothing is listening there.

**Fix — run these commands in order before `npm run dev`:**
```bash
# 1. Start Docker (if not already running)
systemctl --user start docker   # or open Docker Desktop

# 2. Start local Supabase containers
npx supabase start

# 3. (First time only, or after schema changes) Apply migrations + seed data
npx supabase db reset

# 4. Start the dev server
npm run dev
```

**Note:** The Supabase CLI binary is installed locally; use `npx supabase` (not bare `supabase`).

---

## Task 2 — Fix Svelte 5 reactive state warning

**File:** `src/routes/+page.svelte`, line 24

**Warning:**
```
This reference only captures the initial value of `stats`. Did you mean to reference it inside a closure instead?
```

**Root cause:** `stats` is a `$derived` rune but `needsAttention` is a plain `const`, freezing at initial value.

**Fix:**
```ts
// Before
const needsAttention = stats.expiredReceptions + stats.nearExpiryReceptions;

// After
const needsAttention = $derived(stats.expiredReceptions + stats.nearExpiryReceptions);
```

---

## Task 3 — Fix self-closing non-void HTML elements

**File:** `src/routes/+layout.svelte`

**Warnings:**
```
line 29: use `<span ...></span>` rather than `<span ... />`
line 49: use `<div ...></div>` rather than `<div ... />`
```

**Fix:**
- Line 29: `<span class="size-1.5 rounded-full bg-primary animate-pulse" />` → `<span class="size-1.5 rounded-full bg-primary animate-pulse"></span>`
- Line 49: `<div class="mx-1 h-4 w-px bg-border" />` → `<div class="mx-1 h-4 w-px bg-border"></div>`

---

## Task 4 — Replace hardcoded Spanish strings with translation keys

**File:** `src/routes/+page.svelte`

Hardcoded Spanish strings that bypass i18n (all UI strings must use keys from `src/lib/i18n/translations.ts`):

| Line | Hardcoded text |
|------|----------------|
| 87   | `Registrar nueva materia prima` |
| 96   | `Agregar al catálogo de materiales` |
| 105  | `Crear nueva receta con ingredientes` |
| 116  | `Últimas recepciones registradas` |
| 166  | `Vencimientos próximos o vencidos` |
| 192  | `Sin vencimientos pendientes` |

**Fix:**
1. Add to the `home:` section in **both** `es` and `es-AR` blocks of `src/lib/i18n/translations.ts`:
```ts
registerReception: 'Registrar nueva materia prima',
addToMaterialCatalog: 'Agregar al catálogo de materiales',
createNewRecipe: 'Crear nueva receta con ingredientes',
latestReceptions: 'Últimas recepciones registradas',
upcomingExpiries: 'Vencimientos próximos o vencidos',
noExpiryPending: 'Sin vencimientos pendientes',
```
2. Replace each hardcoded string in `+page.svelte` with its `$t.home.*` key.

---

## Task 5 — Fix hardcoded error message suffix in reception view save

**File:** `src/routes/receptions/+page.server.ts`, line 68

**Problem:**
```ts
return fail(400, { error: t.nav.viewName + ' es obligatorio.' });
```
The suffix `' es obligatorio.'` is hardcoded Spanish outside the i18n system.

**Fix:**
1. Add `viewNameRequired: 'El nombre de la vista es obligatorio.'` under `receptions:` in both `es` and `es-AR` blocks of `translations.ts`.
2. Replace line 68 with:
```ts
return fail(400, { error: t.receptions.viewNameRequired });
```

---

## Checklist

- [ ] Task 1: Start Docker → `npx supabase start` → confirm all routes load
- [ ] Task 2: Wrap `needsAttention` in `$derived(...)` in `+page.svelte`
- [ ] Task 3: Fix self-closing `<span>` and `<div>` in `+layout.svelte`
- [ ] Task 4: Add 6 `home.*` translation keys and replace hardcoded strings in `+page.svelte`
- [ ] Task 5: Add `receptions.viewNameRequired` key and fix `+page.server.ts:68`
- [ ] Run `npm run check` — zero errors
- [ ] Confirm all routes load without 500 errors
