import { error } from '@sveltejs/kit';
import { db } from './db';
import { allRows } from './all-rows';
import { getT } from '$lib/i18n';
import { isCalendarDate, isUuid, type DailyUseRecord } from '$lib/daily-use';
import { summarizeDailyUses } from '$lib/traceability';

export async function loadDashboard(url: URL) {
  const text = (key: string) => (url.searchParams.get(key) ?? '').trim();
  const filters = { from: text('from'), to: text('to'), material: text('material'), product: text('product'), supplier: text('supplier').slice(0, 160), lot: text('lot').slice(0, 120) };
  if ((filters.from && !isCalendarDate(filters.from)) || (filters.to && !isCalendarDate(filters.to)) ||
    (filters.from && filters.to && filters.from > filters.to) || (filters.material && !isUuid(filters.material)) || (filters.product && !isUuid(filters.product))) {
    throw error(400, getT().dashboardView.filtersError);
  }
  const page = Math.max(1, Number.parseInt(text('page')) || 1);
  try {
    const rows = await allRows<DailyUseRecord>((from, to) => {
      let query = db.from('daily_material_uses').select('*, products:daily_material_use_products!inner(recipe_id, product_name)');
      if (filters.from) query = query.gte('used_on', filters.from);
      if (filters.to) query = query.lte('used_on', filters.to);
      if (filters.material) query = query.eq('material_id', filters.material);
      if (filters.product) query = query.eq('products.recipe_id', filters.product);
      if (filters.supplier) query = query.ilike('supplier', `%${filters.supplier.replace(/[\\%_]/g, '\\$&')}%`);
      if (filters.lot) query = query.ilike('lot_code', `%${filters.lot.replace(/[\\%_]/g, '\\$&')}%`);
      return query.order('used_on', { ascending: false }).order('created_at', { ascending: false }).order('id').range(from, to);
    });
    const pages = Math.max(1, Math.ceil(rows.length / 50));
    const currentPage = Math.min(page, pages);
    return { filters, page: currentPage, pages, total: rows.length, stats: summarizeDailyUses(rows), rows: rows.slice((currentPage - 1) * 50, currentPage * 50) };
  } catch {
    throw error(503, getT().dailyUse.messages.load);
  }
}
