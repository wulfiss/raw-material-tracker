<script lang="ts">
  import { t } from '$lib/i18n';
  import { translateStatus } from '$lib/i18n/helpers';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  function expiryLabel(status: string) {
    if (status === 'expired') return $t.receptions.expired;
    if (status === 'near_expiry') return $t.receptions.nearExpiry;
    if (status === 'missing') return $t.receptions.missingExpiration;
    return $t.receptions.ok;
  }

  function statusLabel(status: string) {
    return translateStatus(status);
  }
</script>

<svelte:head>
  <title>{$t.receptions.title}</title>
  <style>
    @media print { @page { size: landscape; margin: 10mm; } }
  </style>
</svelte:head>

<div class="mx-auto max-w-full p-4 print:p-0">
  <div class="mb-4 flex items-center justify-between print:hidden">
    <h1 class="text-xl font-bold">{$t.receptions.title}</h1>
    <button onclick={() => window.print()} class="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{$t.receptions.print}</button>
  </div>

  {#if data.items.length === 0}
    <p class="text-muted-foreground">{$t.receptions.empty}</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b-2 border-gray-300 bg-muted">
            <th class="px-2 py-1.5 text-left font-semibold">{$t.receptions.table.date}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.receptions.table.material}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.materials.table.category}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.materials.table.storage}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.receptions.table.supplier}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.receptions.table.lot}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.newReception.fields.manufactureDate}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.receptions.table.expiry}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.receptions.table.expiry}</th>
            <th class="px-2 py-1.5 text-right font-semibold">{$t.receptions.table.quantity}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.newReception.fields.unit}</th>
            <th class="px-2 py-1.5 text-right font-semibold">{$t.receptions.table.temp}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.receptions.table.status}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.receptions.table.observations}</th>
            <th class="px-2 py-1.5 text-left font-semibold">{$t.receptions.table.createdBy}</th>
          </tr>
        </thead>
        <tbody>
          {#each data.items as item (item.id)}
            <tr class="border-b border-gray-200 even:bg-muted/30">
              <td class="px-2 py-1">{item.received_on}</td>
              <td class="px-2 py-1 font-medium">{item.materialName}</td>
              <td class="px-2 py-1">{item.materialCategory}</td>
              <td class="px-2 py-1">{item.materialStorage}</td>
              <td class="px-2 py-1">{item.supplier}</td>
              <td class="px-2 py-1">{item.lot_code}</td>
              <td class="px-2 py-1">{item.manufacture_date ?? '—'}</td>
              <td class="px-2 py-1">{item.expiry_date ?? '—'}</td>
              <td class="px-2 py-1">{expiryLabel(item.expirationStatus)}</td>
              <td class="px-2 py-1 text-right">{item.quantity}</td>
              <td class="px-2 py-1">{item.unit}</td>
              <td class="px-2 py-1 text-right">{item.temperature_c == null ? '—' : `${item.temperature_c} °C`}</td>
              <td class="px-2 py-1">{statusLabel(item.status)}</td>
              <td class="px-2 py-1 max-w-40 truncate">{item.observations ?? '—'}</td>
              <td class="px-2 py-1">{item.created_by_name}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="mt-2 text-xs text-muted-foreground">{data.items.length} {$t.newReception.receptionPlural}</p>
  {/if}
</div>
