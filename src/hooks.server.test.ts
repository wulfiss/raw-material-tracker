import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('session cookie security', () => {
  const src = readFileSync('src/hooks.server.ts', 'utf8');

  it('sets the secure flag based on environment', () => {
    expect(src).toMatch(/secure\s*:\s*!dev/);
  });

  it('does not hardcode secure: false', () => {
    expect(src).not.toMatch(/secure\s*:\s*false/);
  });
});
