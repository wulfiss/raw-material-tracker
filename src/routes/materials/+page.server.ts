import { listMaterials } from '$lib/server/mock-db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    materials: await listMaterials(),
    loadError: null
  };
};
