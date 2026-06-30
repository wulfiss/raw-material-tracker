import { error, fail, redirect } from '@sveltejs/kit';
import type { Unit } from '$lib/server/repository';
import { recipes, materials } from '$lib/server/repository';
import { isMaterialUnit } from '$lib/server/repository';
import { getT } from '$lib/i18n';
import { formText } from '$lib/server/form-utils';
import { requireRole } from '$lib/server/authorize';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return { materials: await materials.listActive() };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    requireRole(locals.user, ['admin', 'quality']);
    const t = getT();
    const form = await request.formData();

    const fields = {
      name: formText(form, 'name'),
      category: formText(form, 'category') || null,
      yieldQuantity: Number(form.get('yieldQuantity')),
      yieldUnit: formText(form, 'yieldUnit'),
      notes: formText(form, 'notes') || null,
      active: form.has('active')
    };

    if (!fields.name) {
      return fail(400, { message: t.newRecipe.messages.completeFields, fields });
    }

    if (isNaN(fields.yieldQuantity) || fields.yieldQuantity <= 0) {
      return fail(400, { message: t.newRecipe.messages.invalidYieldQuantity, fields });
    }

    if (!isMaterialUnit(fields.yieldUnit)) {
      return fail(400, { message: t.newRecipe.messages.invalidUnit, fields });
    }

    const ingredientFields = [];
    let idx = 0;
    while (true) {
      const materialId = formText(form, `ing_${idx}_material_id`);
      if (!materialId) break;
      const qtyStr = formText(form, `ing_${idx}_quantity`);
      const unit = formText(form, `ing_${idx}_unit`);
      const lossPercentStr = formText(form, `ing_${idx}_lossPercent`);
      const notes = formText(form, `ing_${idx}_notes`) || null;
      ingredientFields.push({ materialId, qty: qtyStr, unit, lossPercent: lossPercentStr, notes });
      idx++;
    }

    if (ingredientFields.length === 0) {
      return fail(400, { message: t.newRecipe.messages.atLeastOneIngredient, fields });
    }

    for (const ing of ingredientFields) {
      const qty = Number(ing.qty);
      if (isNaN(qty) || qty <= 0) {
        return fail(400, { message: t.newRecipe.messages.invalidYieldQuantity, fields });
      }
      if (!isMaterialUnit(ing.unit)) {
        return fail(400, { message: t.newRecipe.messages.invalidUnit, fields });
      }
    }

    const ingredients = ingredientFields.map(ing => ({
      material_id: ing.materialId,
      quantity: Number(ing.qty),
      unit: ing.unit as Unit,
      lossPercent: ing.lossPercent !== '' ? (Number(ing.lossPercent) || null) : null,
      notes: ing.notes
    }));

    const result = await recipes.create(
      {
        name: fields.name,
        category: fields.category,
        yieldQuantity: fields.yieldQuantity,
        yieldUnit: fields.yieldUnit as Unit,
        notes: fields.notes,
        active: fields.active
      },
      locals.user,
      ingredients
    );

    if ('error' in result) {
      const msgKey = result.error === 'duplicate_name' ? 'duplicateName' : 'atLeastOneIngredient';
      return fail(400, { message: t.newRecipe.messages[msgKey], fields });
    }

    throw redirect(303, '/recipes');
  }
};
