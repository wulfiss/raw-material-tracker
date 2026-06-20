<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Alert } from '$lib/components/ui/alert';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import ReceptionFormFields from '$lib/components/receptions/ReceptionFormFields.svelte';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  let materials = $derived(data.materials);
  let r = $derived(data.reception);
  let defaults = $derived({
    received_on: r.received_on,
    material_id: r.material_id,
    supplier: r.supplier,
    lot_code: r.lot_code,
    manufacture_date: r.manufacture_date ?? '',
    expiry_date: r.expiry_date ?? '',
    quantity: String(r.quantity),
    unit: r.unit,
    temperature_c: r.temperature_c === null ? '' : String(r.temperature_c),
    status: r.status,
    observations: r.observations ?? ''
  });
</script>

<div class="mb-8">
  <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.receptions.subtitle}</p>
  <h1 class="mt-2 text-3xl font-bold tracking-tight">{$t.common.editReception}</h1>
</div>

<div class="mb-6 grid gap-3">
  {#if data.loadError}<Alert variant="destructive">{data.loadError}</Alert>{/if}
  {#if form?.message}<Alert variant="destructive">{form.message}</Alert>{/if}
</div>

<Card>
  <CardHeader>
    <CardTitle>{$t.common.editReception} — {r.supplier} #{r.lot_code}</CardTitle>
    <CardDescription>{$t.newReception.formDescription}</CardDescription>
  </CardHeader>
  <CardContent>
    <form method="POST" class="grid gap-5 md:grid-cols-2">
      <ReceptionFormFields
        {materials}
        {form}
        {defaults}
      />
      <div class="flex justify-end gap-3 md:col-span-2">
        <Button href="/receptions" variant="outline">{$t.newReception.buttons.cancel}</Button>
        <Button type="submit" disabled={data.materials.length === 0}>{$t.common.update}</Button>
      </div>
    </form>
  </CardContent>
</Card>
