<!-- .opencode/AGENTS.md 
# Project context

Stack: SvelteKit 2, Svelte 5, Supabase JS v2, TypeScript strict.

## Rules
- Svelte 5 runes only: $state(), $derived(), $effect(), $props()
- onclick not on:click
- Always call svelte-autofixer after editing any .svelte file
- Read files before editing — never overwrite blindly
- Write minimal diffs, not full rewrites
- Supabase: use typed client from $lib/supabase, RLS is enabled
- Migrations go in supabase/migrations/

## Type checking commands
- `npx tsc --noEmit` — full TypeScript check
- `npx svelte-check` — Svelte + TypeScript check combined
- Run these after any significant change to catch errors LSP may miss
-->

# AGENTS.md — Raw Material Tracker

## Project
SvelteKit raw-material tracker for local/mock testing.
Stack: SvelteKit 2, Svelte 5, Supabase JS v2, TypeScript strict.

Main goal:
Track raw material receptions for food production, with material master data, expiration alerts, filters, exports, and a mobile reception workflow.

Current priority:
Stabilize the existing partial material implementation before adding new features.

## Working rules
- Svelte 5 runes only: $state(), $derived(), $effect(), $props()
- onclick not on:click
- Always call svelte-autofixer after editing any .svelte file
- Read files before editing — never overwrite blindly
- Write minimal diffs, not full rewrites
- Supabase: use typed client from $lib/supabase, RLS is enabled
- Migrations go in supabase/migrations/
- Do not rewrite the whole app.
- Preserve existing routes and behavior unless a phase explicitly changes them.
- Keep the current mock/local storage approach.
- Do not add Supabase in this phase.
- Do not add heavy UI libraries.
- Do not add XLSX unless explicitly requested. CSV is enough.
- Keep existing i18n structure.
- Keep existing UI/component style.
- Keep observation preview/details behavior.
- Make small, reviewable changes.
- Each phase must pass validation before continuing.
- Report changed files after every phase.

## Svelte rules
Use modern Svelte 5 style in touched files:
- Use `onclick`, `onsubmit`, `onchange`, etc. instead of deprecated `on:click`, `on:submit`, `on:change`.
- Use `$derived` for computed values.
- Avoid `$effect` unless there is no cleaner option.
- Use keyed `{#each}` blocks.
- Do not mutate props directly.
- Prefer simple components over adding dependencies.

## Type checking commands
- `npx tsc --noEmit` — full TypeScript check
- `npx svelte-check` — Svelte + TypeScript check combined
- Run these after any significant change to catch errors LSP may miss

## Validation commands
After each phase, run:

```bash
npm run check
npm run build
```

If available, also run:

```bash
npm run lint
npm test
```

If a command fails, stop and report:
- command run
- error summary
- likely files involved
- proposed fix

## Known likely files
Data/model:
- `src/lib/server/mock-db.ts`

Receipts:
- `src/routes/receipts/+page.server.ts`
- `src/routes/receipts/+page.svelte`
- `src/routes/receipts/new/+page.server.ts`
- `src/routes/receipts/new/+page.svelte`

Materials:
- `src/routes/materials/+page.server.ts`
- `src/routes/materials/+page.svelte`
- `src/routes/materials/new/+page.server.ts`
- `src/routes/materials/new/+page.svelte`
- `src/routes/materials/[id]/edit/+page.server.ts`
- `src/routes/materials/[id]/edit/+page.svelte`

Translations:
- `src/lib/i18n/translations.ts`

## Known risks to verify
- `listActiveMaterials` may be imported but not exported.
- `isMaterialUnit` may be called but not imported.
- Material units may be inconsistent: `l` vs `liter`.
- `mock-db.ts` may contain multiple unsynchronized material arrays.
- `listMaterials()` may return old material objects while UI expects enhanced material fields.
- `createReceipt()` may validate material IDs against the wrong material source.
- Seed receipts may not join to material names correctly.
- Some touched Svelte files may still use deprecated `on:` event syntax.
- Toggle/delete material forms may use fragile `preventDefault` / `requestSubmit` logic.

## Preferred data decisions
Use one material model.

Preferred internal units:

```ts
export type MaterialUnit = 'kg' | 'g' | 'liter' | 'unit' | 'box';
```

Display `liter` as `L` in the UI, but do not store `l`.

Preferred storage conditions:

```ts
export type StorageCondition = 'refrigerated' | 'frozen' | 'dry' | 'ambient';
```

Preferred expiration statuses:

```ts
export type ExpirationStatus =
  | 'expired'
  | 'near-expiry'
  | 'missing-expiration'
  | 'ok'
  | 'not-required';
```

Use `YYYY-MM-DD` date strings for expiration comparisons to avoid timezone bugs.

## Implementation phases

### Phase 0 — Baseline check
Do not edit files.
1. Inspect project structure.
2. Run `npm install` if dependencies are missing.
3. Run `npm run check`.
4. Run `npm run build`.
5. Report current errors and likely causes.

### Phase 1 — Stabilize `mock-db.ts`
Goal: make material and receipt data consistent.
1. Create one coherent `Material` model.
2. Export `listActiveMaterials()`.
3. Make material IDs consistent across materials and receipts.
4. Use `liter` internally instead of `l`.
5. Ensure `listMaterials()` returns enhanced material objects.
6. Ensure `getMaterial()` uses the same material source as `listMaterials()`.
7. Ensure `createReceipt()` validates against the same material source.
8. Ensure seed receipts display material names correctly.
9. Keep old receipt field names if current routes depend on them.

Acceptance:
- `listActiveMaterials()` exists.
- `/materials` receives enhanced materials.
- `/receipts` can join receipts to material names.
- New receipts validate against active, real materials.
- `npm run check` and `npm run build` pass.

### Phase 2 — Fix material management UI
1. Fix imports in material server files.
2. Use `isMaterialUnit` and `isStorageCondition` consistently.
3. Change form values from `l` to `liter`.
4. Display `liter` as `L`.
5. Fix deprecated Svelte event syntax in touched material files.
6. Simplify toggle/delete forms.
7. Block deletion if a material is used by a receipt.
8. Deactivate used materials instead of deleting them.
9. Show action errors to the user.

### Phase 3 — Finish receipt form material integration
1. Load active materials with `listActiveMaterials()`.
2. Search by material name, category, unit, and storage condition.
3. Save `material_id`.
4. Copy selected material `unit` into the form.
5. Prevent inactive material selection.
6. Validate material existence and active status server-side.
7. Require `expiry_date` if `expirationRequired` is true.

### Phase 4 — Expiration helpers
Recommended file:
- `src/lib/server/expiration.ts` or `src/lib/expiration.ts`

Rules:
- expired: `expiry_date < today`
- near-expiry: `today <= expiry_date <= today + 7 days`
- missing-expiration: material requires expiration and `expiry_date` is empty
- ok: material requires expiration and date is outside near-expiry window
- not-required: material does not require expiration and date is empty

Add `expirationStatus` to receipt rows.

### Phase 5 — Expiration alert cards and badges
1. Add counts for expired, near expiry, and missing expiration.
2. Add alert cards above the table.
3. Clicking a card applies query-param filters.
4. Add expiration badge to each receipt row.
5. Keep observation preview/details behavior.

### Phase 6 — Advanced filters
Add server-side GET filters:
- `search`
- `dateFrom`
- `dateTo`
- `materialId`
- `category`
- `supplier`
- `storageCondition`
- `expirationStatus`
- `withObservationsOnly`

Filters must be bookmarkable through URL query params.

### Phase 7 — Saved views
Add default saved views:
- Expired lots
- Near expiry
- Missing expiration
- With observations
- Refrigerated materials
- Frozen materials

Allow:
- apply saved views
- save current filters as custom view
- delete custom views
Use mock runtime storage only.

### Phase 8 — CSV export and print report
Add:
- `/receipts/export`
- `/receipts/print`

Use the same filters as `/receipts`.

CSV columns:
- Date
- Material
- Category
- Storage condition
- Supplier
- Lot
- Manufacture date
- Expiry date
- Expiry status
- Quantity
- Unit
- Temperature C
- Decision
- Observations
- Created by

Escape CSV correctly.

### Phase 9 — Mobile receipt mode
Recommended route:
- `src/routes/receipts/mobile/+page.server.ts`
- `src/routes/receipts/mobile/+page.svelte`

Features:
- active material search
- quick observation buttons
- sticky submit footer
- single-column mobile layout
- recent 5 receipts as cards

Quick observations:
- No observation
- Packaging issue
- Temperature issue
- Label issue
- Missing documentation

### Phase 10 — Final cleanup
1. Remove unused old material arrays/data if no longer needed.
2. Keep naming consistent.
3. Fix deprecated Svelte event syntax in touched files.
4. Remove unused imports.
5. Check responsive layout.
6. Run final validation commands.

## Do not change
- Do not add Supabase.
- Do not add authentication.
- Do not change deployment setup.
- Do not rename every route from receipts to receptions unless explicitly requested.
- Do not introduce a heavy UI framework.
- Do not remove existing observation preview/details behavior.
- Do not rewrite the app from scratch.
