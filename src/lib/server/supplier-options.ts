import { db } from './db';
import { allRows } from './all-rows';
import { supplierOptions } from '$lib/supplier-suggestions';

export async function loadSupplierOptions() {
  const [receptions, dailyUses] = await Promise.all([
    allRows(async (from, to) => {
      const result = await db.from('receptions').select('supplier, material_id')
        .neq('supplier', '').order('supplier').order('id').range(from, to);
      // The standalone daily-use setup also supports installations without legacy receptions.
      if (result.error && ['42P01', 'PGRST205'].includes(result.error.code)) {
        return { data: [], error: null };
      }
      return result;
    }),
    allRows((from, to) => db.from('daily_material_uses').select('supplier, material_id')
      .neq('supplier', '').order('supplier').order('id').range(from, to))
  ]);
  return supplierOptions([...receptions, ...dailyUses]);
}
