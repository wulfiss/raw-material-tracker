import type { PageServerLoad } from './$types';
import { materials, receptions, recipes } from '$lib/server/repository';

export const load: PageServerLoad = async () => {
  const allMaterials = await materials.list();
  const allReceptions = await receptions.list({});
  const allRecipes = await recipes.list();

  // Count active vs inactive materials
  const activeMaterials = allMaterials.filter((m) => m.active);
  const inactiveMaterials = allMaterials.filter((m) => !m.active);

  // Count expired and near-expiry receptions
  const expiredReceptions = allReceptions.rows.filter(
    (r) => r.expirationStatus === 'expired'
  );
  const nearExpiryReceptions = allReceptions.rows.filter(
    (r) => r.expirationStatus === 'near_expiry'
  );

  // Count accepted vs rejected receptions
  const acceptedReceptions = allReceptions.rows.filter(
    (r) => r.status === 'accepted'
  );
  const rejectedReceptions = allReceptions.rows.filter(
    (r) => r.status === 'rejected'
  );

  return {
    stats: {
      totalMaterials: allMaterials.length,
      activeMaterials: activeMaterials.length,
      inactiveMaterials: inactiveMaterials.length,
      totalRecipes: allRecipes.length,
      totalReceptions: allReceptions.rows.length,
      expiredReceptions: expiredReceptions.length,
      nearExpiryReceptions: nearExpiryReceptions.length,
      acceptedReceptions: acceptedReceptions.length,
      rejectedReceptions: rejectedReceptions.length,
    },
    recentReceptions: allReceptions.rows.slice(0, 5),
  };
};
