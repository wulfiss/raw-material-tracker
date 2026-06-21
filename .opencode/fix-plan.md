# fix-plan.md — Bug fix task list

> **Model:** local (90k context)  
> **Run tasks in order. Verify each before starting the next.**  
> All functions and types that were in `mock-db.ts` now live in `repository.ts` with identical names.  
> Do NOT edit `.svelte` files. Do NOT add new features.

---

## Summary

| # | File | Change | Severity |
|---|------|--------|----------|
| T01 | `src/lib/server/repository.ts` | Fix wrong import: `User` → `MockUser` | 🔴 Build-breaking |
| T02 | `src/routes/materials/+page.server.ts` | Update import path | 🔴 Runtime crash |
| T03 | `src/routes/materials/new/+page.server.ts` | Update import path | 🔴 Runtime crash |
| T04 | `src/routes/materials/[id]/edit/+page.server.ts` | Update import path | 🔴 Runtime crash |
| T05 | `src/routes/receptions/new/+page.server.ts` | Update import path | 🔴 Runtime crash |
| T06 | `src/routes/receptions/[id]/edit/+page.server.ts` | Update import path | 🔴 Runtime crash |
| T07 | `src/routes/receptions/+page.server.ts` | Update import path | 🔴 Runtime crash |
| T08 | `src/routes/receptions/mobile/+page.server.ts` | Update import path | 🔴 Runtime crash |
| T09 | `src/routes/receptions/export/+server.ts` | Update import path | 🔴 Runtime crash |
| T10 | `src/routes/receptions/print/+page.server.ts` | Update import path | 🔴 Runtime crash |
| T11 | `src/lib/server/repository.ts` | Fix `getExpirationSummary` — `missing` count inflated | 🟠 Wrong data |
| T12 | `src/lib/server/reception-actions.ts` | Add `material.active` check to both validators | 🟠 Wrong error message |
| T13 | `src/routes/login/+page.server.ts`, `export/+server.ts` | Move `getT()` inside handlers | 🟡 Code quality |
| T14 | `src/routes/materials/+page.server.ts`, `receptions/+page.server.ts` | Fix hardcoded error strings | 🟡 i18n violation |
| T15 | `src/lib/server/repository.ts` | Fix truncation logic | 🟡 UX misleading |

---

## Phase 1 — Fix broken imports (app won't load until all of these are done)

---

### T01 — Fix `User` → `MockUser` import in repository.ts

**Root cause:** `mock-auth.ts` exports `MockUser`, but `repository.ts` imports `User`.
Three function signatures reference the undefined name `MockUser`. The build fails.

**File to edit:** `src/lib/server/repository.ts`

**Change — line 2 only:**

```
BEFORE:
import type { User } from './mock-auth';

AFTER:
import type { MockUser } from './mock-auth';
```

Do not change any other line. The three usages of `MockUser` on lines 233, 354, 371 are already correct.

**Verify:**
```bash
npm run check
```
Must pass with zero errors related to `MockUser`.

---

### T02 — Migrate materials/+page.server.ts

**File to edit:** `src/routes/materials/+page.server.ts`

**Change — line 1 only:**

```
BEFORE:
import { listMaterials, toggleMaterialStatus, deleteMaterial } from '$lib/server/mock-db';

AFTER:
import { listMaterials, toggleMaterialStatus, deleteMaterial } from '$lib/server/repository';
```

Do not change anything else.

**Verify:**
```bash
npm run check
```

---

### T03 — Migrate materials/new/+page.server.ts

**File to edit:** `src/routes/materials/new/+page.server.ts`

**Change — line 2 only:**

```
BEFORE:
import { createMaterial, isMaterialUnit, isStorageCondition } from '$lib/server/mock-db';

AFTER:
import { createMaterial, isMaterialUnit, isStorageCondition } from '$lib/server/repository';
```

Do not change anything else.

**Verify:**
```bash
npm run check
```

---

### T04 — Migrate materials/[id]/edit/+page.server.ts

**File to edit:** `src/routes/materials/[id]/edit/+page.server.ts`

**Change — lines 1–2:**

```
BEFORE:
import { getMaterial, updateMaterial, isUnit, isStorageCondition } from '$lib/server/mock-db';
import type { Unit } from '$lib/server/mock-db';

AFTER:
import { getMaterial, updateMaterial, isUnit, isStorageCondition } from '$lib/server/repository';
import type { Unit } from '$lib/server/repository';
```

Do not change anything else.

**Verify:**
```bash
npm run check
```

---

### T05 — Migrate receptions/new/+page.server.ts

**File to edit:** `src/routes/receptions/new/+page.server.ts`

**Change — line 2 only:**

```
BEFORE:
import { listActiveMaterials, todayInTimeZone } from '$lib/server/mock-db';

AFTER:
import { listActiveMaterials, todayInTimeZone } from '$lib/server/repository';
```

Do not change anything else.

**Verify:**
```bash
npm run check
```

---

### T06 — Migrate receptions/[id]/edit/+page.server.ts

**File to edit:** `src/routes/receptions/[id]/edit/+page.server.ts`

**Change — line 2 only:**

```
BEFORE:
import { getReception, listActiveMaterials, todayInTimeZone } from '$lib/server/mock-db';

AFTER:
import { getReception, listActiveMaterials, todayInTimeZone } from '$lib/server/repository';
```

Do not change anything else.

**Verify:**
```bash
npm run check
```

---

### T07 — Migrate receptions/+page.server.ts

**File to edit:** `src/routes/receptions/+page.server.ts`

**Change — lines 1–6 (two import statements):**

```
BEFORE:
import {
  listReceptions, listMaterials, deleteReception, isExpirationStatus, storageConditions,
  listReceptionViews, saveReceptionView, deleteReceptionView
} from '$lib/server/mock-db';
import type { ExpirationStatus, ReceptionFilters } from '$lib/server/mock-db';

AFTER:
import {
  listReceptions, listMaterials, deleteReception, isExpirationStatus, storageConditions,
  listReceptionViews, saveReceptionView, deleteReceptionView
} from '$lib/server/repository';
import type { ExpirationStatus, ReceptionFilters } from '$lib/server/repository';
```

Do not change anything else.

**Verify:**
```bash
npm run check
```

---

### T08 — Migrate receptions/mobile/+page.server.ts

**File to edit:** `src/routes/receptions/mobile/+page.server.ts`

**Change — line 2 only:**

```
BEFORE:
import { listActiveMaterials, listReceptions, todayInTimeZone } from '$lib/server/mock-db';

AFTER:
import { listActiveMaterials, listReceptions, todayInTimeZone } from '$lib/server/repository';
```

Do not change anything else.

**Verify:**
```bash
npm run check
```

---

### T09 — Migrate receptions/export/+server.ts

**File to edit:** `src/routes/receptions/export/+server.ts`

**Change — lines 1–2:**

```
BEFORE:
import { listReceptions, listMaterials, isExpirationStatus } from '$lib/server/mock-db';
import type { ReceptionFilters } from '$lib/server/mock-db';

AFTER:
import { listReceptions, listMaterials, isExpirationStatus } from '$lib/server/repository';
import type { ReceptionFilters } from '$lib/server/repository';
```

Do not change anything else.

**Verify:**
```bash
npm run check
```

---

### T10 — Migrate receptions/print/+page.server.ts

**File to edit:** `src/routes/receptions/print/+page.server.ts`

**Change — lines 1–2:**

```
BEFORE:
import { listReceptions, listMaterials, isExpirationStatus } from '$lib/server/mock-db';
import type { ReceptionFilters } from '$lib/server/mock-db';

AFTER:
import { listReceptions, listMaterials, isExpirationStatus } from '$lib/server/repository';
import type { ReceptionFilters } from '$lib/server/repository';
```

Do not change anything else.

**Verify:**
```bash
npm run check
```

**Gate — after T01–T10 all pass, run a full build:**
```bash
npm run build
```
Must succeed before continuing to Phase 2.

---

## Phase 2 — Semantic bug fixes

---

### T11 — Fix `getExpirationSummary`: `missing` count inflated

**Root cause:** The query `IS NULL` on `expiry_date` counts every reception with no
expiry date, including materials where expiration is not required. The dashboard alert
card shows a number higher than the real actionable count.

**Fix:** Join with `materials` and restrict to `expiration_required = true` only for the
missing count. The `expired` and `near_expiry` queries are correct as-is.

**File to edit:** `src/lib/server/repository.ts`

Find the `missingRes` query inside `getExpirationSummary` (around line 405–410).

**Change — replace only the `missingRes` query:**

```
BEFORE:
    db.from('receptions')
      .select('*', { count: 'exact', head: true })
      .is('expiry_date', null),

AFTER:
    db.from('receptions')
      .select('*, material:materials!inner(expiration_required)', { count: 'exact', head: true })
      .is('expiry_date', null)
      .eq('material.expiration_required', true),
```

Do not change the `expiredRes` or `nearRes` queries.

**Verify:**
```bash
npm run check
npx supabase start   # must be running
npx vitest run src/lib/server/mock-db.expirationSummary.test.ts
```

---

### T12 — Fix inactive material validation in reception-actions.ts

**Root cause:** `validateAndCreateReception` and `validateAndUpdateReception` both call
`getMaterial` and check `if (!material)` but do not check `if (!material.active)`.
An inactive material passes validation, then `createReception`/`updateReception` in
`repository.ts` rejects it with a raw English string instead of a translated message.

**File to edit:** `src/lib/server/reception-actions.ts`

There are two identical blocks to fix, one in each function.

**Change 1 — inside `validateAndCreateReception` (around line 96):**

```
BEFORE:
  const material = await getMaterial(input.material_id);
  if (!material) {
    return fail(400, { message: t.newReception.messages.selectActiveMaterial, fields });
  }

AFTER:
  const material = await getMaterial(input.material_id);
  if (!material || !material.active) {
    return fail(400, { message: t.newReception.messages.selectActiveMaterial, fields });
  }
```

**Change 2 — inside `validateAndUpdateReception` (around line 151), same replacement:**

```
BEFORE:
  const material = await getMaterial(input.material_id);
  if (!material) {
    return fail(400, { message: t.newReception.messages.selectActiveMaterial, fields });
  }

AFTER:
  const material = await getMaterial(input.material_id);
  if (!material || !material.active) {
    return fail(400, { message: t.newReception.messages.selectActiveMaterial, fields });
  }
```

Do not change anything else in either function.

**Verify:**
```bash
npm run check
npx vitest run src/lib/server/reception-actions.test.ts
```

---

## Phase 3 — Code quality and i18n

---

### T13 — Move `getT()` inside request handlers

**Root cause:** Four files call `getT()` at module level (`const t = getT()` at the
top of the file). This freezes the translation object at server startup. It must be
called inside each request handler instead.

**Files to edit (one at a time):**

#### `src/routes/login/+page.server.ts`

```
BEFORE (line 8, outside any function):
const t = getT();

export const load ...
export const actions: Actions = {
  default: async ({ request, cookies }) => {
    ...
    if (!email || !password) {
      return fail(400, { message: t.login.emailAndPasswordRequired, email });
    }
    ...
    if (!user) {
      return fail(401, { message: t.login.invalidEmailOrPassword, email });
    }

AFTER (remove module-level const; add inside the handler):
export const load ...
export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const t = getT();
    ...
    if (!email || !password) {
      return fail(400, { message: t.login.emailAndPasswordRequired, email });
    }
    ...
    if (!user) {
      return fail(401, { message: t.login.invalidEmailOrPassword, email });
    }
```

#### `src/routes/receptions/export/+server.ts`

```
BEFORE (line 5, outside any function):
const t = getT();

export const GET = async ({ url }) => {

AFTER:
export const GET = async ({ url }) => {
  const t = getT();
```

#### `src/routes/materials/new/+page.server.ts`

```
BEFORE (line 6, outside any function):
const t = getT();

export const actions: Actions = {
  default: async ({ request, locals }) => {

AFTER:
export const actions: Actions = {
  default: async ({ request, locals }) => {
    const t = getT();
```

#### `src/routes/materials/[id]/edit/+page.server.ts`

```
BEFORE (line 7, outside any function):
const t = getT();

export const load ...
export const actions: Actions = {
  default: async ({ request, params }) => {

AFTER:
export const load ...
export const actions: Actions = {
  default: async ({ request, params }) => {
    const t = getT();
```

**Verify after all four files:**
```bash
npm run check
```

---

### T14 — Fix hardcoded error strings

**Root cause:** Several action handlers return hardcoded strings instead of translation
keys. The translation key `common.invalidId` already exists in `translations.ts`.
For view-related errors, add the `getT()` call and use existing keys or inline Spanish.

**Files to edit:**

#### `src/routes/materials/+page.server.ts`

This file has no `getT()` import yet. Add the import and fix the two hardcoded strings.

```
BEFORE (line 1):
import { listMaterials, toggleMaterialStatus, deleteMaterial } from '$lib/server/repository';
import { fail, redirect } from '@sveltejs/kit';

AFTER:
import { listMaterials, toggleMaterialStatus, deleteMaterial } from '$lib/server/repository';
import { fail, redirect } from '@sveltejs/kit';
import { getT } from '$lib/i18n';
```

Then inside the `toggle` action, replace the hardcoded string:

```
BEFORE:
  toggle: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    if (!id) {
      return fail(400, { error: 'ID inválido' });
    }

AFTER:
  toggle: async ({ request }) => {
    const t = getT();
    const data = await request.formData();
    const id = data.get('id') as string;
    if (!id) {
      return fail(400, { error: t.common.invalidId });
    }
```

Same fix inside the `delete` action:

```
BEFORE:
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    if (!id) {
      return fail(400, { error: 'ID inválido' });
    }

AFTER:
  delete: async ({ request }) => {
    const t = getT();
    const data = await request.formData();
    const id = data.get('id') as string;
    if (!id) {
      return fail(400, { error: t.common.invalidId });
    }
```

#### `src/routes/receptions/+page.server.ts`

This file also has hardcoded strings. `getT()` is not yet imported here. Add the import:

```
BEFORE (imports block):
import {
  listReceptions, listMaterials, deleteReception, isExpirationStatus, storageConditions,
  listReceptionViews, saveReceptionView, deleteReceptionView
} from '$lib/server/repository';
import type { ExpirationStatus, ReceptionFilters } from '$lib/server/repository';
import type { PageServerLoad, Actions } from './$types';

AFTER:
import {
  listReceptions, listMaterials, deleteReception, isExpirationStatus, storageConditions,
  listReceptionViews, saveReceptionView, deleteReceptionView
} from '$lib/server/repository';
import type { ExpirationStatus, ReceptionFilters } from '$lib/server/repository';
import type { PageServerLoad, Actions } from './$types';
import { getT } from '$lib/i18n';
```

Fix the three action handlers:

```
BEFORE (deleteReception action):
  deleteReception: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id') as string;
    if (!id) {
      return fail(400, { error: 'ID inválido' });
    }

AFTER:
  deleteReception: async ({ request }) => {
    const t = getT();
    const form = await request.formData();
    const id = form.get('id') as string;
    if (!id) {
      return fail(400, { error: t.common.invalidId });
    }
```

```
BEFORE (saveView action):
  saveView: async ({ request }) => {
    const form = await request.formData();
    const name = (form.get('name') as string)?.trim();
    if (!name) {
      return fail(400, { error: 'View name is required.' });
    }

AFTER:
  saveView: async ({ request }) => {
    const t = getT();
    const form = await request.formData();
    const name = (form.get('name') as string)?.trim();
    if (!name) {
      return fail(400, { error: t.nav.viewName + ' es obligatorio.' });
    }
```

```
BEFORE (deleteView action):
  deleteView: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id') as string;
    if (!id) {
      return fail(400, { error: 'View ID is required.' });
    }

AFTER:
  deleteView: async ({ request }) => {
    const t = getT();
    const form = await request.formData();
    const id = form.get('id') as string;
    if (!id) {
      return fail(400, { error: t.common.invalidId });
    }
```

**Verify:**
```bash
npm run check
```

---

### T15 — Fix truncation logic in listReceptions

**Root cause:** The `truncated` flag in `repository.ts` is set to `true` when
`rows.length > 100`, even when the DB returned all matching rows (no DB truncation).
This causes the UI to say "refine your filters" when the full result set was already
fetched and just display-capped at 100. The two conditions should be separated.

**File to edit:** `src/lib/server/repository.ts`

Find the truncation block around line 332–343.

**Change:**

```
BEFORE:
  // Signal truncation if the DB hit its .limit(200) cap (more rows exist beyond it)
  // OR if JS post-filtering still left more than 100 rows.
  const truncated = (data ?? []).length === 200 || rows.length > 100;
  const mapped: ReceptionListItem[] = rows.slice(0, 100).map(r => {

AFTER:
  // Truncated only when the DB hit its cap — meaning more rows exist that we didn't fetch.
  // The display is capped at 100 rows regardless, but that's a render limit, not missing data.
  const dbTruncated = (data ?? []).length === 200;
  const truncated = dbTruncated;
  const mapped: ReceptionListItem[] = rows.slice(0, 100).map(r => {
```

Do not change anything else in this function.

**Verify:**
```bash
npm run check
npm run build
```

Both must pass. This is the final gate — if both pass, all 15 tasks are complete.

---

## Quick reference — all exported names in repository.ts

These are all identical to what mock-db.ts had, so no call sites need to change:

**Types:** `Unit`, `StorageCondition`, `ReceptionStatus`, `Material`, `Reception`,
`ExpirationStatus`, `ReceptionFilters`, `ReceptionListItem`, `ReceptionView`

**Constants:** `units`, `storageConditions`, `receptionStatuses`

**Guards:** `isUnit`, `isMaterialUnit`, `isStorageCondition`, `isReceptionStatus`,
`isExpirationStatus`, `isDateString`

**Utilities:** `todayInTimeZone`, `computeExpirationStatus`

**Materials CRUD:** `listMaterials`, `listActiveMaterials`, `getMaterial`,
`toggleMaterialStatus`, `deleteMaterial`, `createMaterial`, `updateMaterial`

**Receptions CRUD:** `listReceptions`, `getReception`, `createReception`,
`updateReception`, `deleteReception`, `getExpirationSummary`

**Views CRUD:** `listReceptionViews`, `saveReceptionView`, `deleteReceptionView`
