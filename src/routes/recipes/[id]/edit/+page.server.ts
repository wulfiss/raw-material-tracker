import { error, fail, redirect } from '@sveltejs/kit';
import type { Unit } from '$lib/server/repository';
import {
  getRecipe,
  updateRecipe,
  listActiveMaterials,
  isMaterialUnit,
  listRecipeIngredients,
  replaceRecipeIngredients
} from '$lib/server/repository';
import { getT } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

const value = (data: FormData, key: string) => String(data.get(key) ?? '').trim();

export const load: PageServerLoad = async ({ params }) => {
  const recipe = await getRecipe(params.id);
  if (!recipe) throw error(404, 'Recipe not found');

  return {
    recipe,
    ingredients: await listRecipeIngredients(params.id),
    materials: await listActiveMaterials(),
    loadError: null as string | null
  };
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    const t = getT();
    const form = await request.formData();

    const fields = {
      name: value(form, 'name'),
      category: value(form, 'category') || null,
      yieldQuantity: Number(form.get('yieldQuantity')),
      yieldUnit: value(form, 'yieldUnit'),
      notes: value(form, 'notes') || null,
      active: form.has('active')
    };

    if (!fields.name) {
      return fail(400, { message: (t as any).newRecipe.messages.completeFields, fields });
    }

    if (isNaN(fields.yieldQuantity) || fields.yieldQuantity <= 0) {
      return fail(400, { message: (t as any).newRecipe.messages.invalidYieldQuantity, fields });
    }

    if (!isMaterialUnit(fields.yieldUnit)) {
      return fail(400, { message: (t as any).newRecipe.messages.invalidUnit, fields });
    }

    const recipeResult = await updateRecipe(params.id, { ...fields, yieldUnit: fields.yieldUnit as Unit });
    if ('error' in recipeResult) {
      return fail(400, { message: (t as any).newRecipe.messages.completeFields, fields });
    }

    const ingredientFields = [];
    let idx = 0;
    while (true) {
      const materialId = value(form, `ing_${idx}_material_id`);
      if (!materialId) break;
      const qtyStr = value(form, `ing_${idx}_quantity`);
      const unit = value(form, `ing_${idx}_unit`);
      const lossPercentStr = value(form, `ing_${idx}_lossPercent`);
      const notes = value(form, `ing_${idx}_notes`) || null;
      ingredientFields.push({ materialId, qty: qtyStr, unit, lossPercent: lossPercentStr, notes });
      idx++;
    }

    if (ingredientFields.length === 0) {
      return fail(400, { message: (t as any).newRecipe.messages.atLeastOneIngredient, fields });
    }

    for (const ing of ingredientFields) {
      const qty = Number(ing.qty);
      if (isNaN(qty) || qty <= 0) {
        return fail(400, { message: (t as any).newRecipe.messages.invalidYieldQuantity, fields });
      }
      if (!isMaterialUnit(ing.unit)) {
        return fail(400, { message: (t as any).newRecipe.messages.invalidUnit, fields });
      }
    }

    const ingredients = ingredientFields.map((ing) => ({
      material_id: ing.materialId,
      quantity: Number(ing.qty),
      unit: ing.unit as Unit,
      lossPercent: ing.lossPercent !== '' ? (Number(ing.lossPercent) || null) : null,
      notes: ing.notes
    }));

    const ingResult = await replaceRecipeIngredients(params.id, ingredients);
    if ('error' in ingResult) {
      const msgKey = ingResult.error.includes('Duplicate')
        ? 'duplicateMaterial'
        : ingResult.error.includes('active')
          ? 'selectActiveMaterial'
          : 'atLeastOneIngredient';
      return fail(400, { message: (t as any).newRecipe.messages[msgKey], fields });
    }

    redirect(303, '/recipes');
  }
};
