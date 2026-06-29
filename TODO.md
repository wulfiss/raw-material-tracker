# Fix TODO

---

## TASK-01 — Delete the redundant getTranslation helper

**File:** `src/lib/i18n/helpers.ts`

**Problem:**
A new `getTranslation(lang)` function was added that duplicates `getT()` from
`src/lib/i18n/index.ts`. It is only called in one place and should not exist.

**Fix:**
Delete the `getTranslation` function from `helpers.ts`. Nothing else in the file should
change.

**Verify:** `npm run check` will fail after this step because `production-actions.ts`
still imports it — that is expected. Proceed to TASK-02.

---

## TASK-02 — Replace getTranslation with getT in production-actions.ts

**File:** `src/lib/server/production-actions.ts`

**Depends on:** TASK-01

**Problem:**
`production-actions.ts` imports `getTranslation` from `$lib/i18n/helpers` and calls it
with a hardcoded locale `'es-AR'`. The correct pattern used everywhere else in the
codebase (e.g. `reception-actions.ts` lines 7 and 65) is `getT()` from `$lib/i18n`.

**Fix:**
1. Remove the `getTranslation` import line.
2. Add: `import { getT } from '$lib/i18n';`
3. Replace `const lang = getTranslation('es-AR');` with `const t = getT();`
4. Replace every `lang.` reference with `t.`

**Verify:** `npm run check` passes.

---

## TASK-03 — Add translation key for "Production batch not found" and use it

**File 1:** `src/lib/i18n/translations.ts`
**File 2:** `src/lib/server/production-actions.ts` line 96

**Problem:**
Line 96 still has a hardcoded English string:
```ts
if (!existing) return fail(400, { message: 'Production batch not found.' });
```

**Fix:**
1. In `translations.ts`, add `notFound` inside the existing `productionBatch.errors`
   block in **both** locale objects (`es` and `es-AR`):
   ```ts
   productionBatch: {
     errors: {
       notFound: 'Lote de producción no encontrado.',
       invalidStatus: '...',
       invalidTransition: '...',
     }
   }
   ```
2. In `production-actions.ts` line 96, replace the English literal with
   `t.productionBatch.errors.notFound` (using the `t` variable from TASK-02).

**Verify:** `npm run check` passes. No English string literals remain in
`updateBatchStatus`.

---

## TASK-04 — Remove unused TranslationsShape interface

**File:** `src/lib/i18n/translations.ts`

**Problem:**
A large `TranslationsShape` interface was added at the top of the file but is never
referenced — no `satisfies`, no type annotation, nothing imports it. It is dead code.

**Fix:**
Delete the entire `interface TranslationsShape { ... }` block. Touch nothing else.

**Verify:** `npm run check` passes.
