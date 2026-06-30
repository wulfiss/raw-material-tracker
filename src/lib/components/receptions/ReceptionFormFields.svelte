<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select } from '$lib/components/ui/select';
  import { Textarea } from '$lib/components/ui/textarea';
  import { t } from '$lib/i18n';

  type Material = {
    id: string;
    name: string;
    category: string;
    unit: string;
    expirationRequired: boolean;
  };

  let {
    materials,
    form,
    mode = 'desktop' as 'desktop' | 'mobile',
    defaults = {} as Partial<Record<string, string>>
  }: {
    materials: Material[];
    form: { fields?: Record<string, string> } | null;
    mode?: 'desktop' | 'mobile';
    defaults?: Partial<Record<string, string>>;
  } = $props();

  let selectedMaterialId = $state('');
  let selectedUnit = $state('kg');
  let materialSearch = $state('');
  let materialSearchFocused = $state(false);
  let quickObsText = $state<string | null>(null);

  let initialLabel = $derived.by(() => {
    const id = form?.fields?.material_id ?? defaults.material_id ?? '';
    if (!id) return '';
    const m = materials.find((m2) => m2.id === id);
    return m ? materialLabel(m) : '';
  });

  $effect(() => {
    const id = form?.fields?.material_id ?? defaults.material_id ?? '';
    selectedMaterialId = id;
    const m = materials.find((m2) => m2.id === id);
    if (m) {
      selectedUnit = String(form?.fields?.unit ?? m.unit ?? 'kg');
    }
  });

  let materialSearchValue = $derived(materialSearch || initialLabel);

  let selectedMaterial = $derived(materials.find((m) => m.id === selectedMaterialId));

  let filteredMaterials = $derived.by(() => {
    const query = materialSearch.trim().toLowerCase();
    const matches = query
      ? materials.filter((m) => materialLabel(m).toLowerCase().includes(query))
      : materials;
    return matches.slice(0, 20);
  });

  let showMaterialResults = $derived(materialSearchFocused && filteredMaterials.length > 0);

  let observationsValue = $derived(quickObsText ?? form?.fields?.observations ?? defaults.observations ?? '');

  function materialLabel(material: Material) {
    return `${material.name} · ${material.category} · ${material.unit}`;
  }

  function selectMaterial(material: Material) {
    selectedMaterialId = material.id;
    materialSearch = materialLabel(material);
    selectedUnit = String(material.unit ?? 'kg');
    materialSearchFocused = false;
  }

  function handleMaterialInput(event: Event) {
    materialSearch = (event.currentTarget as HTMLInputElement).value;
    selectedMaterialId = '';
    materialSearchFocused = true;
  }

  function setQuickObservation(text: string) {
    quickObsText = text;
  }

  function fld(key: string): string {
    return form?.fields?.[key] ?? defaults[key] ?? '';
  }
</script>

<div class="grid gap-2">
  <Label for="received_on">{$t.newReception.fields.receivedOn}</Label>
  <Input id="received_on" type="date" name="received_on" required value={fld('received_on') || defaults.received_on || ''} />
</div>

<div class="relative grid gap-2">
  <Label for="material_search">{$t.newReception.fields.material}</Label>
  <input type="hidden" name="material_id" value={selectedMaterialId} />
  <Input
    id="material_search"
    required
    value={materialSearchValue}
    placeholder={$t.newReception.fields.materialPlaceholder}
    autocomplete="off"
    oninput={handleMaterialInput}
    onfocus={() => (materialSearchFocused = true)}
    onblur={() => { setTimeout(() => { materialSearchFocused = false; }, 120); }}
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
          <span class="text-xs text-muted-foreground">{material.category} · {material.unit}</span>
        </button>
      {/each}
    </div>
  {:else if materialSearchFocused && materialSearch.trim() && filteredMaterials.length === 0}
    <div class="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground shadow-lg">
      {$t.newReception.messages.noMaterialsFound}
    </div>
  {/if}
  {#if materialSearchValue.trim() && !selectedMaterialId}
    <p class="text-xs text-muted-foreground">{$t.newReception.messages.selectMaterial}</p>
  {/if}
</div>

<div class="grid gap-2">
  <Label for="supplier">{$t.newReception.fields.supplier}</Label>
  <Input id="supplier" name="supplier" required value={fld('supplier')} />
</div>

<div class="grid gap-2">
  <Label for="lot_code">{$t.newReception.fields.lotCode}</Label>
  <Input id="lot_code" name="lot_code" value={fld('lot_code')} />
</div>

{#if mode === 'mobile'}
  <div class="grid grid-cols-2 gap-3">
    <div class="grid gap-2">
      <Label for="manufacture_date">{$t.newReception.fields.manufactureDate}</Label>
      <Input id="manufacture_date" type="date" name="manufacture_date" value={fld('manufacture_date')} />
    </div>
    <div class="grid gap-2">
      <Label for="expiry_date">
        {$t.newReception.fields.expiryDate}
        {#if selectedMaterial?.expirationRequired}<span class="text-destructive">*</span>{/if}
      </Label>
      <Input id="expiry_date" type="date" name="expiry_date" value={fld('expiry_date')} required={selectedMaterial?.expirationRequired} />
    </div>
  </div>
  <div class="grid grid-cols-2 gap-3">
    <div class="grid gap-2">
      <Label for="quantity">{$t.newReception.fields.quantity}</Label>
      <Input id="quantity" type="number" name="quantity" min="0.001" step="0.001" required value={fld('quantity')} />
    </div>
    <div class="grid gap-2">
      <Label for="unit">{$t.newReception.fields.unit}</Label>
      <Select id="unit" name="unit" bind:value={selectedUnit}>
        <option value="kg">{$t.newReception.units.kg}</option>
        <option value="g">{$t.newReception.units.g}</option>
        <option value="liter">{$t.newReception.units.liter}</option>
        <option value="unit">{$t.newReception.units.unit}</option>
        <option value="box">{$t.newReception.units.box}</option>
      </Select>
    </div>
  </div>
{:else}
  <div class="grid gap-2">
    <Label for="manufacture_date">{$t.newReception.fields.manufactureDate}</Label>
    <Input id="manufacture_date" type="date" name="manufacture_date" value={fld('manufacture_date')} />
  </div>
  <div class="grid gap-2">
    <Label for="expiry_date">
      {$t.newReception.fields.expiryDate}
      {#if selectedMaterial?.expirationRequired}<span class="text-destructive">*</span>{/if}
    </Label>
    <Input id="expiry_date" type="date" name="expiry_date" value={fld('expiry_date')} required={selectedMaterial?.expirationRequired} />
  </div>
  <div class="grid gap-2">
    <Label for="quantity">{$t.newReception.fields.quantity}</Label>
    <Input id="quantity" type="number" name="quantity" min="0.001" step="0.001" required value={fld('quantity')} />
  </div>
  <div class="grid gap-2">
    <Label for="unit">{$t.newReception.fields.unit}</Label>
    <Select id="unit" name="unit" bind:value={selectedUnit}>
      <option value="kg">{$t.newReception.units.kg}</option>
      <option value="g">{$t.newReception.units.g}</option>
      <option value="liter">{$t.newReception.units.liter}</option>
      <option value="unit">{$t.newReception.units.unit}</option>
      <option value="box">{$t.newReception.units.box}</option>
    </Select>
  </div>
{/if}

<div class="grid gap-2">
  <Label for="temperature_c">{$t.newReception.fields.temperatureC}</Label>
  <Input id="temperature_c" type="number" name="temperature_c" step="0.1" value={fld('temperature_c')} />
</div>

<div class="grid gap-2">
  <Label for="status">{$t.newReception.fields.status}</Label>
  <Select id="status" name="status" required value={fld('status') || 'accepted'}>
    <option value="accepted">{$t.newReception.statusOptions.accepted}</option>
    <option value="conditional">{$t.newReception.statusOptions.conditional}</option>
    <option value="rejected">{$t.newReception.statusOptions.rejected}</option>
  </Select>
</div>

<div class="grid gap-2">
  <Label for="observations">{$t.newReception.fields.observations}</Label>
  <Textarea
    id="observations"
    name="observations"
    rows={mode === 'mobile' ? 3 : 4}
    placeholder={$t.newReception.fields.observationsPlaceholder}
    value={observationsValue}
    oninput={(e) => { quickObsText = (e.target as HTMLTextAreaElement).value; }}
  />
</div>

{#if mode === 'mobile'}
  <div class="grid gap-1.5">
    <p class="text-xs font-medium text-muted-foreground">{$t.mobileReception.quickObservations}</p>
    <div class="flex flex-wrap gap-1.5">
      <button type="button" class="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted" onclick={() => setQuickObservation('')}>{$t.mobileReception.obsNone}</button>
      <button type="button" class="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted" onclick={() => setQuickObservation($t.mobileReception.obsPackaging)}>{$t.mobileReception.obsPackaging}</button>
      <button type="button" class="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted" onclick={() => setQuickObservation($t.mobileReception.obsTemperature)}>{$t.mobileReception.obsTemperature}</button>
      <button type="button" class="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted" onclick={() => setQuickObservation($t.mobileReception.obsLabel)}>{$t.mobileReception.obsLabel}</button>
      <button type="button" class="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted" onclick={() => setQuickObservation($t.mobileReception.obsMissingDoc)}>{$t.mobileReception.obsMissingDoc}</button>
    </div>
  </div>
{/if}
