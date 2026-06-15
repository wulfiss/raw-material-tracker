<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select } from '$lib/components/ui/select';
  import { Alert } from '$lib/components/ui/alert';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';

  let { form }: PageProps = $props();
</script>

<div class="mb-8">
  <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.newMaterial.subtitle}</p>
  <h1 class="mt-2 text-3xl font-bold tracking-tight">{$t.newMaterial.title}</h1>
</div>

{#if form?.message}
  <Alert variant="destructive" class="mb-6">{form.message}</Alert>
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
        <Input id="name" name="name" required value={form?.fields?.name ?? ''} placeholder={$t.newMaterial.fields.namePlaceholder} />
      </div>
      <div class="grid gap-2">
        <Label for="category">{$t.newMaterial.fields.category}</Label>
        <Input id="category" name="category" required value={form?.fields?.category ?? ''} placeholder={$t.newMaterial.fields.categoryPlaceholder} />
      </div>
      <div class="grid gap-2">
        <Label for="default_unit">{$t.newMaterial.fields.defaultUnit}</Label>
        <Select id="default_unit" name="default_unit" required value={form?.fields?.default_unit ?? 'kg'}>
          <option value="kg">{$t.newMaterial.units.kg}</option>
          <option value="g">{$t.newMaterial.units.g}</option>
          <option value="l">{$t.newMaterial.units.l}</option>
          <option value="unit">{$t.newMaterial.units.unit}</option>
          <option value="box">{$t.newMaterial.units.box}</option>
        </Select>
      </div>
      <div class="flex justify-end gap-3 md:col-span-2">
        <Button href="/materials" variant="outline">{$t.newMaterial.buttons.cancel}</Button>
        <Button type="submit">{$t.newMaterial.buttons.save}</Button>
      </div>
    </form>
  </CardContent>
</Card>
