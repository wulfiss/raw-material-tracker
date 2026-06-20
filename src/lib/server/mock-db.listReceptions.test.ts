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
