<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Alert } from '$lib/components/ui/alert';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select } from '$lib/components/ui/select';
  import { Textarea } from '$lib/components/ui/textarea';
  import { t } from '$lib/i18n';
  import { translateStatus } from '$lib/i18n/helpers';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  type Material = PageProps['data']['materials'][number];

  function materialLabel(material: Material) {
    return `${material.name} · ${material.category} · ${material.unit}`;
  }

  let selectedMaterialId = $derived(String(form?.fields?.material_id ?? ''));
  let selectedMaterial = $derived(data.materials.find((m) => m.id === selectedMaterialId));
  let materialSearch = $derived(selectedMaterial ? materialLabel(selectedMaterial) : '');
  let selectedUnit = $derived(String(form?.fields?.unit ?? selectedMaterial?.unit ?? 'kg'));
  let materialSearchFocused = $state(false);
  let quickObsText = $state<string | null>(null);
  let observationsText = $derived(quickObsText ?? form?.fields?.observations ?? '');

  let filteredMaterials = $derived.by(() => {
    const query = materialSearch.trim().toLowerCase();
    const matches = query
      ? data.materials.filter((m) => materialLabel(m).toLowerCase().includes(query))
      : data.materials;
    return matches.slice(0, 20);
  });

  let showMaterialResults = $derived(materialSearchFocused && filteredMaterials.length > 0);

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

  function statusVariant(status: string) {
    if (status === 'accepted') return 'success';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
  }
</script>

<div class="mx-auto max-w-lg px-4 pb-32 pt-6">
  <div class="mb-6">
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.newReception.subtitle}</p>
    <h1 class="mt-1 text-2xl font-bold tracking-tight">{$t.newReception.title}</h1>
  </div>

  {#if data.loadError}
    <Alert variant="destructive" class="mb-4">{data.loadError}</Alert>
  {/if}
  {#if form?.message}
    <Alert variant="destructive" class="mb-4">{form.message}</Alert>
  {/if}
  {#if data.materials.length === 0}
    <Alert variant="warning" class="mb-4">{$t.newReception.messages.noMaterials}</Alert>
  {/if}

  {#if data.recentReceipts.length > 0}
    <section class="mb-6">
      <h2 class="mb-2 text-sm font-semibold text-muted-foreground">{$t.mobileReception.recentReceipts}</h2>
      <div class="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {#each data.recentReceipts as r (r.id)}
          <Card class="w-56 shrink-0 snap-start">
            <CardContent class="p-3">
              <p class="truncate text-sm font-medium">{r.material?.name ?? '—'}</p>
              <p class="text-xs text-muted-foreground">{r.received_on}</p>
              <div class="mt-1.5 flex items-center gap-2">
                <span class="truncate text-xs text-muted-foreground">{r.supplier}</span>
                <Badge variant={statusVariant(r.status)} class="text-[10px]">{translateStatus(r.status)}</Badge>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    </section>
  {/if}

  <form method="POST" class="space-y-4">
    <div class="grid gap-2">
      <Label for="received_on">{$t.newReception.fields.receivedOn}</Label>
      <Input id="received_on" type="date" name="received_on" required value={form?.fields?.received_on ?? data.today} />
    </div>

    <div class="relative grid gap-2">
      <Label for="material_search">{$t.newReception.fields.material}</Label>
      <input type="hidden" name="material_id" value={selectedMaterialId} />
      <Input
        id="material_search"
        required
        value={materialSearch}
        placeholder={$t.newReception.fields.materialPlaceholder}
        autocomplete="off"
        oninput={handleMaterialInput}
        onfocus={() => (materialSearchFocused = true)}
        onblur={() => { setTimeout(() => { materialSearchFocused = false; }, 120); }}
      />
      {#if showMaterialResults}
        <div class="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border bg-background shadow-lg">
          {#each filteredMaterials as m (m.id)}
            <button
              type="button"
              class="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
              onmousedown={(event) => event.preventDefault()}
              onclick={() => selectMaterial(m)}
            >
              <span class="font-medium">{m.name}</span>
              <span class="text-xs text-muted-foreground">{m.category} · {m.unit}</span>
            </button>
          {/each}
        </div>
      {:else if materialSearchFocused && materialSearch.trim() && filteredMaterials.length === 0}
        <div class="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground shadow-lg">
          {$t.newReception.messages.noMaterialsFound}
        </div>
      {/if}
      {#if materialSearch.trim() && !selectedMaterialId}
        <p class="text-xs text-muted-foreground">{$t.newReception.messages.selectMaterial}</p>
      {/if}
    </div>

    <div class="grid gap-2">
      <Label for="supplier">{$t.newReception.fields.supplier}</Label>
      <Input id="supplier" name="supplier" required value={form?.fields?.supplier ?? ''} />
    </div>

    <div class="grid gap-2">
      <Label for="lot_code">{$t.newReception.fields.lotCode}</Label>
      <Input id="lot_code" name="lot_code" required value={form?.fields?.lot_code ?? ''} />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="grid gap-2">
        <Label for="manufacture_date">{$t.newReception.fields.manufactureDate}</Label>
        <Input id="manufacture_date" type="date" name="manufacture_date" value={form?.fields?.manufacture_date ?? ''} />
      </div>
      <div class="grid gap-2">
        <Label for="expiry_date">
          {$t.newReception.fields.expiryDate}
          {#if selectedMaterial?.expirationRequired}<span class="text-destructive">*</span>{/if}
        </Label>
        <Input id="expiry_date" type="date" name="expiry_date" value={form?.fields?.expiry_date ?? ''} required={selectedMaterial?.expirationRequired} />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="grid gap-2">
        <Label for="quantity">{$t.newReception.fields.quantity}</Label>
        <Input id="quantity" type="number" name="quantity" min="0.001" step="0.001" required value={form?.fields?.quantity ?? ''} />
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

    <div class="grid gap-2">
      <Label for="temperature_c">{$t.newReception.fields.temperatureC}</Label>
      <Input id="temperature_c" type="number" name="temperature_c" step="0.1" value={form?.fields?.temperature_c ?? ''} />
    </div>

    <div class="grid gap-2">
      <Label for="status">{$t.newReception.fields.status}</Label>
      <Select id="status" name="status" required value={form?.fields?.status ?? 'accepted'}>
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
        rows={3}
        placeholder={$t.newReception.fields.observationsPlaceholder}
        value={observationsText}
        oninput={(e) => { quickObsText = (e.target as HTMLTextAreaElement).value; }}
      />
    </div>

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

    <div class="sticky bottom-0 -mx-4 mt-8 border-t bg-background px-4 py-3">
      <div class="flex gap-3">
        <Button href="/receipts" variant="outline" class="flex-1">{$t.newReception.buttons.cancel}</Button>
        <Button type="submit" class="flex-1" disabled={data.materials.length === 0 || !selectedMaterialId}>{$t.newReception.buttons.save}</Button>
      </div>
    </div>
  </form>
</div>
