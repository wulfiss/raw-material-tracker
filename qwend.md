# qwend.md — Raw Material Tracker: Audit & Fix Plan

> **Model target:** Qwen 3.6 27B · 94k context  
> **Strategy:** Test-driven. Each task ships a test file first. Implement until the tests pass.  
> **Test runner:** Vitest (add it once, run all tests with `npx vitest run`).

---

## Setup — install Vitest (do this once before any task)

```bash
npm install -D vitest
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Add `vite.config.ts` test block:
```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node'
  }
});
```

---

## TASK-01 — Fix login button icon

**Bug:** `src/routes/login/+page.svelte` imports and renders `<LogOut />` on the Sign In submit button. Should be `<LogIn />`.

### Test

Create `src/routes/login/login.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('login page', () => {
  const src = readFileSync('src/routes/login/+page.svelte', 'utf8');

  it('imports LogIn, not LogOut', () => {
    expect(src).toContain('LogIn');
    expect(src).not.toMatch(/import\s*\{[^}]*LogOut[^}]*\}/);
  });

  it('does not render LogOut component', () => {
    expect(src).not.toContain('<LogOut');
  });
});
```

### Implementation

In `src/routes/login/+page.svelte`:
- Change `import { LogOut } from '@lucide/svelte'` → `import { LogIn } from '@lucide/svelte'`
- Change `<LogOut />` → `<LogIn />` on the submit button

---

## TASK-02 — Trim FormData in material edit

**Bug:** `src/routes/materials/[id]/edit/+page.server.ts` reads FormData fields without `.trim()`, unlike the create endpoint. Whitespace-only strings pass validation.

### Test

Create `src/routes/materials/edit.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('material edit server action', () => {
  const src = readFileSync('src/routes/materials/[id]/edit/+page.server.ts', 'utf8');
  const createSrc = readFileSync('src/routes/materials/new/+page.server.ts', 'utf8');

  it('trims the name field', () => {
    expect(src).toMatch(/formData\.get\(.*name.*\).*trim\(\)/s);
  });

  it('trims the category field', () => {
    expect(src).toMatch(/formData\.get\(.*category.*\).*trim\(\)/s);
  });

  it('trims the storageCondition field', () => {
    expect(src).toMatch(/formData\.get\(.*storageCondition.*\).*trim\(\)/s);
  });

  it('uses the same trim pattern as the create endpoint', () => {
    const trimCountCreate = (createSrc.match(/\.trim\(\)/g) ?? []).length;
    const trimCountEdit = (src.match(/\.trim\(\)/g) ?? []).length;
    expect(trimCountEdit).toBeGreaterThanOrEqual(trimCountCreate);
  });
});
```

### Implementation

In `src/routes/materials/[id]/edit/+page.server.ts`, after every `formData.get('fieldName')` call, chain `.toString().trim()` — matching the pattern in `materials/new/+page.server.ts`.

---

## TASK-03 — Fix hard-coded English label in material edit

**Bug:** `src/routes/materials/[id]/edit/+page.svelte` has the label `"Minimum stock"` hard-coded in English instead of using the i18n translation key.

### Test

Create `src/routes/materials/i18n.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('material pages i18n compliance', () => {
  const editSrc = readFileSync('src/routes/materials/[id]/edit/+page.svelte', 'utf8');
  const newSrc  = readFileSync('src/routes/materials/new/+page.svelte', 'utf8');

  it('edit page has no hard-coded English label "Minimum stock"', () => {
    expect(editSrc).not.toContain('Minimum stock');
  });

  it('edit page uses $t for the minStock label', () => {
    expect(editSrc).toMatch(/\$t\..*[Mm]in[Ss]tock|\$t\..*minStock/);
  });

  it('edit and new page use the same i18n key for minStock', () => {
    const keyInNew  = newSrc.match(/\$t\.[.\w]+(?=[Mm]in[Ss]tock|\bminStock)/)?.[0];
    const keyInEdit = editSrc.match(/\$t\.[.\w]+(?=[Mm]in[Ss]tock|\bminStock)/)?.[0];
    expect(keyInEdit).toBeDefined();
    expect(keyInEdit).toEqual(keyInNew);
  });
});
```

### Implementation

1. Open `src/routes/materials/new/+page.svelte` and find the i18n key used for the minimum stock label (e.g. `$t.newMaterial.fields.minStock`).
2. In `src/routes/materials/[id]/edit/+page.svelte`, replace `"Minimum stock"` with the same expression.

---

## TASK-04 — Fix duplicate print column header

**Bug:** `src/routes/receptions/print/+page.svelte` has two `<th>` elements both labelled "Expiry" — one for the expiry date and one for expiration status.

### Test

Create `src/routes/receptions/print.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('print page column headers', () => {
  const src = readFileSync('src/routes/receptions/print/+page.svelte', 'utf8');

  it('does not have two identical adjacent expiry headers', () => {
    const thMatches = [...src.matchAll(/<th[^>]*>(.*?)<\/th>/gs)].map(m => m[1].trim());
    const seen = new Set<string>();
    for (const label of thMatches) {
      expect(seen.has(label)).toBe(false);
      seen.add(label);
    }
  });

  it('has a distinct header for expiration status', () => {
    expect(src).toMatch(/Estado.*venc|Vencimiento.*estado|expirationStatus|Expiry Status/i);
  });
});
```

### Implementation

In `src/routes/receptions/print/+page.svelte`, find the duplicate `<th>` around line 48 and rename one to the i18n key for expiration status (look up `$t.receptions.expirationStatus` or similar in `src/lib/i18n/translations.ts`).

---

## TASK-05 — Guard against null user in reception-actions

**Bug:** `src/lib/server/reception-actions.ts` uses `locals.user!` non-null assertion. If `hooks.server.ts` ever fails to populate `locals.user`, this crashes at runtime with an uncaught type error instead of a proper 401.

> **Note:** `reception-actions.ts` does **not** receive `locals` — it receives a `MockUser` directly from the calling `+page.server.ts`. The assertion lives in those callers. Fix the callers.

### Test

Create `src/lib/server/reception-actions.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

const callers = [
  'src/routes/receptions/new/+page.server.ts',
  'src/routes/receptions/[id]/edit/+page.server.ts',
];

describe('reception action callers guard locals.user', () => {
  for (const file of callers) {
    const src = readFileSync(file, 'utf8');

    it(`${file} does not use locals.user! (non-null assertion)`, () => {
      expect(src).not.toMatch(/locals\.user!/);
    });

    it(`${file} checks locals.user before use`, () => {
      expect(src).toMatch(/if\s*\(\s*!locals\.user|locals\.user\s*==\s*null|locals\.user\s*===\s*undefined/);
    });
  }
});
```

### Implementation

In each caller (`receptions/new/+page.server.ts` and `receptions/[id]/edit/+page.server.ts`), replace:
```ts
const user = locals.user!;
```
with:
```ts
if (!locals.user) throw error(401, 'Unauthorized');
const user = locals.user;
```
Import `error` from `'@sveltejs/kit'` if missing.

---

## TASK-06 — Fix CSV export null handling

**Bug:** The `esc()` function in `src/routes/receptions/export/+server.ts` does not guard against `null` / `undefined` before calling string methods, and numeric fields (temperature_c, quantity) are not consistently passed through `esc()`.

### Test

Create `src/routes/receptions/export.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

// Copy the esc function here exactly as it exists after the fix,
// so we can unit-test it in isolation.
// The real source must match this signature.
function esc(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

describe('CSV esc()', () => {
  it('returns empty string for null', () => {
    expect(esc(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(esc(undefined)).toBe('');
  });

  it('wraps values containing commas in quotes', () => {
    expect(esc('a,b')).toBe('"a,b"');
  });

  it('escapes inner double-quotes', () => {
    expect(esc('say "hi"')).toBe('"say ""hi"""');
  });

  it('handles numbers', () => {
    expect(esc(3.2)).toBe('3.2');
    expect(esc(0)).toBe('0');
  });

  it('handles empty string', () => {
    expect(esc('')).toBe('');
  });
});

describe('CSV export row completeness', () => {
  const src = require('fs').readFileSync('src/routes/receptions/export/+server.ts', 'utf8');

  it('passes temperature_c through esc()', () => {
    expect(src).toMatch(/esc\(.*temperature_c/s);
  });

  it('passes quantity through esc()', () => {
    expect(src).toMatch(/esc\(.*quantity/s);
  });
});
```

### Implementation

In `src/routes/receptions/export/+server.ts`, update `esc()`:

```ts
const esc = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};
```

Ensure every field in the row array passes through `esc()`, including `r.temperature_c` and `r.quantity`.

---

## TASK-07 — Replace amber-500 with CSS theme variable

**Bug:** `src/routes/receptions/+page.svelte` uses `ring-amber-500` on the "Near expiry" summary card — a raw Tailwind color that bypasses the CSS theme system defined in `src/styles.css`.

### Test

Create `src/routes/receptions/theme.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('receptions page theme compliance', () => {
  const src     = readFileSync('src/routes/receptions/+page.svelte', 'utf8');
  const styles  = readFileSync('src/styles.css', 'utf8');

  it('does not use raw amber-500 Tailwind class', () => {
    expect(src).not.toContain('amber-500');
  });

  it('uses a theme variable for the warning/near-expiry ring', () => {
    // Either a --warning CSS var is defined in styles.css, or a Tailwind class
    // derived from a theme var (e.g. ring-warning) is used in the component.
    const hasThemeVar   = styles.includes('--warning') || styles.includes('--color-warning');
    const usesThemeVar  = src.includes('ring-warning') || src.includes('border-warning') || src.includes('text-warning');
    expect(hasThemeVar || usesThemeVar).toBe(true);
  });
});
```

### Implementation

1. In `src/styles.css`, inside the `:root` block, add:
   ```css
   --warning: 38 92% 50%;
   ```
   And in `.dark` / `@variant -dark` if present:
   ```css
   --warning: 38 92% 60%;
   ```
2. In `src/routes/receptions/+page.svelte`, replace `ring-amber-500` with `ring-warning`.

---

## TASK-08 — Standardise filter param name to `expirationStatus`

**Bug:** `src/routes/receptions/+page.server.ts` and `+server.ts` (export) accept both `?expiration=` and `?expirationStatus=`. The saved-views system and UI should use one name consistently.

### Test

Create `src/routes/receptions/filter-param.test.ts`:

```ts
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

const files = [
  'src/routes/receptions/+page.server.ts',
  'src/routes/receptions/+page.svelte',
  'src/routes/receptions/export/+server.ts',
];

describe('expirationStatus filter param consistency', () => {
  for (const file of files) {
    const src = readFileSync(file, 'utf8');

    it(`${file} does not use bare 'expiration' param key`, () => {
      // Allow 'expirationStatus' but not standalone 'expiration' as a search param key
      const matches = [...src.matchAll(/['"](expiration)['"]/g)].filter(
        m => !src.slice(Math.max(0, m.index! - 10), m.index! + 20).includes('Status')
      );
      expect(matches.length).toBe(0);
    });
  }
});
```

### Implementation

Search every file in `src/routes/receptions/` for `'expiration'` or `"expiration"` as a URL param key (e.g. `searchParams.get('expiration')`). Replace all occurrences with `'expirationStatus'`. Also update any `<a href>` or hidden input that writes `?expiration=` to `?expirationStatus=`.

---

## TASK-09 — Standardise server action error field to `message`

**Bug:** Some `fail(...)` calls return `{ error: '...' }` and some return `{ message: '...' }`. The `.svelte` pages read whichever key their own endpoint uses, creating inconsistency.

### Test

Create `src/lib/server/error-field.test.ts`:

```ts
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const serverFiles = walk('src/routes').filter(f => f.endsWith('+page.server.ts') || f.endsWith('+server.ts'));

describe('fail() always uses { message }, never { error }', () => {
  for (const file of serverFiles) {
    const src = readFileSync(file, 'utf8');
    if (!src.includes('fail(')) continue;

    it(`${file} uses message field in fail()`, () => {
      // Match fail( calls that contain an object with an "error" key
      const badPattern = /fail\(\s*\d+\s*,\s*\{[^}]*\berror\b\s*:/g;
      expect(src).not.toMatch(badPattern);
    });
  }
});

const svelteFiles = walk('src/routes').filter(f => f.endsWith('+page.svelte'));

describe('.svelte pages read form.message, never form.error', () => {
  for (const file of svelteFiles) {
    const src = readFileSync(file, 'utf8');
    if (!src.includes('form?.') && !src.includes('form.')) continue;

    it(`${file} reads form.message, not form.error`, () => {
      expect(src).not.toMatch(/form\??\.error\b/);
    });
  }
});
```

### Implementation

1. In all `+page.server.ts` files, find `fail(4xx, { error: '...' })` and change `error` → `message`.
2. In the corresponding `.svelte` files, change `form?.error` or `form.error` → `form?.message` or `form.message`.
3. Key files likely affected:
   - `src/routes/login/+page.server.ts` and `+page.svelte`
   - `src/routes/materials/new/+page.server.ts` and `+page.svelte`
   - `src/routes/materials/[id]/edit/+page.server.ts` and `+page.svelte`

---

## Execution order

```
Setup (vitest install)
  ↓
TASK-05  (null guard — cleans types before other changes)
  ↓
TASK-06  (esc fix — pure function, easiest to verify)
  ↓
TASK-02  (trim fix — low risk)
  ↓
TASK-03  (i18n label fix)
  ↓
TASK-01  (icon fix)
  ↓
TASK-04  (print header fix)
  ↓
TASK-07  (theme variable)
  ↓
TASK-08  (param name)
  ↓
TASK-09  (error field — broadest change, many files)
```

After every task: `npx vitest run && npm run check`

---

## CLAUDE.md (create at repo root)

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

\`\`\`bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build
npm run check     # Type-check with svelte-check
npx vitest run    # Run tests (after vitest is installed per qwend.md)
\`\`\`

## Architecture

SvelteKit 2 / Svelte 5 prototype for tracking raw-material receptions in an industrial kitchen. Runs on an **in-memory mock database** — all data resets on server restart. Vercel adapter configured for future deployment.

### Auth

\`src/hooks.server.ts\` reads an httpOnly session cookie → \`event.locals.user\`. All routes except \`/login\` are guarded. Three mock users live in \`src/lib/server/mock-auth.ts\` (admin / quality / viewer roles — stored but not enforced yet).

### Data layer

\`src/lib/server/mock-db.ts\` — all in-memory state (materials, receptions, saved views). All CRUD functions are here. Validation for receptions lives in \`src/lib/server/reception-actions.ts\`; material validation is inline in each \`+page.server.ts\`.

\`computeExpirationStatus()\` uses a hardcoded \`America/Argentina/Buenos_Aires\` timezone and a 7-day near-expiry window.

### Routing conventions

- \`+page.server.ts\` exports \`load\` + named \`actions\` (create / update / delete / toggle)
- \`+page.svelte\` binds to \`data\` from \`load\`, posts via SvelteKit \`enhance\`
- \`src/routes/receptions/export/+server.ts\` — GET CSV download
- \`src/routes/receptions/mobile/\` — mobile-optimised observation entry
- \`src/routes/receptions/print/\` — print layout

### Components

\`src/lib/components/ui/\` — thin shadcn-svelte wrappers (button, card, input, select, table, badge, alert, label, textarea). Import via \`\$lib/components/ui/...\`.

\`src/lib/components/receptions/ReceptionFormFields.svelte\` — shared form used by new and edit reception pages.

\`src/lib/utils.ts\` — exports \`cn()\` (clsx + tailwind-merge).

### i18n

\`src/lib/i18n/\` — Svelte store-based i18n. \`t\` is a derived store; \`getT()\` is for server-side use. Spanish (es-AR) only. All UI strings must use translation keys — no hard-coded English labels.

### Styling

Tailwind CSS 4 via Vite plugin. Theme defined as CSS variables in \`src/styles.css\`. Primary: green \`hsl(150 60% 29%)\`. Use theme vars (\`bg-primary\`, \`ring-warning\`) — avoid raw Tailwind color utilities that bypass the theme.

### Path alias

\`\$lib\` → \`src/lib/\`

### Supabase (future)

Schema in \`supabase/schema.sql\` is **not connected**. Field names differ from mock (\`default_unit\` vs \`unit\`, table \`receipts\` vs \`receptions\`). Do not assume mock names match the SQL schema.
\`\`\`
