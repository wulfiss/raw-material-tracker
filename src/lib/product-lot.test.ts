import { describe, expect, it } from 'vitest';
import { formatProductLot } from './product-lot';

describe('product lot labels', () => {
  it('uses the product name and the exact production date', () => {
    expect(formatProductLot('Empanada', '2026-10-21')).toBe('empanada-20261021');
    expect(formatProductLot('Empanada', '2026-10-20')).toBe('empanada-20261020');
  });
  it('keeps Spanish product names readable and suitable for labels', () => {
    expect(formatProductLot('  Milanesa de POLLO  ', '2026-01-05')).toBe('milanesa-de-pollo-20260105');
    expect(formatProductLot('Ñoquis / Jamón y queso', '2026-10-21')).toBe('noquis-jamon-y-queso-20261021');
  });
  it('gives raw materials linked to the same product and day the same lot label', () => {
    const lots = ['pollo', 'huevo', 'pan rallado'].map(() => formatProductLot('Milanesa', '2026-10-21'));
    expect(new Set(lots)).toEqual(new Set(['milanesa-20261021']));
  });
});
