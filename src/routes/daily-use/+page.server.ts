import { listDailyUses, dailyUseOptions } from '$lib/server/daily-uses';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ url }) => {
  const [records, options] = await Promise.all([listDailyUses(url), dailyUseOptions()]);
  return { ...records, products: options.products };
};
