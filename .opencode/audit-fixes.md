# audit-fixes.md — Fix plan for all 10 audit findings

> **Model:** Qwen 3.6 35B A3B · 100k context  
> **Strategy:** Test-first. Write the test → run it (watch it FAIL) → implement → run again (watch it PASS).  
> **Test runner:** `npx vitest run` — Supabase must be running: `npx supabase start`  
> **Working dir:** repo root

---

## Summary of all 10 bugs

| # | File | Line | Severity | Status |
|---|------|------|----------|--------|
| FIX-01 | `src/lib/server/mock-db.ts` | 197 | 🔴 Critical | `getMaterial` throws 500 on not-found |
| FIX-02 | `src/lib/server/mock-db.ts` | 334 | 🔴 Critical | `getReception` throws 500 on not-found |
| FIX-03 | `src/lib/server/mock-db.ts` | 216 | 🔴 High | `deleteMaterial` swallows soft-deactivate error |
| FIX-04 | `src/lib/server/mock-db.ts` | 54 | 🟠 High | `computeExpirationStatus` wrong near-expiry when `referenceDate` used |
| FIX-05 | `src/routes/login/+page.server.ts` | 30 | 🟠 Security | Session cookie missing `secure` flag |
| FIX-06 | `src/routes/receptions/mobile/+page.server.ts` | 19 | 🟠 Security | `locals.user!` with no explicit auth guard |
| FIX-07 | `supabase/seed.sql` | 3 | 🟠 Security | `DISABLE ROW LEVEL SECURITY` has no production guard |
| FIX-08 | `src/lib/server/mock-db.ts` | 288 | 🟡 Scalability | `listReceptions` full-table scan; JS-side category/storageCondition filters |
| FIX-09 | `src/lib/server/mock-db.ts` | 383 | 🟡 Scalability | `getExpirationSummary` fetches all rows to count 3 integers |
| ~~FIX-10~~ | `src/hooks.server.ts` | 10 | ⚪ Deferred | Unsigned JSON session cookie — needs Supabase Auth, out of scope |

Do tasks **in order FIX-01 → FIX-09**. Verify each before starting the next.  
FIX-10 (unsigned cookie) is documented at the bottom — do NOT implement it here.

---

## FIX-01 — `getMaterial`: `.single()` → `.maybeSingle()`

**Root cause:** Supabase's `.single()` returns `{ error: { code: 'PGRST116' } }` when
zero rows match. Line 198 `if (error) throw` fires on a not-found material, so instead
of returning `null` the function throws an unhandled Error. Every caller's
`if (!material)` null-check is dead code — they all get a 500 instead.

**Affected callers:** `toggleMaterialStatus`, `deleteMaterial`, `createReception`,
`validateAndCreateReception`, `validateAndUpdateReception`, `materials/[id]/edit` load.

### Test

Create `src/lib/server/mock-db.getMaterial.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getMaterial } from './mock-db';

describe('getMaterial', () => {
  it('returns null for a non-existent ID instead of throwing', async () => {
    const result = await getMaterial('00000000-0000-0000-0000-000000000000');
    expect(result).toBeNull();
  });

  it('resolves (does not reject) for any unknown UUID', async () => {
    await expect(
      getMaterial('ffffffff-ffff-ffff-ffff-ffffffffffff')
    ).resolves.toBeNull();
  });
});
```

Run — must show **2 FAILING**:
```bash
npx vitest run src/lib/server/mock-db.getMaterial.test.ts
```

### Fix

In `src/lib/server/mock-db.ts` around line 196, find:
```ts
export async function getMaterial(id: string): Promise<Material | null> {
  const { data, error } = await db.from('materials').select().eq('id', id).single();
  if (error) throw new Error(error.message);
  return data ? toMaterial(data) : null;
}
```

Change **only** `.single()` → `.maybeSingle()`. Touch nothing else:
```ts
export async function getMaterial(id: string): Promise<Material | null> {
  const { data, error } = await db.from('materials').select().eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toMaterial(data) : null;
}
```

### Verify
```bash
npx vitest run src/lib/server/mock-db.getMaterial.test.ts
npm run check
```
Both must pass. Stop if either fails.

---

## FIX-02 — `getReception`: `.single()` → `.maybeSingle()`

**Root cause:** Identical bug to FIX-01 but for receptions. A stale `/receptions/<id>/edit`
URL throws a 500 instead of a 404.

### Test

Create `src/lib/server/mock-db.getReception.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getReception } from './mock-db';

describe('getReception', () => {
  it('returns null for a non-existent ID instead of throwing', async () => {
    const result = await getReception('00000000-0000-0000-0000-000000000000');
    expect(result).toBeNull();
  });

  it('resolves (does not reject) for any unknown UUID', async () => {
    await expect(
      getReception('ffffffff-ffff-ffff-ffff-ffffffffffff')
    ).resolves.toBeNull();
  });
});
```

Run — must show **2 FAILING**:
```bash
npx vitest run src/lib/server/mock-db.getReception.test.ts
```

### Fix

In `src/lib/server/mock-db.ts` around line 333, find:
```ts
export async function getReception(id: string): Promise<Reception | null> {
  const { data, error } = await db.from('receptions').select().eq('id', id).single();
  if (error) throw new Error(error.message);
  return data ? toReception(data) : null;
}
```

Change **only** `.single()` → `.maybeSingle()`:
```ts
export async function getReception(id: string): Promise<Reception | null> {
  const { data, error } = await db.from('receptions').select().eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toReception(data) : null;
}
```

### Verify
```bash
npx vitest run src/lib/server/mock-db.getReception.test.ts
npm run check
```

---

## FIX-03 — `deleteMaterial`: check the soft-deactivate UPDATE error

**Root cause:** When a material has linked receptions it is soft-deleted (set to `active: false`).
The UPDATE call result is discarded — any DB error (network failure, permission denial) is
silently swallowed and the function returns `{ success: true, deactivated: true }` anyway.

### Test

Create `src/lib/server/mock-db.deleteMaterial.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('deleteMaterial source — soft-deactivate error handling', () => {
  const src = readFileSync('src/lib/server/mock-db.ts', 'utf8');

  it('captures the error returned by the soft-deactivate update', () => {
    // The update result must be assigned to a variable, not discarded
    // Pattern: const { error: ... } = await db.from('materials').update(...)
    expect(src).toMatch(
      /const\s*\{\s*error[^}]*\}\s*=\s*await\s+db\.from\('materials'\)\.update\(\s*\{\s*active:\s*false\s*\}/
    );
  });

  it('throws when the soft-deactivate update returns an error', () => {
    // After capturing the error, must check and throw
    // This verifies there is no silent swallow
    const fnMatch = src.match(/export async function deleteMaterial[\s\S]*?(?=\nexport)/);
    const fn = fnMatch?.[0] ?? '';
    expect(fn).toMatch(/if\s*\(\s*deactivate[Ee]rror\s*\)\s*throw/);
  });
});
```

Run — must show **2 FAILING**:
```bash
npx vitest run src/lib/server/mock-db.deleteMaterial.test.ts
```

### Fix

In `src/lib/server/mock-db.ts`, find `deleteMaterial` (around line 210).
Locate this exact block:

```ts
  if ((data ?? []).length > 0) {
    await db.from('materials').update({ active: false }).eq('id', id);
    return { success: true, deactivated: true };
  }
```

Replace it — capture and check the error:

```ts
  if ((data ?? []).length > 0) {
    const { error: deactivateError } = await db
      .from('materials')
      .update({ active: false })
      .eq('id', id);
    if (deactivateError) throw new Error(deactivateError.message);
    return { success: true, deactivated: true };
  }
```

Do not change any other line in this function.

### Verify
```bash
npx vitest run src/lib/server/mock-db.deleteMaterial.test.ts
npm run check
```

---

## FIX-04 — `computeExpirationStatus`: fix near-expiry when `referenceDate` is provided

**Root cause:** The `referenceDate` parameter is half-honoured.
- Line 52 uses it correctly: `const today = referenceDate ?? todayInTimeZone()`
- Line 54 ignores it: `const nearThreshold = todayInTimeZone(7)` — always anchored to the real clock

When a custom `referenceDate` is passed (tests, backfill jobs), the near-expiry window
is wrong. Example: referenceDate='2024-01-01', expiry='2024-01-05' → correctly expired.
But expiry='2024-01-07' is classified against real-today+7, not 2024-01-08.

### Test

Create `src/lib/server/mock-db.expirationStatus.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeExpirationStatus } from './mock-db';

describe('computeExpirationStatus', () => {
  // referenceDate = '2024-06-01'
  const ref = '2024-06-01';

  it('returns "missing" when expiry is null', () => {
    expect(computeExpirationStatus(null, ref)).toBe('missing');
  });

  it('returns "expired" when expiry is before referenceDate', () => {
    expect(computeExpirationStatus('2024-05-31', ref)).toBe('expired');
  });

  it('returns "near_expiry" when expiry is the same day as referenceDate', () => {
    expect(computeExpirationStatus('2024-06-01', ref)).toBe('near_expiry');
  });

  it('returns "near_expiry" when expiry is 3 days after referenceDate', () => {
    expect(computeExpirationStatus('2024-06-04', ref)).toBe('near_expiry');
  });

  it('returns "near_expiry" when expiry is exactly 7 days after referenceDate', () => {
    expect(computeExpirationStatus('2024-06-08', ref)).toBe('near_expiry');
  });

  it('returns "ok" when expiry is 8 days after referenceDate', () => {
    expect(computeExpirationStatus('2024-06-09', ref)).toBe('ok');
  });

  it('near-expiry threshold is anchored to referenceDate, not real today', () => {
    // Pick a referenceDate far in the past so real-today+7 would be different
    const pastRef = '2000-01-01';
    // 2000-01-05 is 4 days after 2000-01-01, so must be near_expiry
    expect(computeExpirationStatus('2000-01-05', pastRef)).toBe('near_expiry');
    // 2000-01-10 is 9 days after 2000-01-01, so must be ok
    expect(computeExpirationStatus('2000-01-10', pastRef)).toBe('ok');
  });
});
```

Run — the last test (`near-expiry threshold is anchored`) must **FAIL**, others may pass:
```bash
npx vitest run src/lib/server/mock-db.expirationStatus.test.ts
```

### Fix

In `src/lib/server/mock-db.ts`, find `computeExpirationStatus` (around line 47).

Current code:
```ts
export function computeExpirationStatus(
  expiryDate: string | null,
  referenceDate?: string
): ExpirationStatus {
  if (!expiryDate) return 'missing';
  const today = referenceDate ?? todayInTimeZone();
  if (expiryDate < today) return 'expired';
  const nearThreshold = todayInTimeZone(7);
  if (expiryDate <= nearThreshold) return 'near_expiry';
  return 'ok';
}
```

Add a private helper **directly above** `computeExpirationStatus` (do not put it elsewhere):

```ts
function offsetDateString(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
```

Then fix `computeExpirationStatus` — change **only** line 54:

```ts
export function computeExpirationStatus(
  expiryDate: string | null,
  referenceDate?: string
): ExpirationStatus {
  if (!expiryDate) return 'missing';
  const today = referenceDate ?? todayInTimeZone();
  if (expiryDate < today) return 'expired';
  const nearThreshold = referenceDate ? offsetDateString(referenceDate, 7) : todayInTimeZone(7);
  if (expiryDate <= nearThreshold) return 'near_expiry';
  return 'ok';
}
```

### Verify
```bash
npx vitest run src/lib/server/mock-db.expirationStatus.test.ts
npm run check
```
All 8 tests must pass.

---

## FIX-05 — Session cookie: add `secure` flag

**Root cause:** `cookies.set` in `login/+page.server.ts` has no `secure: true`.
The session cookie (containing the full user object) is transmitted over plain HTTP
on staging URLs, Vercel previews served over HTTP, or any dev tunnel.

### Test

Create `src/routes/login/login.cookie.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('session cookie security', () => {
  const src = readFileSync('src/routes/login/+page.server.ts', 'utf8');

  it('sets the secure flag on the session cookie', () => {
    // Must have secure: true OR secure: process.env.NODE_ENV === 'production'
    // OR secure: !dev  (importing dev from $app/environment)
    expect(src).toMatch(/secure\s*:/);
  });

  it('does not hardcode secure: false', () => {
    expect(src).not.toMatch(/secure\s*:\s*false/);
  });
});
```

Run — must show **1 FAILING** (first test), **1 PASSING** (second):
```bash
npx vitest run src/routes/login/login.cookie.test.ts
```

### Fix

Open `src/routes/login/+page.server.ts`.

At the top of the file, add this import on the first line after the existing imports:
```ts
import { dev } from '$app/environment';
```

Then find the `cookies.set` call (around line 30):
```ts
    cookies.set('session', JSON.stringify(user), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
```

Add `secure: !dev,` after `httpOnly: true,`:
```ts
    cookies.set('session', JSON.stringify(user), {
      path: '/',
      httpOnly: true,
      secure: !dev,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
```

Do not change anything else in this file.

### Verify
```bash
npx vitest run src/routes/login/login.cookie.test.ts
npm run check
```

---

## FIX-06 — `locals.user!`: add explicit auth guard in two action handlers

**Root cause:** Two action handlers use `locals.user!` (TypeScript non-null assertion)
without first checking `if (!locals.user)`. If the auth hook is ever bypassed or
a route is added to `publicPaths` by mistake, `null` is silently passed to the
downstream function and written to the database as the creator's identity.

**Files:**
- `src/routes/receptions/mobile/+page.server.ts` line 19
- `src/routes/materials/new/+page.server.ts` line 48

### Test

Create `src/lib/server/auth-guards.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('action handlers must guard locals.user before use', () => {
  it('mobile reception action has explicit auth guard', () => {
    const src = readFileSync('src/routes/receptions/mobile/+page.server.ts', 'utf8');
    // Must have an if(!locals.user) / if (!locals.user) before the first use
    expect(src).toMatch(/if\s*\(\s*!locals\.user\s*\)/);
    // Must NOT use locals.user! (non-null assertion)
    expect(src).not.toContain('locals.user!');
  });

  it('new material action has explicit auth guard', () => {
    const src = readFileSync('src/routes/materials/new/+page.server.ts', 'utf8');
    expect(src).toMatch(/if\s*\(\s*!locals\.user\s*\)/);
    expect(src).not.toContain('locals.user!');
  });
});
```

Run — must show **2 FAILING**:
```bash
npx vitest run src/lib/server/auth-guards.test.ts
```

### Fix — file 1: `src/routes/receptions/mobile/+page.server.ts`

Open the file. Find the action handler:
```ts
export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const result = await validateAndCreateReception(form, locals.user!);
```

Replace with:
```ts
export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    const form = await request.formData();
    const result = await validateAndCreateReception(form, locals.user);
```

Make sure `error` is imported from `@sveltejs/kit`. Check the imports at the top of the file.
If `error` is not already imported, add it:
```ts
import { redirect, error } from '@sveltejs/kit';
```

### Fix — file 2: `src/routes/materials/new/+page.server.ts`

Open the file. Find:
```ts
    const result = await createMaterial(
      { ... },
      locals.user!
    );
```

Before that block (but inside the `default` action), add:
```ts
    if (!locals.user) throw error(401, 'Unauthorized');
```

Then change `locals.user!` to `locals.user` (remove the `!`).

Make sure `error` is imported from `@sveltejs/kit` at the top.

### Verify
```bash
npx vitest run src/lib/server/auth-guards.test.ts
npm run check
```

---

## FIX-07 — `seed.sql`: add production warning to DISABLE RLS block

**Root cause:** `seed.sql` runs `ALTER TABLE … DISABLE ROW LEVEL SECURITY` with no
guard. Running `npx supabase db reset` against a production project would disable RLS
on all three tables permanently with no warning.

### Test

Create `supabase/seed.safety.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('seed.sql safety', () => {
  const sql = readFileSync('supabase/seed.sql', 'utf8');

  it('has a clearly visible LOCAL DEV ONLY warning', () => {
    expect(sql).toMatch(/LOCAL DEV ONLY|DO NOT RUN IN PRODUCTION/i);
  });

  it('has a WARNING or DANGER label before the DISABLE RLS block', () => {
    const disablePos = sql.indexOf('DISABLE ROW LEVEL SECURITY');
    const before = sql.slice(0, disablePos);
    expect(before).toMatch(/WARNING|DANGER|LOCAL DEV/i);
  });
});
```

Run — must show **2 FAILING**:
```bash
npx vitest run supabase/seed.safety.test.ts
```

### Fix

Open `supabase/seed.sql`. At the very top of the file, add this block:

```sql
-- ============================================================
-- WARNING — LOCAL DEV ONLY. DO NOT RUN IN PRODUCTION.
-- The statements below disable Row Level Security so local
-- Vitest integration tests work without Supabase Auth.
-- RLS is re-enabled by the schema migration (001_initial_schema.sql)
-- and MUST remain enabled in staging and production.
-- ============================================================
```

Do not change or remove the existing `ALTER TABLE … DISABLE ROW LEVEL SECURITY` lines.

### Verify
```bash
npx vitest run supabase/seed.safety.test.ts
```

---

## FIX-08 — `listReceptions`: push category/storageCondition to DB; add row limit

**Root cause:** `listReceptions` fetches every reception row from Supabase and then
runs `category`, `storageCondition`, `search`, and `expirationStatus` filters in a
JavaScript `.filter()`. With a large table this is a full scan on every page load.

**Scope of this task:** Push `category` and `storageCondition` to the Supabase query
and add a `.limit(200)` cap. Do NOT touch the `search` or `expirationStatus` JS
filters — those are out of scope.

### Test

Create `src/lib/server/mock-db.listReceptions.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('listReceptions implementation', () => {
  const src = readFileSync('src/lib/server/mock-db.ts', 'utf8');

  // Extract only the listReceptions function body
  const fnMatch = src.match(/export async function listReceptions[\s\S]*?(?=\nexport async function)/);
  const fn = fnMatch?.[0] ?? '';

  it('has a .limit() on the DB query', () => {
    expect(fn).toMatch(/\.limit\(\s*\d+\s*\)/);
  });

  it('does NOT filter category in the JS .filter() block', () => {
    const jsFilter = fn.match(/\.filter\(\s*r\s*=>\s*\{[\s\S]*?\}\s*\)/)?.[0] ?? '';
    expect(jsFilter).not.toContain('filters.category');
  });

  it('does NOT filter storageCondition in the JS .filter() block', () => {
    const jsFilter = fn.match(/\.filter\(\s*r\s*=>\s*\{[\s\S]*?\}\s*\)/)?.[0] ?? '';
    expect(jsFilter).not.toContain('filters.storageCondition');
  });

  it('has a DB-side query for category when filter is active', () => {
    expect(fn).toMatch(/filters\.category.*eq|eq.*filters\.category/s);
  });
});
```

Run — must show **3–4 FAILING**:
```bash
npx vitest run src/lib/server/mock-db.listReceptions.test.ts
```

### Fix

Open `src/lib/server/mock-db.ts` and find `listReceptions` (around line 288).

**Step 1 — Add `.limit(200)` to the base query chain.**

Find:
```ts
  let query = db.from('receptions')
    .select('*, material:materials(id, name, unit, category, storage_condition)')
    .order('received_on', { ascending: false })
    .order('created_at', { ascending: false });
```

Add `.limit(200)` at the end:
```ts
  let query = db.from('receptions')
    .select('*, material:materials(id, name, unit, category, storage_condition)')
    .order('received_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);
```

**Step 2 — Add DB-side filters for category and storageCondition.**

Find the block with existing DB-side filters (after the base query, before `const { data, error }`):
```ts
  if (filters.dateFrom)    query = query.gte('received_on', filters.dateFrom);
  if (filters.dateTo)      query = query.lte('received_on', filters.dateTo);
  if (filters.materialId)  query = query.eq('material_id', filters.materialId);
  if (filters.supplier)    query = query.ilike('supplier', `%${filters.supplier.trim()}%`);
```

Add these two lines immediately after:
```ts
  if (filters.category)          query = (query as any).eq('material.category', filters.category);
  if (filters.storageCondition)  query = (query as any).eq('material.storage_condition', filters.storageCondition);
```

**Step 3 — Remove category and storageCondition from the JS `.filter()` block.**

Find the JS filter block (around line 306):
```ts
  let rows = (data ?? []).filter(r => {
    ...
    if (filters.category && (r.material as any)?.category !== filters.category) return false;
    if (filters.storageCondition && (r.material as any)?.storage_condition !== filters.storageCondition) return false;
    ...
  });
```

Delete **only** those two `if (filters.category …)` and `if (filters.storageCondition …)` lines.
Leave every other line in the JS filter block untouched.

### Verify
```bash
npx vitest run src/lib/server/mock-db.listReceptions.test.ts
npm run check
```

Then smoke-test: `npm run dev` → open `/receptions` → filter by category → confirm results load.

---

## FIX-09 — `getExpirationSummary`: replace JS loop with SQL COUNT queries

**Root cause:** `getExpirationSummary` does `db.from('receptions').select('expiry_date')`
which fetches every single row, then counts in a JS loop. This is O(n) network transfer
for three integers. Replace with three targeted COUNT queries.

The threshold dates must match `computeExpirationStatus` exactly:
- `expired`: `expiry_date < today`
- `near_expiry`: `expiry_date >= today AND expiry_date <= today + 7 days`
- `missing`: `expiry_date IS NULL`

### Test

Create `src/lib/server/mock-db.expirationSummary.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('getExpirationSummary implementation', () => {
  const src = readFileSync('src/lib/server/mock-db.ts', 'utf8');

  const fnMatch = src.match(/export async function getExpirationSummary[\s\S]*?(?=\nexport)/);
  const fn = fnMatch?.[0] ?? '';

  it('does NOT select all expiry_date rows (old full-scan pattern)', () => {
    expect(fn).not.toMatch(/\.select\(\s*['"`]expiry_date['"`]\s*\)/);
  });

  it('uses count: exact queries instead of a JS loop', () => {
    expect(fn).toMatch(/count\s*:\s*['"`]exact['"`]/);
  });

  it('runs at least 3 separate DB queries (one per status)', () => {
    const dbCalls = (fn.match(/db\.from\(/g) ?? []).length;
    expect(dbCalls).toBeGreaterThanOrEqual(3);
  });

  it('uses Promise.all to run the 3 queries in parallel', () => {
    expect(fn).toContain('Promise.all');
  });
});
```

Run — must show **4 FAILING**:
```bash
npx vitest run src/lib/server/mock-db.expirationSummary.test.ts
```

### Fix

In `src/lib/server/mock-db.ts`, find `getExpirationSummary` (around line 383).

Replace the **entire function body** with:

```ts
export async function getExpirationSummary(): Promise<{ expired: number; near_expiry: number; missing: number }> {
  const today = todayInTimeZone();
  const nearLimit = todayInTimeZone(7);

  const [expiredRes, nearRes, missingRes] = await Promise.all([
    db.from('receptions')
      .select('*', { count: 'exact', head: true })
      .lt('expiry_date', today),
    db.from('receptions')
      .select('*', { count: 'exact', head: true })
      .gte('expiry_date', today)
      .lte('expiry_date', nearLimit),
    db.from('receptions')
      .select('*', { count: 'exact', head: true })
      .is('expiry_date', null),
  ]);

  if (expiredRes.error) throw new Error(expiredRes.error.message);
  if (nearRes.error) throw new Error(nearRes.error.message);
  if (missingRes.error) throw new Error(missingRes.error.message);

  return {
    expired: expiredRes.count ?? 0,
    near_expiry: nearRes.count ?? 0,
    missing: missingRes.count ?? 0,
  };
}
```

Do not remove or change `computeExpirationStatus` — it is still used elsewhere.

### Verify
```bash
npx vitest run src/lib/server/mock-db.expirationSummary.test.ts
npm run check
```

Smoke-test: `npm run dev` → `/receptions` → expiration summary counts still correct.

---

## FIX-10 — Sign the session cookie with HMAC-SHA256

**Risk:** `hooks.server.ts` line 10 does `JSON.parse(session)` with no signature check.
Any logged-in user can open DevTools, set the `session` cookie to
`{"id":"x","role":"admin","name":"x","email":"x"}` and gain full admin identity.
Roles are not enforced yet — but will be, and when they are, every user becomes admin
for free.

**Approach:** Add HMAC-SHA256 signing using Node's built-in `crypto` module.
No new npm package. Cookie format: `<base64url-payload>.<hex-signature>`.
The signing key comes from a new `SESSION_SECRET` env var.

**Files changed:** 4 total.
- `src/lib/server/session.ts` — NEW: `signSession` / `verifySession` helpers
- `.env.local` — add `SESSION_SECRET=<random>`
- `.env.example` — add placeholder
- `src/routes/login/+page.server.ts` — call `signSession` before `cookies.set`
- `src/hooks.server.ts` — call `verifySession` instead of raw `JSON.parse`

Do tasks **SIGN-01 → SIGN-02 → SIGN-03** in order.

---

### SIGN-01 — Create `session.ts` and add `SESSION_SECRET` to env

#### Step 1 — Add the env var

Open `.env.local`. Add this line at the end:
```
SESSION_SECRET=replace-with-32-or-more-random-characters-here
```

Generate a real value — run this in the terminal and paste the output:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Open `.env.example`. Add this line at the end:
```
SESSION_SECRET=your-random-secret-here
```

#### Step 2 — Write the test

Create `src/lib/server/session.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

// Temporarily set the env var for unit tests.
// The real value comes from .env.local in integration / dev.
process.env.SESSION_SECRET = 'test-secret-for-unit-tests-only-32chars!';

// Dynamic import so the module picks up the env var we set above.
const { signSession, verifySession } = await import('./session');

describe('signSession / verifySession', () => {
  const user = { id: 'u1', name: 'Alice', email: 'a@x.com', role: 'admin' as const };

  it('produces a string containing a dot separator', () => {
    const token = signSession(user);
    expect(token).toContain('.');
  });

  it('round-trips: verifySession(signSession(user)) returns the original user', () => {
    const token = signSession(user);
    const result = verifySession(token);
    expect(result).toEqual(user);
  });

  it('returns null for a tampered payload', () => {
    const token = signSession(user);
    const [, sig] = token.split('.');
    // replace payload with a forged one
    const forgedPayload = Buffer.from(
      JSON.stringify({ ...user, role: 'viewer' })
    ).toString('base64url');
    expect(verifySession(`${forgedPayload}.${sig}`)).toBeNull();
  });

  it('returns null for a tampered signature', () => {
    const token = signSession(user);
    const [payload] = token.split('.');
    expect(verifySession(`${payload}.deadbeef`)).toBeNull();
  });

  it('returns null for a random string', () => {
    expect(verifySession('not-a-valid-token')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(verifySession('')).toBeNull();
  });
});
```

Run — must show **6 FAILING** (module doesn't exist yet):
```bash
npx vitest run src/lib/server/session.test.ts
```

#### Step 3 — Create `src/lib/server/session.ts`

Create this file exactly as shown. Do not modify any existing file yet.

```ts
import crypto from 'node:crypto';
import { SESSION_SECRET } from '$env/static/private';
import type { MockUser } from './mock-auth';

function hmac(data: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
}

export function signSession(user: MockUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  return `${payload}.${hmac(payload)}`;
}

export function verifySession(cookie: string): MockUser | null {
  const dot = cookie.lastIndexOf('.');
  if (dot === -1) return null;
  const payload = cookie.slice(0, dot);
  const sig = cookie.slice(dot + 1);
  const expected = hmac(payload);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as MockUser;
  } catch {
    return null;
  }
}
```

> **Why `timingSafeEqual`?** A plain `===` comparison leaks timing information —
> an attacker can measure how many bytes matched to brute-force the signature.
> `timingSafeEqual` compares in constant time.

> **Why `lastIndexOf('.')`?** The base64url payload can't contain `.`, so the
> first (and only) `.` cleanly separates payload from signature.

#### Step 4 — Verify
```bash
npx vitest run src/lib/server/session.test.ts
npm run check
```

All 6 tests must pass. Stop if any fail.

---

### SIGN-02 — Update `login` to sign the cookie

**File:** `src/routes/login/+page.server.ts`

#### Step 1 — Write the test

Create `src/routes/login/session-signing.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('login action uses signSession', () => {
  const src = readFileSync('src/routes/login/+page.server.ts', 'utf8');

  it('imports signSession from session.ts', () => {
    expect(src).toMatch(/import.*signSession.*from.*session/);
  });

  it('calls signSession when setting the cookie', () => {
    expect(src).toMatch(/signSession\s*\(\s*user\s*\)/);
  });

  it('does NOT call JSON.stringify(user) for the cookie value', () => {
    // JSON.stringify(user) was the old unsigned approach
    expect(src).not.toMatch(/JSON\.stringify\s*\(\s*user\s*\)/);
  });
});
```

Run — must show **2–3 FAILING**:
```bash
npx vitest run src/routes/login/session-signing.test.ts
```

#### Step 2 — Fix

Open `src/routes/login/+page.server.ts`.

Add one import — insert it right after the existing imports at the top:
```ts
import { signSession } from '$lib/server/session';
```

Find the `cookies.set` call:
```ts
    cookies.set('session', JSON.stringify(user), {
```

Replace **only** `JSON.stringify(user)` with `signSession(user)`:
```ts
    cookies.set('session', signSession(user), {
```

The rest of the `cookies.set` options stay unchanged.

#### Step 3 — Verify
```bash
npx vitest run src/routes/login/session-signing.test.ts
npm run check
```

---

### SIGN-03 — Update `hooks.server.ts` to verify the signature

**File:** `src/hooks.server.ts`

This is the most important change: the hook must reject any cookie whose signature
doesn't match, regardless of what JSON is inside it.

#### Step 1 — Write the test

Create `src/hooks.server.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('hooks.server.ts cookie handling', () => {
  const src = readFileSync('src/hooks.server.ts', 'utf8');

  it('imports verifySession instead of relying on raw JSON.parse', () => {
    expect(src).toMatch(/import.*verifySession.*from.*session/);
  });

  it('does NOT call JSON.parse on the session cookie directly', () => {
    // JSON.parse(session) was the unsigned pattern — must be gone
    expect(src).not.toMatch(/JSON\.parse\s*\(\s*session\s*\)/);
  });

  it('uses verifySession to parse the cookie', () => {
    expect(src).toMatch(/verifySession\s*\(\s*session\s*\)/);
  });

  it('sets locals.user to null when verifySession returns null (tampered/missing)', () => {
    // The hook must handle null from verifySession gracefully
    // Pattern: verifySession(...) ?? null  OR  result = verifySession(...)  if (!result) ...
    expect(src).toMatch(/verifySession|null/);
  });
});
```

Run — must show **2–3 FAILING**:
```bash
npx vitest run src/hooks.server.test.ts
```

#### Step 2 — Fix

Open `src/hooks.server.ts`. Replace the entire file with:

```ts
import type { Handle } from '@sveltejs/kit';
import { verifySession } from '$lib/server/session';

const publicPaths = ['/login'];

export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');
  event.locals.user = session ? verifySession(session) : null;

  const path = event.url.pathname;
  const isPublic = publicPaths.some((p) => path === p || path.startsWith(p + '/'));

  if (!event.locals.user && !isPublic) {
    return new Response(null, {
      status: 302,
      headers: { location: '/login' }
    });
  }

  return resolve(event);
};
```

Key changes from the original:
- Removed the `try/catch JSON.parse` block
- `verifySession` returns `MockUser | null` — a tampered or missing cookie becomes null automatically
- No `try/catch` needed: `verifySession` already handles all error cases internally

#### Step 3 — Verify
```bash
npx vitest run src/hooks.server.test.ts
npm run check
```

---

### SIGN-04 — Final gate for the signing tasks

After SIGN-01 through SIGN-03 pass individually, run everything together:

```bash
npx vitest run \
  src/lib/server/session.test.ts \
  src/routes/login/session-signing.test.ts \
  src/hooks.server.test.ts
npm run check
npm run build
```

Then smoke-test manually:
1. `npm run dev`
2. Log in — session should work normally
3. Open DevTools → Application → Cookies → copy the `session` value
4. Edit it to any plain JSON string (e.g. `{"id":"x","role":"admin"}`) and save
5. Reload the page — **must redirect to `/login`** (tampered cookie rejected)
6. Log in again — should work

If step 5 does NOT redirect to `/login`, the signing is not working. Stop and re-read SIGN-03.

---

## Final gate — run all audit tests

```bash
npx vitest run \
  src/lib/server/mock-db.getMaterial.test.ts \
  src/lib/server/mock-db.getReception.test.ts \
  src/lib/server/mock-db.deleteMaterial.test.ts \
  src/lib/server/mock-db.expirationStatus.test.ts \
  src/routes/login/login.cookie.test.ts \
  src/lib/server/auth-guards.test.ts \
  supabase/seed.safety.test.ts \
  src/lib/server/mock-db.listReceptions.test.ts \
  src/lib/server/mock-db.expirationSummary.test.ts \
  src/lib/server/session.test.ts \
  src/routes/login/session-signing.test.ts \
  src/hooks.server.test.ts
npm run check
npm run build
```

All must pass.

---

## Checklist

- [x] **FIX-01** `getMaterial` → `.maybeSingle()` — returns null on not-found, never throws PGRST116
- [x] **FIX-02** `getReception` → `.maybeSingle()` — same fix
- [x] **FIX-03** `deleteMaterial` — soft-deactivate UPDATE error is captured and re-thrown
- [x] **FIX-04** `computeExpirationStatus` — near-expiry threshold anchored to `referenceDate` when provided
- [x] **FIX-05** Session cookie — `secure: !dev` added
- [x] **FIX-06** `locals.user!` — explicit `if (!locals.user) throw error(401)` at top of mobile and new-material actions
- [x] **FIX-07** `seed.sql` — WARNING comment guards the DISABLE RLS block
- [x] **FIX-08** `listReceptions` — category/storageCondition pushed to DB; `.limit(200)` + correct `truncated` flag
- [x] **FIX-09** `getExpirationSummary` — three parallel SQL COUNT queries
- [ ] **FIX-10 / SIGN-01** `session.ts` created — `signSession` and `verifySession` helpers
- [ ] **FIX-10 / SIGN-02** `login` signs the cookie with `signSession`
- [ ] **FIX-10 / SIGN-03** `hooks.server.ts` verifies signature with `verifySession`
