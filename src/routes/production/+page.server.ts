import { error } from '@sveltejs/kit';
import { listProductionBatches } from '$lib/server/repository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  return {
    batches: await listProductionBatches(),
  };
};