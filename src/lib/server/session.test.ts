import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/static/private', () => ({
  SESSION_SECRET: 'test-secret-for-unit-tests-only-32chars!'
}));

// Dynamic import so the module picks up the mocked env var.
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
