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
