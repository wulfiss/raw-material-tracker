import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('getExpirationSummary implementation', () => {
  const src = readFileSync('src/lib/server/mock-db.ts', 'utf8');

  const fnMatch = src.match(/export async function getExpirationSummary([\s\S]*)$/);
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
