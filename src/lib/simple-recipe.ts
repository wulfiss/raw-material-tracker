import { isUuid } from './daily-use';
export type SimpleRecipeFields = { name: string; material_ids: string[] };
export function readSimpleRecipe(form: FormData): SimpleRecipeFields {
  return {
    name: typeof form.get('name') === 'string' ? String(form.get('name')).trim() : '',
    material_ids: form.getAll('material_ids').filter((v): v is string => typeof v === 'string').map(v => v.toLowerCase())
  };
}
export function validateSimpleRecipe(fields: SimpleRecipeFields): 'name' | 'ingredients' | null {
  if (!fields.name || fields.name.length > 120) return 'name';
  if (!fields.material_ids.length || fields.material_ids.length > 100 || fields.material_ids.some(id => !isUuid(id)) || new Set(fields.material_ids).size !== fields.material_ids.length) return 'ingredients';
  return null;
}
