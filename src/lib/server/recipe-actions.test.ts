import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('./repository', () => ({ recipes: { saveSimple: vi.fn() }, materials: { list: vi.fn(), create: vi.fn() } }));
import { recipes } from './repository';
import { saveSimpleRecipe } from './recipe-actions';
import type { AppUser } from './auth';
const user: AppUser = { id: 'u1', name: 'Operator', email: 'operator@example.com', role: 'quality' };
const material = '10000000-0000-4000-8000-000000000001';
const request = (ids = [material]) => {
  const data = new FormData();data.set('name', 'Empanada');for (const id of ids) data.append('material_ids', id);
  return new Request('http://localhost/recipes/new?/save', { method: 'POST', body: data });
};
beforeEach(() => { vi.mocked(recipes.saveSimple).mockReset(); });
describe('recipe creation permissions and errors', () => {
  it.each(['admin', 'quality'] as const)('allows %s to add a finished product', async role => {
    vi.mocked(recipes.saveSimple).mockResolvedValue({ ok: { id: 'recipe' } } as never);
    await expect(saveSimpleRecipe(request(), { ...user, role })).rejects.toMatchObject({ status: 303, location: '/recipes' });
  });
  it('keeps viewers read-only and requires authentication', async () => {
    await expect(saveSimpleRecipe(request(), { ...user, role: 'viewer' })).rejects.toMatchObject({ status: 403 });
    await expect(saveSimpleRecipe(request(), null)).rejects.toMatchObject({ status: 401 });
    expect(recipes.saveSimple).not.toHaveBeenCalled();
  });
  it('keeps selected ingredients and the name after validation fails', async () => {
    const result = await saveSimpleRecipe(request([]), user);
    expect(result).toMatchObject({ status: 400, data: { fields: { name: 'Empanada', material_ids: [] } } });
    expect(recipes.saveSimple).not.toHaveBeenCalled();
  });
  it('reports persistence failures without losing entered data', async () => {
    vi.mocked(recipes.saveSimple).mockRejectedValue(new Error('Private DB detail'));
    const result = await saveSimpleRecipe(request(), user);
    expect(result).toMatchObject({ status: 503, data: { fields: { name: 'Empanada', material_ids: [material] } } });
    expect(JSON.stringify(result)).not.toContain('Private DB detail');
  });
});
