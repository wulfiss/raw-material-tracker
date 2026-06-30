import type {
  Reception, ReceptionFilters, ReceptionListItem, Result,
  Material,
} from './types';
import { computeExpirationStatus, todayInTimeZone } from './types';
import type { ReceptionStore, MaterialStore } from './stores';
import type { AppUser } from '../auth';

function toReceptionListItem(row: Record<string, unknown>): ReceptionListItem {
  const mat = row.material as any;
  return {
    id: row.id as string,
    received_on: row.received_on as string,
    material_id: row.material_id as string,
    supplier: row.supplier as string,
    lot_code: row.lot_code as string,
    manufacture_date: (row.manufacture_date as string) ?? null,
    expiry_date: (row.expiry_date as string) ?? null,
    quantity: Number(row.quantity),
    unit: row.unit as Reception['unit'],
    temperature_c: row.temperature_c != null ? Number(row.temperature_c) : null,
    status: row.status as Reception['status'],
    observations: (row.observations as string) ?? null,
    created_at: row.created_at as string,
    created_by: row.created_by as string,
    created_by_name: row.created_by_name as string,
    material: mat ? { id: mat.id, name: mat.name, unit: mat.unit } : null,
    expirationStatus: computeExpirationStatus(row.expiry_date as string | null),
  };
}

export function createReceptions(
  materialStore: MaterialStore,
  receptionStore: ReceptionStore,
) {
  return {
    async list(filters: ReceptionFilters = {}): Promise<{ rows: ReceptionListItem[]; truncated: boolean }> {
      const { data, truncated: dbTruncated } = await receptionStore.queryRaw(filters);

      const normalized = (filters.search ?? '').trim().toLowerCase();
      const filtered = data.filter((r: Record<string, unknown>) => {
        if (normalized) {
          const matName = (r.material as any)?.name ?? '';
          const matches = [r.supplier, r.lot_code, matName, r.observations ?? '']
            .some(v => String(v).toLowerCase().includes(normalized));
          if (!matches) return false;
        }
        if (filters.expirationStatus) {
          if (computeExpirationStatus(r.expiry_date as string | null) !== filters.expirationStatus) return false;
        }
        return true;
      });

      const truncated = dbTruncated || filtered.length > 100;

      return {
        rows: filtered.slice(0, 100).map(toReceptionListItem),
        truncated,
      };
    },

    async get(id: string): Promise<Reception | null> {
      return receptionStore.get(id);
    },

    async create(
      input: Omit<Reception, 'id' | 'created_at' | 'created_by' | 'created_by_name'>,
      user: AppUser
    ): Promise<Result<Reception>> {
      const material = await materialStore.get(input.material_id);
      if (!material || !material.active) return { error: 'Select an active material.' };

      const reception = await receptionStore.create({
        ...input,
        created_by: user.id,
        created_by_name: user.name,
      });
      return { ok: reception };
    },

    async update(
      id: string,
      input: Omit<Reception, 'id' | 'created_at' | 'created_by' | 'created_by_name'>,
      user: AppUser
    ): Promise<Result<Reception>> {
      const existing = await receptionStore.get(id);
      if (!existing) return { error: 'Reception not found.' };

      const material = await materialStore.get(input.material_id);
      if (!material || !material.active) return { error: 'Select an active material.' };

      const reception = await receptionStore.update(id, {
        ...input,
        created_by: existing.created_by,
        created_by_name: existing.created_by_name,
      });
      return { ok: reception };
    },

    async remove(id: string): Promise<Result<{ success: true }>> {
      const existing = await receptionStore.get(id);
      if (!existing) return { error: 'Reception not found.' };

      await receptionStore.delete(id);
      return { ok: { success: true } };
    },

    async expirationSummary(): Promise<{ expired: number; near_expiry: number; missing: number }> {
      const today = todayInTimeZone();
      const nearLimit = todayInTimeZone(7);

      const [expired, nearExpiry, missing] = await Promise.all([
        receptionStore.countExpired(today),
        receptionStore.countNearExpiry(today, nearLimit),
        receptionStore.countMissingExpiry(),
      ]);

      return { expired, near_expiry: nearExpiry, missing };
    },
  };
}
