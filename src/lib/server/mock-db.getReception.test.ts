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
