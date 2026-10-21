import { describe, expect, it } from 'vitest';
import { summarizeDailyUses } from './traceability';
import type { DailyUseRecord } from './daily-use';
const record = (material_id: string, used_on: string, ids: string[]): DailyUseRecord => ({ id: crypto.randomUUID(), request_token: '', material_id, used_on, supplier: 'Proveedor A', lot_code: '', expiry_date: '', material_name: '', created_by_name: '', products: ids.map(id => ({ recipe_id: id, product_name: id })) });
describe('traceability dashboard totals', () => {
  it('counts material records and unique products/daily production lots separately', () => {
    const result = summarizeDailyUses([
      record('pollo', '2026-10-21', ['milanesa', 'empanada']),
      record('huevo', '2026-10-21', ['milanesa']),
      record('pollo', '2026-10-22', ['milanesa'])
    ]);
    expect(result).toEqual({ records: 3, materials: 2, products: 2, productionLots: 3 });
  });
  it('handles an empty history', () => expect(summarizeDailyUses([])).toEqual({ records: 0, materials: 0, products: 0, productionLots: 0 }));
});
