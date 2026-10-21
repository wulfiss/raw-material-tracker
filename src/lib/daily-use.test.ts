import { describe, it, expect } from 'vitest';
import { isCalendarDate, readDailyUseFields, validateDailyUse, type DailyUseFields } from './daily-use';
const material = '10000000-0000-4000-8000-000000000001';
const product = '10000000-0000-4000-8000-000000000002';
const valid: DailyUseFields = { used_on: '2026-10-21', material_id: material, supplier: 'Proveedor A', lot_code: 'POL-184', expiry_date: '2026-10-24', product_ids: [product], request_token: '10000000-0000-4000-8000-000000000003' };
describe('daily-use input', () => {
  it('accepts only actual calendar dates, including leap days', () => {
    expect(isCalendarDate('2028-02-29')).toBe(true);
    for (const date of ['2026-02-29', '2026-04-31', '21/10/2026', '2026-13-01', '']) expect(isCalendarDate(date)).toBe(false);
  });
  it('needs no quantity or stock fields', () => {
    expect(validateDailyUse(valid)).toBeNull();
  });
  it.each([
    ['used_on', '2026-02-30', 'date'], ['material_id', '', 'material'], ['lot_code', 'x'.repeat(121), 'lot'],
    ['supplier', '', 'supplier'], ['supplier', 'x'.repeat(161), 'supplier'], ['expiry_date', '', 'expiry'], ['product_ids', [], 'products'], ['product_ids', ['not-a-uuid'], 'products'],
    ['request_token', '', 'unexpected']
  ])('rejects invalid %s', (key, value, expected) => {
    expect(validateDailyUse({ ...valid, [key as string]: value })).toBe(expected);
  });
  it('preserves literal lot codes, trims text, and deduplicates multiple products', () => {
    const form = new FormData();
    form.set('lot_code', '  LOT_%(1)  ');
    form.append('product_ids', product); form.append('product_ids', material); form.append('product_ids', product);
    expect(readDailyUseFields(form).lot_code).toBe('LOT_%(1)');
    expect(readDailyUseFields(form).product_ids).toEqual([product, material]);
  });
});
