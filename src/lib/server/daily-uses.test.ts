import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('./db', () => ({ db: { rpc: vi.fn() } }));
import { db } from './db';
import { saveDailyUse } from './daily-uses';
import type { AppUser } from './auth';
const actor: AppUser = { id: 'actor', email: 'admin@example.com', name: 'Admin', role: 'admin' };
const material = '10000000-0000-4000-8000-000000000001';
const product = '10000000-0000-4000-8000-000000000002';
function request(overrides: Record<string, string> = {}) {
  return new Request('http://localhost/daily-use/new', { method: 'POST', body: new URLSearchParams({
    used_on: '2026-10-21', material_id: material, supplier: 'Proveedor A', lot_code: 'POL-184', expiry_date: '2026-10-24',
    product_ids: product, request_token: '10000000-0000-4000-8000-000000000003', ...overrides
  }) });
}
beforeEach(() => vi.mocked(db.rpc).mockReset());
describe('daily-use actions', () => {
  it('rejects unauthenticated and viewer writes before reaching the database', async () => {
    await expect(saveDailyUse(request(), null)).rejects.toMatchObject({ status: 401 });
    await expect(saveDailyUse(request(), { ...actor, role: 'viewer' })).rejects.toMatchObject({ status: 403 });
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it('returns all user fields when input validation fails', async () => {
    const result = await saveDailyUse(request({ expiry_date: '2026-02-30' }), actor);
    expect(result).toMatchObject({ status: 400, data: { fields: { lot_code: 'POL-184', product_ids: [product], expiry_date: '2026-02-30' } } });
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it('uses one atomic RPC and carries the chosen date and product suggestions to the next entry', async () => {
    vi.mocked(db.rpc).mockResolvedValue({ error: null, data: material } as never);
    await expect(saveDailyUse(request({ intent: 'another' }), { ...actor, role: 'quality' })).rejects.toMatchObject({ status: 303, location: `/daily-use/new?date=2026-10-21&saved=1&suggest=${product}` });
    expect(db.rpc).toHaveBeenCalledExactlyOnceWith('save_daily_material_use', expect.objectContaining({ p_id: null, p_supplier: 'Proveedor A', p_user_id: actor.id, p_product_ids: [product], p_used_on: '2026-10-21' }));
  });
  it('preserves all fields on database failure without leaking database details', async () => {
    vi.mocked(db.rpc).mockResolvedValue({ data: null, error: { message: 'private database detail' } } as never);
    const result = await saveDailyUse(request(), actor);
    expect(result).toMatchObject({ status: 400, data: { fields: { lot_code: 'POL-184', product_ids: [product] } } });
    expect(JSON.stringify(result)).not.toContain('private database detail');
  });
  it('updates the existing entry rather than creating a new one', async () => {
    vi.mocked(db.rpc).mockResolvedValue({ error: null, data: material } as never);
    await expect(saveDailyUse(request(), actor, material)).rejects.toMatchObject({ status: 303, location: '/daily-use?date=2026-10-21' });
    expect(db.rpc).toHaveBeenCalledWith('save_daily_material_use', expect.objectContaining({ p_id: material }));
  });
});
