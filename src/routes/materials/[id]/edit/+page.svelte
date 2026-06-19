<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select } from '$lib/components/ui/select';
  import { Alert } from '$lib/components/ui/alert';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';

  let { form, data }: PageProps = $props();
</script>

<div class="mb-8">
  <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.materials.subtitle}</p>
  <h1 class="mt-2 text-3xl font-bold tracking-tight">{$t.newMaterial.title}</h1>
</div>

{#if data.loadError}
  <Alert variant="destructive" class="mb-6">{data.loadError.message}</Alert>
{/if}

{#if form?.error}
  <Alert variant="destructive" class="mb-6">{form.error}</Alert>
{/if}

<Card>
  <CardHeader>
    <CardTitle>{$t.newMaterial.formTitle}</CardTitle>
    <CardDescription>{$t.newMaterial.formDescription}</CardDescription>
  </CardHeader>
<CardContent>
  <form method="POST" class="grid gap-5 md:grid-cols-2">
    <div class="grid gap-2 md:col-span-2">
      <Label for="name">{$t.newMaterial.fields.name}</Label>
      <Input id="name" name="name" required value={form?.fields?.name ?? data.material.name} placeholder={$t.newMaterial.fields.namePlaceholder} />
    </div>
    <div class="grid gap-2">
      <Label for="category">{$t.newMaterial.fields.category}</Label>
      <Input id="category" name="category" required value={form?.fields?.category ?? data.material.category} />
    </div>
    <div class="grid gap-2">
      <Label for="unit">{$t.newMaterial.fields.defaultUnit}</Label>
      <Select id="unit" name="unit" required value={form?.fields?.unit ?? data.material.unit}>
        <option value="kg">{$t.newMaterial.units.kg}</option>
        <option value="g">{$t.newMaterial.units.g}</option>
        <option value="liter">{$t.newMaterial.units.liter}</option>
        <option value="unit">{$t.newMaterial.units.unit}</option>
        <option value="box">{$t.newMaterial.units.box}</option>
      </Select>
    </div>
    <div class="grid gap-2">
      <Label for="storageCondition">{$t.newMaterial.fields.storageCondition}</Label>
      <Select id="storageCondition" name="storageCondition" required value={form?.fields?.storageCondition ?? data.material.storageCondition}>
        <option value="refrigerated">{$t.newMaterial.storageOptions.refrigerated}</option>
        <option value="frozen">{$t.newMaterial.storageOptions.frozen}</option>
        <option value="dry">{$t.newMaterial.storageOptions.dry}</option>
        <option value="ambient">{$t.newMaterial.storageOptions.ambient}</option>
      </Select>
    </div>
    <div class="grid gap-2">
      <Label for="minStock">Minimum stock</Label>
      <Input id="minStock" name="minStock" type="number" min="0" value={form?.fields?.minStock ?? data.material.minStock ?? 0} />
    </div>
    <div class="grid gap-2 flex flex-row items-center gap-4">
      <div class="flex items-center space-x-2">
        <input type="checkbox" id="expirationRequired" name="expirationRequired" checked={form?.fields?.expirationRequired ?? data.material.expirationRequired} class="h-4 w-4" />
        <Label for="expirationRequired">{$t.newMaterial.fields.expirationRequired}</Label>
      </div>
    </div>
    <div class="grid gap-2 flex flex-row items-center gap-4">
      <div class="flex items-center space-x-2">
        <input type="checkbox" id="active" name="active" checked={form?.fields?.active ?? data.material.active} class="h-4 w-4" />
        <Label for="active">{$t.newMaterial.fields.active}</Label>
      </div>
    </div>
    <div class="flex justify-end gap-3 md:col-span-2">
      <Button href="/materials" variant="outline">{$t.newMaterial.buttons.cancel}</Button>
      <Button type="submit">{$t.newMaterial.buttons.save}</Button>
    </div>
  </form>
</CardContent>
</Card>
