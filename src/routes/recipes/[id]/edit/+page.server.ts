import { error } from '@sveltejs/kit';
import { recipes, materials } from '$lib/server/repository';
import { requireRecipeWriter, saveSimpleRecipe, addRecipeMaterial } from '$lib/server/recipe-actions';
import { isUuid } from '$lib/daily-use';
import { getT } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ params, locals }) => {
  requireRecipeWriter(locals.user);
  if (!isUuid(params.id)) throw error(404, getT().simpleRecipe.messages.notFound);
  const recipe = await recipes.get(params.id);
  if (!recipe) throw error(404, getT().simpleRecipe.messages.notFound);
  const [ingredients, allMaterials] = await Promise.all([recipes.listIngredients(params.id), materials.list()]);
  return {
    materials: allMaterials.filter(m => m.active || ingredients.some(i => i.material_id === m.id)),
    defaults: { name: recipe.name, material_ids: ingredients.map(i => i.material_id) }
  };
};
export const actions: Actions = {
  save: ({ request, locals, params }) => saveSimpleRecipe(request, locals.user, params.id),
  addMaterial: ({ request, locals }) => addRecipeMaterial(request, locals.user)
};
