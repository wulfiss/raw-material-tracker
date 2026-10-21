import { materials } from '$lib/server/repository';
import { requireRecipeWriter, saveSimpleRecipe, addRecipeMaterial } from '$lib/server/recipe-actions';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals }) => {
  requireRecipeWriter(locals.user);
  return { materials: await materials.listActive(), defaults: { name: '', material_ids: [] as string[] } };
};
export const actions: Actions = {
  save: ({ request, locals }) => saveSimpleRecipe(request, locals.user),
  addMaterial: ({ request, locals }) => addRecipeMaterial(request, locals.user)
};
