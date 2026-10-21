/** Human-readable product lot; the supplied date is the production calendar date. */
export function formatProductLot(productName: string, productionDate: string): string {
  const name = productName.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${name || 'producto'}-${productionDate.replaceAll('-', '')}`;
}
