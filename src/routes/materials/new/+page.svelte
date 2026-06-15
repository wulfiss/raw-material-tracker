<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select } from '$lib/components/ui/select';
  import { Alert } from '$lib/components/ui/alert';
  import type { PageProps } from './$types';

  let { form }: PageProps = $props();
</script>

<div class="mb-8">
  <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Catalogue</p>
  <h1 class="mt-2 text-3xl font-bold tracking-tight">New material</h1>
</div>

{#if form?.message}
  <Alert variant="destructive" class="mb-6">{form.message}</Alert>
{/if}

<Card>
  <CardHeader>
    <CardTitle>Material data</CardTitle>
    <CardDescription>Use a simple catalogue first. Add categories and units consistently.</CardDescription>
  </CardHeader>
  <CardContent>
    <form method="POST" class="grid gap-5 md:grid-cols-2">
      <div class="grid gap-2 md:col-span-2">
        <Label for="name">Material name</Label>
        <Input id="name" name="name" required value={form?.fields?.name ?? ''} placeholder="e.g. Chicken breast" />
      </div>
      <div class="grid gap-2">
        <Label for="category">Category</Label>
        <Input id="category" name="category" required value={form?.fields?.category ?? ''} placeholder="Meat, vegetables..." />
      </div>
      <div class="grid gap-2">
        <Label for="default_unit">Default unit</Label>
        <Select id="default_unit" name="default_unit" required value={form?.fields?.default_unit ?? 'kg'}>
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="l">L</option>
          <option value="unit">unit</option>
          <option value="box">box</option>
        </Select>
      </div>
      <div class="flex justify-end gap-3 md:col-span-2">
        <Button href="/materials" variant="outline">Cancel</Button>
        <Button type="submit">Save material</Button>
      </div>
    </form>
  </CardContent>
</Card>
