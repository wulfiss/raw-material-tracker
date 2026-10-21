import { describe, expect, it } from 'vitest';
import { rankSuppliers, supplierOptions } from './supplier-suggestions';

describe('brand/supplier suggestions', () => {
  it('merges case and spacing variants while keeping usage for each material', () => {
    const options = supplierOptions([
      { supplier: '  Marca  Norte ', material_id: 'flour' },
      { supplier: 'marca norte', material_id: 'flour' },
      { supplier: 'MARCA NORTE', material_id: 'chicken' },
      { supplier: '', material_id: 'flour' },
      { supplier: null, material_id: 'flour' },
      { supplier: '  ', material_id: 'flour' }
    ]);
    expect(options).toEqual([{ name: 'Marca Norte', uses: 3, materialUses: { flour: 2, chicken: 1 } }]);
  });

  it('ranks suppliers used for this material ahead of more popular unrelated suppliers', () => {
    const options = supplierOptions([
      ...Array.from({ length: 5 }, () => ({ supplier: 'General', material_id: 'flour' })),
      { supplier: 'Pollo A', material_id: 'chicken' },
      { supplier: 'Pollo B', material_id: 'chicken' },
      { supplier: 'Pollo B', material_id: 'chicken' }
    ]);
    expect(rankSuppliers(options, 'chicken').map(s => s.name)).toEqual(['Pollo B', 'Pollo A', 'General']);
    expect(rankSuppliers(options, 'new-material').map(s => s.name)).toEqual(['General', 'Pollo B', 'Pollo A']);
    expect(rankSuppliers(options, '').map(s => s.name)).toEqual(['General', 'Pollo B', 'Pollo A']);
    expect(options[0].name).toBe('General');
  });

  it('uses alphabetical ordering for ties and handles an empty history', () => {
    expect(rankSuppliers(supplierOptions([
      { supplier: 'Zeta', material_id: 'flour' },
      { supplier: 'Alfa', material_id: 'flour' }
    ]), 'flour').map(s => s.name)).toEqual(['Alfa', 'Zeta']);
    expect(rankSuppliers(supplierOptions([]), 'new-material')).toEqual([]);
  });
});
