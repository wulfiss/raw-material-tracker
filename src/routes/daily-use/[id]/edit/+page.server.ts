import { error } from '@sveltejs/kit';
import { requireRole } from '$lib/server/authorize';
import { dailyUseOptions, getDailyUse, saveDailyUse } from '$lib/server/daily-uses';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) throw error(401);
  requireRole(locals.user, ['admin', 'quality']);
  const [record, options] = await Promise.all([getDailyUse(params.id), dailyUseOptions()]);
  return {
    ...options,
    materials: options.materials.filter(m => m.active || m.id === record.material_id),
    products: options.products.filter(p => p.active || record.products.some(link => link.recipe_id === p.id)).map(p => ({ ...p, name: record.products.find(link => link.recipe_id === p.id)?.product_name ?? p.name })),
    defaults: { used_on: record.used_on, material_id: record.material_id, supplier: record.supplier ?? '', lot_code: record.lot_code,
      expiry_date: record.expiry_date, request_token: record.request_token, product_ids: record.products.map(p => p.recipe_id) }
  };
};
export const actions: Actions = { default: ({ request, locals, params }) => saveDailyUse(request, locals.user, params.id) };
