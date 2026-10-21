import { dailyUseOptions } from '$lib/server/daily-uses';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async () => {
  const options = await dailyUseOptions();
  const names = new Map(options.materials.map(m => [m.id, m.name]));
  return { recipes: options.products.map(recipe => ({
    ...recipe, ingredients: options.ingredients.filter(i => i.recipe_id === recipe.id).map(i => names.get(i.material_id) ?? '—')
  })) };
};
