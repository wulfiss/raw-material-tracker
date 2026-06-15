<script lang="ts">
  import { ArrowRight, ClipboardList, Database, SearchCheck } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
</script>

<section class="grid gap-8 py-8 md:grid-cols-[1.25fr_0.75fr] md:items-center">
  <div class="space-y-6">
    <div class="space-y-3">
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Industrial kitchen prototype</p>
      <h1 class="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Raw-material reception and lot tracking
      </h1>
      <p class="max-w-2xl text-lg text-muted-foreground">
        Register suppliers, lots, dates, quantities, temperatures and acceptance decisions in one small SvelteKit MVP.
      </p>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row">
      <Button href="/receipts/new" size="lg">Register reception <ArrowRight class="size-4" /></Button>
      <Button href="/receipts" variant="outline" size="lg">View records</Button>
    </div>
  </div>

  <Card class="bg-card/80">
    <CardHeader>
      <CardTitle>Workflow</CardTitle>
    </CardHeader>
    <CardContent class="grid gap-4">
      <div class="flex gap-3 rounded-lg border bg-background p-4">
        <Database class="mt-0.5 size-5 text-primary" />
        <div><p class="font-medium">Create materials</p><p class="text-sm text-muted-foreground">Define name, category and default unit.</p></div>
      </div>
      <div class="flex gap-3 rounded-lg border bg-background p-4">
        <ClipboardList class="mt-0.5 size-5 text-primary" />
        <div><p class="font-medium">Register each lot</p><p class="text-sm text-muted-foreground">Capture supplier, lot, dates, quantity and temperature.</p></div>
      </div>
      <div class="flex gap-3 rounded-lg border bg-background p-4">
        <SearchCheck class="mt-0.5 size-5 text-primary" />
        <div><p class="font-medium">Search and verify</p><p class="text-sm text-muted-foreground">Review expiry, status and traceability data.</p></div>
      </div>
    </CardContent>
  </Card>
</section>
