import { describe, it, expect } from 'vitest';
import { getMaterial } from './mock-db';

describe('getMaterial', () => {
  it('returns null for a non-existent ID instead of throwing', async () => {
    const result = await getMaterial('00000000-0000-0000-0000-000000000000');
    expect(result).toBeNull();
  });

  it('resolves (does not reject) for any unknown UUID', async () => {
    await expect(
      getMaterial('ffffffff-ffff-ffff-ffff-ffffffffffff')
    ).resolves.toBeNull();
  });
});
