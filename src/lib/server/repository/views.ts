import crypto from 'node:crypto';
import type { ReceptionFilters, ReceptionView, Result } from './types';
import type { ReceptionViewStore } from './stores';

const defaultReceptionViews: ReceptionView[] = [
  { id: 'all', name: 'All receptions', default: true, filters: {} },
  { id: 'expired-view', name: 'Expired', default: true, filters: { expirationStatus: 'expired' } },
  { id: 'near-expiry-view', name: 'Near expiry', default: true, filters: { expirationStatus: 'near_expiry' } },
  { id: 'missing-view', name: 'Missing expiration', default: true, filters: { expirationStatus: 'missing' } },
];

export function createViews(viewStore: ReceptionViewStore) {
  return {
    async list(): Promise<ReceptionView[]> {
      const customViews = await viewStore.list();
      return [...defaultReceptionViews, ...customViews];
    },

    async save(name: string, filters: ReceptionFilters): Promise<Result<{ view: ReceptionView }>> {
      const existing = await viewStore.getByName(name);
      if (existing) return { error: 'A view with this name already exists.' };

      const id = 'custom-' + crypto.randomUUID();
      await viewStore.save(id, name, filters);

      return { ok: { view: { id, name, default: false, filters } } };
    },

    async remove(id: string): Promise<Result<{ success: true }>> {
      const deleted = await viewStore.delete(id);
      if (!deleted) return { error: 'View not found' };
      return { ok: { success: true } };
    },
  };
}
