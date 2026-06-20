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
