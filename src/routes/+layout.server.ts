import { getMockUser } from '$lib/server/mock-auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  return {
    user: getMockUser(),
    dataMode: 'local mock'
  };
};
