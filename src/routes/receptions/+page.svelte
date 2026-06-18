<script lang="ts">
  import type { PageProps } from './$types';
  import { translations } from '$lib/i18n/translations';
  import { calculateExpirationStatus } from '$lib/utils';

  const t = translations['es-AR'].reception;

  let { data }: PageProps = $props();

  let filters = $derived(data.filters);
  let receptions = $derived(data.receptions);
  let materials = $derived(data.materials);
  let activeFiltersCount = $derived(data.activeFiltersCount);

  let expiringSoon = $derived(
    receptions.filter((r) => {
      const status = calculateExpirationStatus(r.expirationDate);
      return status === 'expired' || status === 'near-expiry';
    })
  );

  function handleSearch() {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.materialId) params.set('materialId', filters.materialId);
    if (filters.category) params.set('category', filters.category);
    if (filters.supplierId) params.set('supplierId', filters.supplierId);
    if (filters.storageCondition) params.set('storageCondition', filters.storageCondition);
    if (filters.expirationStatus) params.set('expirationStatus', filters.expirationStatus);
    if (filters.withObservationsOnly) params.set('withObservationsOnly', 'true');

    window.location.href = `/receptions?${params.toString()}`;
  }

  function clearFilters() {
    window.location.href = '/receptions';
  }

  function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('es-AR');
  }

  function formatQuantity(quantity: number, unit: string): string {
    return `${quantity} ${unit}`;
  }

  function getExpirationLabel(status: string): string {
    switch (status) {
      case 'expired': return t.expired;
      case 'near-expiry': return t.nearExpiry;
      case 'ok': return t.ok;
      default: return t.missingExpiration;
    }
  }

  function expirationStatus(reception: typeof data.receptions[number]) {
    return calculateExpirationStatus(reception.expirationDate);
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">{t.title}</h1>
    <a
      href="/receptions/new"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
    >
      + {t.title}
    </a>
  </div>

  {#if expiringSoon.length > 0}
    <div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 class="font-semibold text-yellow-800 mb-2">
        {t.expiringSoon}: {expiringSoon.length}
      </h3>
      <ul class="space-y-1">
        {#each expiringSoon as reception}
          <li class="text-sm text-yellow-700">
            {reception.material?.name ?? reception.supplier_name} -
            {formatDate(reception.expirationDate)}
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <form method="POST" class="mb-6 p-4 bg-gray-50 rounded-lg" onsubmit={(e) => { e.preventDefault(); handleSearch(); }}>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{t.search}</label>
        <input
          type="text"
          name="search"
          value={filters.search}
          placeholder={t.searchPlaceholder}
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{t.dateFrom}</label>
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{t.dateTo}</label>
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{t.material}</label>
        <select
          name="materialId"
          value={filters.materialId}
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t.allMaterials}</option>
          {#each materials as material}
            <option value={material.id}>{material.name}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
        <select
          name="category"
          value={filters.category}
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t.allCategories}</option>
          <option value="Meat">Meat</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Dry goods">Dry goods</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{t.storageCondition}</label>
        <select
          name="storageCondition"
          value={filters.storageCondition}
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t.allConditions}</option>
          <option value="ambient">{t.ambient}</option>
          <option value="refrigerated">{t.refrigerated}</option>
          <option value="frozen">{t.frozen}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{t.expirationStatus}</label>
        <select
          name="expirationStatus"
          value={filters.expirationStatus}
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t.all}</option>
          <option value="expired">{t.expired}</option>
          <option value="near-expiry">{t.nearExpiry}</option>
          <option value="ok">{t.ok}</option>
          <option value="missing">{t.missingExpiration}</option>
        </select>
      </div>

      <div class="flex items-center">
        <input
          type="checkbox"
          name="withObservationsOnly"
          value="true"
          checked={filters.withObservationsOnly}
          class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label class="ml-2 block text-sm text-gray-700">{t.withObservations}</label>
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      <button
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        {t.filter}
      </button>
      {#if activeFiltersCount > 0}
        <button
          type="button"
          onclick={clearFilters}
          class="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
        >
          {t.clearFilters} ({activeFiltersCount})
        </button>
      {/if}
    </div>
  </form>

  <div class="mb-4 text-sm text-gray-600">
    {receptions.length} {receptions.length === 1 ? t.receptionSingular : t.receptionPlural}
  </div>

  {#if receptions.length === 0}
    <div class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-500">{t.noReceptionsFound}</p>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.date}</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.material}</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.supplier}</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.lot}</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.quantity}</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.expiration}</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each receptions as reception (reception.id)}
            {@const status = expirationStatus(reception)}
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {formatDate(reception.received_on)}
              </td>
              <td class="px-4 py-3 text-sm text-gray-900">
                {reception.material?.name ?? reception.supplier_name}
              </td>
              <td class="px-4 py-3 text-sm text-gray-900">
                {reception.supplier_name}
              </td>
              <td class="px-4 py-3 text-sm text-gray-900">
                {reception.lot_code ?? '-'}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {formatQuantity(reception.quantity, reception.unit)}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <span class="px-2 py-1 rounded text-xs font-medium {status === 'expired' ? 'bg-red-100 text-red-800' : status === 'near-expiry' ? 'bg-yellow-100 text-yellow-800' : status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                  {reception.expirationDate ? `${formatDate(reception.expirationDate)} (${getExpirationLabel(status)})` : t.missingExpiration}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <form method="POST" class="mt-6 p-4 bg-blue-50 rounded-lg">
    <h3 class="font-semibold text-blue-800 mb-2">{t.saveFilterView}</h3>
    <div class="flex gap-2">
      <input
        type="text"
        name="name"
        placeholder={t.viewName}
        class="flex-1 px-3 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        name="action"
        value="saveView"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        {t.save}
      </button>
    </div>
  </form>
</div>

<style>
</style>
