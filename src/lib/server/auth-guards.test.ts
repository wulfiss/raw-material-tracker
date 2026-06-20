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
