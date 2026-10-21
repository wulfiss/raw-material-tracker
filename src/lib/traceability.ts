import type { DailyUseRecord } from './daily-use';
export function summarizeDailyUses(rows: DailyUseRecord[]) {
  const materials = new Set<string>();
  const products = new Set<string>();
  const lots = new Set<string>();
  for (const row of rows) {
    materials.add(row.material_id);
    for (const product of row.products) {
      products.add(product.recipe_id);
      lots.add(`${product.recipe_id}:${row.used_on}`);
    }
  }
  return { records: rows.length, materials: materials.size, products: products.size, productionLots: lots.size };
}
