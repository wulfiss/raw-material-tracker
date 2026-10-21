import { error, fail, redirect } from '@sveltejs/kit';
import { db } from './db';
import { allRows } from './all-rows';
import { requireRole } from './authorize';
import { getT } from '$lib/i18n';
import { isCalendarDate, isUuid, readDailyUseFields, validateDailyUse } from '$lib/daily-use';
import type { DailyUseRecord } from '$lib/daily-use';
import type { AppUser } from './auth';
import { todayInTimeZone } from './repository/types';

export async function dailyUseOptions() {
  try {
    const [materials, products, ingredients] = await Promise.all([
      allRows((from, to) => db.from('materials').select('id, name, active').order('name').order('id').range(from, to)),
      allRows((from, to) => db.from('recipes').select('id, name, active').order('name').order('id').range(from, to)),
      allRows((from, to) => db.from('recipe_ingredients').select('material_id, recipe_id').order('id').range(from, to))
    ]);
    return { materials, products, ingredients };
  } catch {
    throw error(503, getT().dailyUse.messages.load);
  }
}
export async function getDailyUse(id: string): Promise<DailyUseRecord> {
  if (!isUuid(id)) throw error(404, getT().dailyUse.messages.notFound);
  const result = await db.from('daily_material_uses').select('*, products:daily_material_use_products(recipe_id, product_name)').eq('id', id).maybeSingle();
  if (result.error) throw error(503, getT().dailyUse.messages.load);
  if (!result.data) throw error(404, getT().dailyUse.messages.notFound);
  return result.data as DailyUseRecord;
}
export async function listDailyUses(url: URL) {
  const date = url.searchParams.get('date') ?? todayInTimeZone();
  const allDates = url.searchParams.get('all') === '1';
  const product = url.searchParams.get('product') ?? '';
  const lot = (url.searchParams.get('lot') ?? '').trim().slice(0, 120);
  const page = Math.min(100000, Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1') || 1));
  if ((!allDates && !isCalendarDate(date)) || (product && !isUuid(product))) throw error(400, getT().dailyUse.messages.filters);
  let query = db.from('daily_material_uses').select('*, products:daily_material_use_products!inner(recipe_id, product_name)', { count: 'exact' });
  if (!allDates) query = query.eq('used_on', date);
  if (product) query = query.eq('products.recipe_id', product);
  if (lot) query = query.ilike('lot_code', `%${lot.replace(/[\\%_]/g, '\\$&')}%`);
  const result = await query.order('used_on', { ascending: false }).order('created_at', { ascending: false }).order('id').range((page - 1) * 50, page * 50 - 1);
  if (result.error) throw error(503, getT().dailyUse.messages.load);
  return { rows: result.data as DailyUseRecord[], total: result.count ?? 0, date, allDates, product, lot, page };
}
export async function saveDailyUse(request: Request, user: AppUser | null, id: string | null = null) {
  if (!user) throw error(401, 'Unauthorized');
  requireRole(user, ['admin', 'quality']);
  const form = await request.formData();
  const fields = readDailyUseFields(form);
  const invalid = validateDailyUse(fields);
  if (invalid) return fail(400, { fields, message: getT().dailyUse.messages[invalid] });
  if (id && !isUuid(id)) throw error(404, getT().dailyUse.messages.notFound);
  const result = await db.rpc('save_daily_material_use', {
    p_id: id, p_request_token: fields.request_token, p_used_on: fields.used_on,
    p_material_id: fields.material_id, p_supplier: fields.supplier, p_lot_code: fields.lot_code, p_expiry_date: fields.expiry_date,
    p_product_ids: fields.product_ids, p_user_id: user.id, p_user_name: user.name
  });
  if (result.error) {
    const message = result.error.message.includes('daily_use_invalid_material') ? getT().dailyUse.messages.material
      : result.error.message.includes('daily_use_invalid_products') ? getT().dailyUse.messages.products
      : result.error.message.includes('daily_use_not_found') ? getT().dailyUse.messages.notFound
      : getT().dailyUse.messages.unexpected;
    return fail(400, { fields, message });
  }
  const params = new URLSearchParams({ date: fields.used_on });
  if (!id && form.get('intent') === 'another') {
    params.set('saved', '1'); params.set('suggest', fields.product_ids.join(','));
    throw redirect(303, `/daily-use/new?${params}`);
  }
  throw redirect(303, `/daily-use?${params}`);
}
