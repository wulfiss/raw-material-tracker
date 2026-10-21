import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('./db', () => ({ db: { from: vi.fn() } }));
import { db } from './db';
import { loadSupplierOptions } from './supplier-options';

type Row = { supplier: string; material_id: string };
const data: Record<string, Row[]> = {};
let receptionError: { code: string } | null = null;

beforeEach(() => {
  data.receptions = [];
  data.daily_material_uses = [];
  receptionError = null;
  vi.mocked(db.from).mockImplementation((table: string) => {
    const query = {
      select: () => query, neq: () => query, order: () => query,
      range: (from: number, to: number) => Promise.resolve({
        data: data[table].slice(from, to + 1),
        error: table === 'receptions' ? receptionError : null
      })
    };
    return query as never;
  });
});

describe('Supabase supplier sources', () => {
  it('includes existing reception suppliers across every page and merges daily-use names', async () => {
    data.receptions = Array.from({ length: 501 }, () => ({ supplier: 'Proveedor existente', material_id: 'flour' }));
    data.receptions.push({ supplier: 'Solo recepción', material_id: 'chicken' });
    data.daily_material_uses = [
      { supplier: ' proveedor EXISTENTE ', material_id: 'chicken' },
      { supplier: 'Nuevo proveedor', material_id: 'flour' }
    ];
    expect(await loadSupplierOptions()).toEqual([
      { name: 'Proveedor existente', uses: 502, materialUses: { flour: 501, chicken: 1 } },
      { name: 'Solo recepción', uses: 1, materialUses: { chicken: 1 } },
      { name: 'Nuevo proveedor', uses: 1, materialUses: { flour: 1 } }
    ]);
  });

  it.each(['42P01', 'PGRST205'])('supports daily-only setups when receptions is absent (%s)', async code => {
    receptionError = { code };
    data.daily_material_uses = [{ supplier: 'Nuevo', material_id: 'flour' }];
    expect(await loadSupplierOptions()).toEqual([{ name: 'Nuevo', uses: 1, materialUses: { flour: 1 } }]);
  });

  it('fails on database errors instead of pretending the reception supplier list is empty', async () => {
    receptionError = { code: '42501' };
    await expect(loadSupplierOptions()).rejects.toThrow('Unable to load data');
  });
});
