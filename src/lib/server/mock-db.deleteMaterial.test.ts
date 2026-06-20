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
