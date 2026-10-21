import { error, fail, redirect } from '@sveltejs/kit';
import { recipes, materials } from './repository';
import { requireRole } from './authorize';
import { getT } from '$lib/i18n';
import { readSimpleRecipe, validateSimpleRecipe } from '$lib/simple-recipe';
import { isUuid } from '$lib/daily-use';
import type { AppUser } from './auth';

export function requireRecipeWriter(user: AppUser | null) {
  if (!user) throw error(401, 'Unauthorized');
  requireRole(user, ['admin', 'quality']);
  return user;
}
export async function saveSimpleRecipe(request: Request, user: AppUser | null, id?: string) {
  const actor = requireRecipeWriter(user);
  if (id && !isUuid(id)) throw error(404, getT().simpleRecipe.messages.notFound);
  const fields = readSimpleRecipe(await request.formData());
  const invalid = validateSimpleRecipe(fields);
  if (invalid) return fail(400, { fields, message: getT().simpleRecipe.messages[invalid] });
  try {
    const result = await recipes.saveSimple({ name: fields.name, materialIds: fields.material_ids }, actor, id);
    if ('error' in result) {
      const key = result.error === 'duplicate_name' ? 'duplicate' : result.error === 'name_required' ? 'name' : 'ingredients';
      return fail(400, { fields, message: getT().simpleRecipe.messages[key] });
    }
  } catch {
    return fail(503, { fields, message: getT().simpleRecipe.messages.save });
  }
  throw redirect(303, '/recipes');
}
export async function addRecipeMaterial(request: Request, user: AppUser | null) {
  const actor = requireRecipeWriter(user);
  const form = await request.formData();
  const fields = readSimpleRecipe(form);
  const value = form.get('new_material');
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name || name.length > 120) return fail(400, { fields, message: getT().simpleRecipe.messages.materialName });
  try {
    // Resolve existing names first, including inactive materials, to avoid duplicates.
    const all = await materials.list();
    let material = all.find(m => m.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (material && !material.active) return fail(400, { fields, message: getT().simpleRecipe.messages.inactive });
    if (!material) {
      const result = await materials.create({ name, category: 'General', unit: 'kg', storageCondition: 'ambient', minStock: 0, expirationRequired: true, active: true }, actor);
      if ('error' in result) return fail(400, { fields, message: getT().simpleRecipe.messages.materialName });
      material = result.ok;
    }
    return { fields: { ...fields, material_ids: [...new Set([...fields.material_ids, material.id])] }, message: '', materialAdded: true };
  } catch {
    return fail(503, { fields, message: getT().simpleRecipe.messages.save });
  }
}
