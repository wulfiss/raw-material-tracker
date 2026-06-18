<script lang="ts">
  import type { PageProps } from './$types';
  import { translations } from '$lib/i18n/translations';
  import { calculateExpirationStatus } from '$lib/utils';

  const t = translations['es-AR'].reception;

  let { data, form }: PageProps = $props();

  let formFields = $state({
    date: data.today,
    material_id: '',
    supplier_name: '',
    lot: '',
    manufacture_date: '',
    expiration_date: '',
    quantity: '',
    unit: 'kg',
    temperature: '',
    storage_condition: 'ambient',
    observations: ''
  });

  let expirationStatusValue = $derived(formFields.expiration_date
    ? calculateExpirationStatus(formFields.expiration_date)
    : 'missing');

  let isExpiringSoon = $derived(
    expirationStatusValue === 'near-expiry' || expirationStatusValue === 'expired'
  );

  // Server-side validation handles all checks; form submits naturally

  function resetForm() {
    formFields = {
      date: data.today,
      material_id: '',
      supplier_name: '',
      lot: '',
      manufacture_date: '',
      expiration_date: '',
      quantity: '',
      unit: 'kg',
      temperature: '',
      storage_condition: 'ambient',
      observations: ''
    };
  }

  function getExpirationLabel(status: string): string {
    switch (status) {
      case 'expired': return t.expired;
      case 'near-expiry': return t.nearExpiry;
      case 'ok': return t.ok;
      default: return t.missingExpiration;
    }
  }
</script>

<div class="container mx-auto p-6 max-w-4xl">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">{t.title}</h1>
    <a href="/receptions" class="text-blue-600 hover:text-blue-800">
      &larr; {t.back}
    </a>
  </div>

  {#if form?.message}
    <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      {form.message}
    </div>
  {/if}

  <form method="POST" class="space-y-6">
    <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{t.receptionDate}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {t.date} <span class="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formFields.date}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {t.supplier} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="supplier_name"
            value={formFields.supplier_name}
            placeholder={t.supplierName}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{t.material}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{t.selectMaterial}</label>
          <select
            name="material_id"
            value={formFields.material_id}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t.noMaterial}</option>
            {#each data.materials as material}
              <option value={material.id}>{material.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{t.lot}</label>
          <input
            type="text"
            name="lot"
            value={formFields.lot}
            placeholder={t.lotCode}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{t.quantity}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {t.amount} <span class="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="quantity"
            value={formFields.quantity}
            placeholder="0"
            step="0.01"
            min="0.01"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {t.unit} <span class="text-red-500">*</span>
          </label>
          <select
            name="unit"
            value={formFields.unit}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="L">L</option>
            <option value="mL">mL</option>
            <option value="unit">{t.unitSingular}</option>
            <option value="box">{t.box}</option>
            <option value="bag">{t.bag}</option>
            <option value="pallet">{t.pallet}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{t.dates}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{t.manufactureDate}</label>
          <input
            type="date"
            name="manufacture_date"
            value={formFields.manufacture_date}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{t.expirationDate}</label>
          <input
            type="date"
            name="expiration_date"
            value={formFields.expiration_date}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {#if isExpiringSoon}
            <div class="mt-2">
              <span class="px-2 py-1 rounded text-xs font-medium {expirationStatusValue === 'expired' ? 'bg-red-100 text-red-800' : expirationStatusValue === 'near-expiry' ? 'bg-yellow-100 text-yellow-800' : expirationStatusValue === 'ok' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                {getExpirationLabel(expirationStatusValue)}
              </span>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{t.storageConditions}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{t.storageCondition}</label>
          <select
            name="storage_condition"
            value={formFields.storage_condition}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ambient">{t.ambient}</option>
            <option value="refrigerated">{t.refrigerated}</option>
            <option value="frozen">{t.frozen}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{t.temperature} (°C)</label>
          <input
            type="number"
            name="temperature"
            value={formFields.temperature}
            placeholder="-18"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{t.observations}</h2>
      <div>
        <textarea
          name="observations"
          value={formFields.observations}
          rows="4"
          placeholder={t.observationsPlaceholder}
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>
    </div>

    <div class="flex gap-3 justify-end">
      <button
        type="button"
        onclick={resetForm}
        class="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
      >
        {t.reset}
      </button>
      <button
        type="submit"
        class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {t.save}
      </button>
    </div>
  </form>
</div>

<style>
</style>
