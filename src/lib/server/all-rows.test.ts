import { describe, it, expect } from 'vitest';
import { allRows } from './all-rows';
describe('complete PostgREST reads', () => {
  it('includes records beyond the API response cap', async () => {
    const source = Array.from({ length: 1107 }, (_, id) => ({ id }));
    const rows = await allRows(async (from, to) => ({ data: source.slice(from, to + 1), error: null }));
    expect(rows).toHaveLength(1107);expect(rows.at(-1)).toEqual({ id: 1106 });
  });
  it('does not silently show partial totals when a later page fails', async () => {
    await expect(allRows(async from => from === 0 ? { data: Array.from({ length: 500 }, (_, id) => ({ id })), error: null } : { data: null, error: new Error('Read failed') })).rejects.toThrow();
  });
});
