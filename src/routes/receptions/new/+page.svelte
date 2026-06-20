<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Alert } from '$lib/components/ui/alert';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import ReceptionFormFields from '$lib/components/receptions/ReceptionFormFields.svelte';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  let materials = $derived(data.materials);
</script>

<div class="mb-8">
  <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.newReception.subtitle}</p>
  <h1 class="mt-2 text-3xl font-bold tracking-tight">{$t.newReception.title}</h1>
</div>

<div class="mb-6 grid gap-3">
  {#if data.loadError}<Alert variant="destructive">{data.loadError}</Alert>{/if}
  {#if form?.message}<Alert variant="destructive">{form.message}</Alert>{/if}
  {#if data.materials.length === 0}<Alert variant="warning">{$t.newReception.messages.noMaterials}</Alert>{/if}
</div>

<Card>
  <CardHeader>
    <CardTitle>{$t.newReception.formTitle}</CardTitle>
    <CardDescription>{$t.newReception.formDescription}</CardDescription>
  </CardHeader>
  <CardContent>
    <form method="POST" class="grid gap-5 md:grid-cols-2">
      <ReceptionFormFields
        {materials}
        {form}
        defaults={{ received_on: data.today, status: 'accepted', unit: 'kg' }}
      />
      <div class="flex justify-end gap-3 md:col-span-2">
        <Button href="/receptions" variant="outline">{$t.newReception.buttons.cancel}</Button>
        <Button type="submit" disabled={data.materials.length === 0}>{$t.newReception.buttons.save}</Button>
      </div>
    </form>
  </CardContent>
</Card>
