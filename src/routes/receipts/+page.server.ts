import { listReceipts } from '$lib/server/mock-db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const search = url.searchParams.get('search')?.trim().slice(0, 80) ?? '';

  return {
    receipts: await listReceipts(search),
    search,
    loadError: null
  };
};
