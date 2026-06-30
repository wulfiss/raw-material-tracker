# Codebase Cleanup & Fix Tasks

Tasks ordered by impact. Each task is self-contained and small enough to complete in one sitting.

---

## Bug Fixes

### ✅ TASK-01 — Resolve `lot_code` required/optional inconsistency

**Status:** COMPLETED (no changes needed)
**Finding:** Both server-side (`reception-actions.ts`) and form-side (`ReceptionFormFields.svelte` line 141) already treat `lot_code` as optional. The form input has no `required` attribute, and the validation check does not include it in the required fields array. Consistent by design — suppliers don't always provide lot codes.

---

## Refactoring (Reduce Duplication)

### ✅ TASK-02 — Extract a shared FormData helper module

**Status:** COMPLETED
Created `src/lib/server/form-utils.ts` with exported `formText`. Replaced local `text()`/`value()`/`getVal` helpers in 6 files:
- `reception-actions.ts`, `production-actions.ts`, `materials/new/+page.server.ts`, `recipes/new/+page.server.ts`, `recipes/[id]/edit/+page.server.ts`, `materials/[id]/edit/+page.server.ts`

---

### ✅ TASK-03 — Remove the `user` parameter from `deleteBatchAction` if unused

**Status:** COMPLETED. Removed dead `user: MockUser` param from function signature. No external call sites existed.

---

## Type Safety

### ✅ TASK-04 — Remove `as any` casts on translation object in recipe routes

**Status:** COMPLETED. All `(t as any)` casts removed from both recipe route files after adding missing translation keys (`duplicateName`, `invalidStorageCondition`).

---

### ✅ TASK-05 — Replace error-string matching in recipes with error codes

**Status:** COMPLETED. Repository errors now use short string codes (`name_required`, `duplicate_name`, `invalid_yield`, etc.). Route files match on codes instead of English strings. Human-readable text lives only in translation files.

---

## i18n — Remove Hardcoded Error Messages

### ✅ TASK-06 — Move hardcoded validation messages in `production-actions.ts` to i18n

**Status:** COMPLETED. Added `productionBatch.messages.*` keys and used `getT()` at the top of each function that needs translation.

---

### ✅ TASK-07 — Move hardcoded "Invalid storage condition." error to i18n

**Status:** COMPLETED. Added `newMaterial.messages.invalidStorageCondition` key in both languages, replaced hardcoded strings in both materials route files.

---

### ✅ TASK-08 — Move hardcoded error messages in `repository/recipes.ts` to i18n-friendly codes

**Status:** COMPLETED (done alongside TASK-05). Repository now returns short codes; routes handle translation.

---

## Error Handling

### ✅ TASK-09 — Wrap database calls in try/catch in action handlers

**Status:** COMPLETED. Wrapped `await repository.*()` calls in:
- `reception-actions.ts`: `validateAndCreateReception`, `validateAndUpdateReception`
- `production-actions.ts`: `validateAndCreateBatch`, `updateBatchStatus`, `deleteBatchAction`
Added `errors.unexpected` translation key to both language files.

---

## Code Style / Consistency

### ✅ TASK-10 — Standardize redirect usage: always use `throw redirect(...)`

**Status:** COMPLETED. Added `throw` before all `redirect(303, ...)` calls in:
- `materials/new/+page.server.ts`, `materials/[id]/edit/+page.server.ts`
- `receptions/new/+page.server.ts`, `receptions/[id]/edit/+page.server.ts`, `receptions/mobile/+page.server.ts`

---

## Verification Results

- **TypeScript:** `tsc --noEmit` passes (only 2 pre-existing errors in unrelated files)
- **Tests:** All 12 tests pass across 4 test files
