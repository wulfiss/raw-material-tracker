import { loadDashboard } from '$lib/server/dashboard';
import { dailyUseOptions } from '$lib/server/daily-uses';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ url }) => {
  const [dashboard, options] = await Promise.all([loadDashboard(url), dailyUseOptions()]);
  return { ...dashboard, materials: options.materials, products: options.products };
};
