import crypto from 'node:crypto';
import type { Material, Result } from './types';
import type { MaterialStore } from './stores';
import type { MockUser } from '../mock-auth';

export function createMaterials(materialStore: MaterialStore) {
  return {
    async list(): Promise<Material[]> {
      return materialStore.list();
    },

    async listActive(): Promise<Material[]> {
      return materialStore.listActive();
    },

    async get(id: string): Promise<Material | null> {
      return materialStore.get(id);
    },

    async create(
      input: { name: string; category: string; unit: Material['unit']; storageCondition?: string; minStock?: number; expirationRequired?: boolean; active?: boolean },
      user: MockUser
    ): Promise<Result<Material>> {
      const dup = await materialStore.getByName(input.name);
      if (dup) return { error: 'A material with this name already exists.' };

      const material = await materialStore.create({
        id: crypto.randomUUID(),
        name: input.name,
        category: input.category,
        unit: input.unit,
        storage_condition: input.storageCondition ?? 'ambient',
        min_stock: input.minStock ?? 0,
        expiration_required: input.expirationRequired ?? false,
        active: input.active ?? true,
        created_by: user.id,
        created_by_name: user.name,
      });
      return { ok: material };
    },

    async update(
      id: string,
      input: { name: string; category: string; unit: Material['unit']; storageCondition: string; minStock?: number; expirationRequired?: boolean; active?: boolean }
    ): Promise<Result<Material>> {
      const dup = await materialStore.getByName(input.name, id);
      if (dup) return { error: 'A material with this name already exists.' };

      const material = await materialStore.update(id, {
        name: input.name,
        category: input.category,
        unit: input.unit,
        storage_condition: input.storageCondition,
        min_stock: input.minStock,
        expiration_required: input.expirationRequired,
        active: input.active,
      });
      return { ok: material };
    },

    async toggleStatus(id: string): Promise<Result<Material>> {
      const material = await materialStore.get(id);
      if (!material) return { error: 'Material not found' };

      const updated = await materialStore.update(id, { active: !material.active });
      return { ok: updated };
    },

    async remove(id: string): Promise<Result<{ success: true } | { success: true; deactivated: true }>> {
      const material = await materialStore.get(id);
      if (!material) return { error: 'Material not found' };

      const hasReceptions = await materialStore.hasReceptions(id);
      if (hasReceptions) {
        await materialStore.update(id, { active: false });
        return { ok: { success: true, deactivated: true } };
      }

      await materialStore.delete(id);
      return { ok: { success: true } };
    },
  };
}
