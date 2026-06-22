import { error } from '@sveltejs/kit';
import { getProductionBatch } from '$lib/server/repository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');

  const batch = await getProductionBatch(params.id);
  if (!batch) throw error(404, 'Production batch not found');

  return { batch };
};