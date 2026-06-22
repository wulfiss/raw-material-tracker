import { error } from '@sveltejs/kit';
import { listRecipes, listRecipeIngredients, listReceptions } from '$lib/server/repository';
import { validateAndCreateBatch } from '$lib/server/production-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) throw error(401, 'Unauthorized');

  const [recipes, receptions] = await Promise.all([
    listRecipes(),
    listReceptions(),
  ]);

  const activeRecipes = recipes.filter(r => r.active);

  // Pre-load ingredients for each recipe
  const recipeMap = new Map();
  for (const recipe of activeRecipes) {
    const ingredients = await listRecipeIngredients(recipe.id);
    recipeMap.set(recipe.id, ingredients);
  }

  // If a recipe_id is provided in the URL, load its ingredients
  const recipe_id = url.searchParams.get('recipe_id');
  let selectedRecipe = null;
  let selectedIngredients = [];
  if (recipe_id && recipeMap.has(recipe_id)) {
    selectedRecipe = activeRecipes.find(r => r.id === recipe_id);
    selectedIngredients = recipeMap.get(recipe_id);
  }

  return {
    recipes: activeRecipes,
    receptions: receptions.rows,
    recipeMap,
    selectedRecipe,
    selectedIngredients,
    units: ['kg', 'g', 'L', 'mL', 'units', 'pieces', 'm', 'cm'],
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    const form = await request.formData();
    return validateAndCreateBatch(form, locals.user);
  },
};