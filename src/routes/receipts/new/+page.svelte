<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Alert } from '$lib/components/ui/alert';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select } from '$lib/components/ui/select';
  import { Textarea } from '$lib/components/ui/textarea';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  type Material = PageProps['data']['materials'][number];

  function materialLabel(material: Material) {
    return `${material.name} · ${material.category} · ${material.default_unit}`;
  }

  let selectedMaterialId = $derived(String(form?.fields?.material_id ?? ''));
  let selectedMaterial = $derived(data.materials.find((material) => material.id === selectedMaterialId));
  let materialSearch = $derived(selectedMaterial ? materialLabel(selectedMaterial) : '');
  let selectedUnit = $derived(String(form?.fields?.unit ?? selectedMaterial?.default_unit ?? 'kg'));
  let materialSearchFocused = $state(false);

  let filteredMaterials = $derived.by(() => {
    const query = materialSearch.trim().toLowerCase();
    const matches = query
      ? data.materials.filter((material) => materialLabel(material).toLowerCase().includes(query))
      : data.materials;

    return matches.slice(0, 20);
  });

  let showMaterialResults = $derived(materialSearchFocused && filteredMaterials.length > 0);

  function selectMaterial(material: Material) {
    selectedMaterialId = material.id;
    materialSearch = materialLabel(material);
    selectedUnit = material.default_unit;
    materialSearchFocused = false;
  }

  function handleMaterialInput(event: Event) {
    materialSearch = (event.currentTarget as HTMLInputElement).value;
    selectedMaterialId = '';
    materialSearchFocused = true;
  }
</script>

<div class="mb-8">
  <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.newReceiption.subtitle}</p>
  <h1 class="mt-2 text-3xl font-bold tracking-tight">{$t.newReceiption.title}</h1>
</div>

<div class="mb-6 grid gap-3">
  {#if data.loadError}<Alert variant="destructive">{data.loadError}</Alert>{/if}
  {#if form?.message}<Alert variant="destructive">{form.message}</Alert>{/if}
  {#if data.materials.length === 0}<Alert variant="warning">{$t.newReceiption.messages.noMaterials}</Alert>{/if}
</div>

<Card>
  <CardHeader>
    <CardTitle>{$t.newReceiption.formTitle}</CardTitle>
    <CardDescription>{$t.newReceiption.formDescription}</CardDescription>
  </CardHeader>
  <CardContent>
    <form method="POST" class="grid gap-5 md:grid-cols-2">
      <div class="grid gap-2">
        <Label for="received_on">{$t.newReceiption.fields.receivedOn}</Label>
        <Input id="received_on" type="date" name="received_on" required value={form?.fields?.received_on ?? data.today} />
      </div>

      <div class="relative grid gap-2">
        <Label for="material_search">{$t.newReceiption.fields.material}</Label>
        <input type="hidden" name="material_id" value={selectedMaterialId} />
        <Input
          id="material_search"
          required
          value={materialSearch}
          placeholder={$t.newReceiption.fields.materialPlaceholder}
          autocomplete="off"
          oninput={handleMaterialInput}
          onfocus={() => (materialSearchFocused = true)}
          onblur={() => {
            setTimeout(() => {
              materialSearchFocused = false;
            }, 120);
          }}
        />
        {#if showMaterialResults}
          <div class="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border bg-background shadow-lg">
            {#each filteredMaterials as material (material.id)}
              <button
                type="button"
                class="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                onmousedown={(event) => event.preventDefault()}
                onclick={() => selectMaterial(material)}
              >
                <span class="font-medium">{material.name}</span>
                <span class="text-xs text-muted-foreground">{material.category} · {material.default_unit}</span>
              </button>
            {/each}
          </div>
        {:else if materialSearchFocused && materialSearch.trim() && filteredMaterials.length === 0}
          <div class="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground shadow-lg">
            {$t.newReceiption.messages.noMaterialsFound}
          </div>
        {/if}
        {#if materialSearch.trim() && !selectedMaterialId}
          <p class="text-xs text-muted-foreground">{$t.newReceiption.messages.selectMaterial}</p>
        {/if}
      </div>

      <div class="grid gap-2">
        <Label for="supplier">{$t.newReceiption.fields.supplier}</Label>
        <Input id="supplier" name="supplier" required value={form?.fields?.supplier ?? ''} />
      </div>

      <div class="grid gap-2">
        <Label for="lot_code">{$t.newReceiption.fields.lotCode}</Label>
        <Input id="lot_code" name="lot_code" required value={form?.fields?.lot_code ?? ''} />
      </div>

      <div class="grid gap-2">
        <Label for="manufacture_date">{$t.newReceiption.fields.manufactureDate}</Label>
        <Input id="manufacture_date" type="date" name="manufacture_date" value={form?.fields?.manufacture_date ?? ''} />
      </div>

      <div class="grid gap-2">
        <Label for="expiry_date">{$t.newReceiption.fields.expiryDate}</Label>
        <Input id="expiry_date" type="date" name="expiry_date" value={form?.fields?.expiry_date ?? ''} />
      </div>

      <div class="grid gap-2">
        <Label for="quantity">{$t.newReceiption.fields.quantity}</Label>
        <Input id="quantity" type="number" name="quantity" min="0.001" step="0.001" required value={form?.fields?.quantity ?? ''} />
      </div>

      <div class="grid gap-2">
        <Label for="unit">{$t.newReceiption.fields.unit}</Label>
        <Select id="unit" name="unit" bind:value={selectedUnit}>
          <option value="kg">{$t.newReceiption.units.kg}</option>
          <option value="g">{$t.newReceiption.units.g}</option>
          <option value="l">{$t.newReceiption.units.l}</option>
          <option value="unit">{$t.newReceiption.units.unit}</option>
          <option value="box">{$t.newReceiption.units.box}</option>
        </Select>
      </div>

      <div class="grid gap-2">
        <Label for="temperature_c">{$t.newReceiption.fields.temperatureC}</Label>
        <Input id="temperature_c" type="number" name="temperature_c" step="0.1" value={form?.fields?.temperature_c ?? ''} />
      </div>

      <div class="grid gap-2">
        <Label for="status">{$t.newReceiption.fields.status}</Label>
        <Select id="status" name="status" required value={form?.fields?.status ?? 'accepted'}>
          <option value="accepted">{$t.newReceiption.statusOptions.accepted}</option>
          <option value="conditional">{$t.newReceiption.statusOptions.conditional}</option>
          <option value="rejected">{$t.newReceiption.statusOptions.rejected}</option>
        </Select>
      </div>

      <div class="grid gap-2 md:col-span-2">
        <Label for="observations">{$t.newReceiption.fields.observations}</Label>
        <Textarea id="observations" name="observations" rows={4} placeholder={$t.newReceiption.fields.observationsPlaceholder} value={String(form?.fields?.observations ?? '')} />
      </div>

      <div class="flex justify-end gap-3 md:col-span-2">
        <Button href="/receipts" variant="outline">{$t.newReceiption.buttons.cancel}</Button>
        <Button type="submit" disabled={data.materials.length === 0 || !selectedMaterialId}>{$t.newReceiption.buttons.save}</Button>
      </div>
    </form>
  </CardContent>
</Card>
