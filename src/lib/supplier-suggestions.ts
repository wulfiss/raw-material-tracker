export type SupplierOption = {
  name: string;
  uses: number;
  materialUses: Record<string, number>;
};

/** Reuse saved names without repeating case/spacing variants in the suggestions. */
export function supplierOptions(rows: { supplier: string | null; material_id: string }[]): SupplierOption[] {
  const suppliers = new Map<string, SupplierOption>();
  for (const row of rows) {
    const name = (row.supplier ?? '').trim().replace(/\s+/g, ' ');
    if (!name || name.length > 160) continue;
    const key = name.normalize('NFC').toLocaleLowerCase('es');
    let option = suppliers.get(key);
    if (!option) {
      option = { name, uses: 0, materialUses: {} };
      suppliers.set(key, option);
    }
    option.uses++;
    option.materialUses[row.material_id] = (option.materialUses[row.material_id] ?? 0) + 1;
  }
  return [...suppliers.values()];
}

/** Prefer this material's frequent suppliers, then the shared history for new materials. */
export function rankSuppliers(options: SupplierOption[], materialId: string): SupplierOption[] {
  return options.toSorted((a, b) =>
    (b.materialUses[materialId] ?? 0) - (a.materialUses[materialId] ?? 0)
    || b.uses - a.uses || a.name.localeCompare(b.name, 'es')
  );
}
