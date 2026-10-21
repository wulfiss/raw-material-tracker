import { error } from '@sveltejs/kit';
import { requireRole } from '$lib/server/authorize';
import { randomUUID } from 'node:crypto';
import { dailyUseOptions, saveDailyUse } from '$lib/server/daily-uses';
import { todayInTimeZone } from '$lib/server/repository/types';
import { isCalendarDate, isUuid } from '$lib/daily-use';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
  if (!locals.user) throw error(401);
  requireRole(locals.user, ['admin', 'quality']);
  const options = await dailyUseOptions(true);
  const date = url.searchParams.get('date') ?? '';
  return {
    ...options, materials: options.materials.filter(m => m.active), products: options.products.filter(p => p.active),
    saved: url.searchParams.get('saved') === '1',
    suggestions: (url.searchParams.get('suggest') ?? '').split(',').filter(isUuid).slice(0, 100),
    defaults: { used_on: isCalendarDate(date) ? date : todayInTimeZone(), material_id: '', supplier: '', lot_code: '', expiry_date: '', product_ids: [] as string[], request_token: randomUUID() }
  };
};
export const actions: Actions = { default: ({ request, locals }) => saveDailyUse(request, locals.user) };
