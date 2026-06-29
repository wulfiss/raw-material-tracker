<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select } from '$lib/components/ui/select';
  import { Alert } from '$lib/components/ui/alert';
  import { PackagePlus, Database, ThermometerSnowflake, ShieldCheck } from '@lucide/svelte';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';

  let { form }: PageProps = $props();
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.newMaterial.subtitle}</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight">{$t.newMaterial.title}</h1>
  </div>

  {#if form?.message}
    <Alert variant="destructive">{form.message}</Alert>
  {/if}

  <!-- Form Card -->
  <Card class="max-w-3xl">
    <CardHeader>
      <div class="flex items-center gap-3">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PackagePlus class="size-5" />
        </div>
        <div>
          <CardTitle>{$t.newMaterial.formTitle}</CardTitle>
          <CardDescription>{$t.newMaterial.formDescription}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <form method="POST" class="space-y-6">
        <!-- Basic Info -->
        <div class="space-y-4 rounded-lg border p-5">
          <h3 class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Database class="size-4" />
            Información básica
          </h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="grid gap-2 md:col-span-2">
              <Label for="name">{$t.newMaterial.fields.name}</Label>
              <Input id="name" name="name" required value={form?.fields?.name ?? ''} placeholder={$t.newMaterial.fields.namePlaceholder} />
            </div>
            <div class="grid gap-2">
              <Label for="category">{$t.newMaterial.fields.category}</Label>
              <Input id="category" name="category" required value={form?.fields?.category ?? ''} placeholder={$t.newMaterial.fields.categoryPlaceholder} />
            </div>
            <div class="grid gap-2">
              <Label for="unit">{$t.newMaterial.fields.defaultUnit}</Label>
              <Select id="unit" name="unit" required value={form?.fields?.unit ?? 'kg'}>
                <option value="kg">{$t.newMaterial.units.kg}</option>
                <option value="g">{$t.newMaterial.units.g}</option>
                <option value="liter">{$t.newMaterial.units.liter}</option>
                <option value="unit">{$t.newMaterial.units.unit}</option>
                <option value="box">{$t.newMaterial.units.box}</option>
              </Select>
            </div>
          </div>
        </div>

        <!-- Storage & Stock -->
        <div class="space-y-4 rounded-lg border p-5">
          <h3 class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <ThermometerSnowflake class="size-4" />
            Almacenamiento y stock
          </h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="grid gap-2">
              <Label for="storageCondition">{$t.newMaterial.fields.storageCondition}</Label>
              <Select id="storageCondition" name="storageCondition" required value={form?.fields?.storageCondition ?? 'ambient'}>
                <option value="refrigerated">{$t.newMaterial.storageOptions.refrigerated}</option>
                <option value="frozen">{$t.newMaterial.storageOptions.frozen}</option>
                <option value="dry">{$t.newMaterial.storageOptions.dry}</option>
                <option value="ambient">{$t.newMaterial.storageOptions.ambient}</option>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label for="minStock">{$t.newMaterial.fields.minStock}</Label>
              <Input id="minStock" name="minStock" type="number" min="0" value={form?.fields?.minStock ?? 0} />
            </div>
          </div>
        </div>

        <!-- Options -->
        <div class="space-y-4 rounded-lg border p-5">
          <h3 class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <ShieldCheck class="size-4" />
            Opciones
          </h3>
          <div class="space-y-3">
            <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
              <input type="checkbox" id="expirationRequired" name="expirationRequired" checked={form?.fields?.expirationRequired ?? false} class="h-4 w-4 accent-primary" />
              <div>
                <p class="font-medium text-sm">{$t.newMaterial.fields.expirationRequired}</p>
                <p class="text-xs text-muted-foreground">Si está habilitado, se solicitará la fecha de vencimiento al registrar cada recepción.</p>
              </div>
            </label>
            <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
              <input type="checkbox" id="active" name="active" checked={form?.fields?.active ?? true} class="h-4 w-4 accent-primary" />
              <div>
                <p class="font-medium text-sm">{$t.newMaterial.fields.active}</p>
                <p class="text-xs text-muted-foreground">Los materiales inactivos no aparecen en la lista de selección al registrar recepciones.</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
          <Button href="/materials" variant="outline">{$t.newMaterial.buttons.cancel}</Button>
          <Button type="submit">{$t.newMaterial.buttons.save}</Button>
        </div>
      </form>
    </CardContent>
  </Card>
</div>
