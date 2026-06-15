<script lang="ts">
  import { ArrowRight, ClipboardList, Database, SearchCheck } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { t } from '$lib/i18n';
</script>

<section class="grid gap-8 py-8 md:grid-cols-[1.25fr_0.75fr] md:items-center">
  <div class="space-y-6">
    <div class="space-y-3">
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.home.subtitle}</p>
      <h1 class="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        {$t.home.title}
      </h1>
      <p class="max-w-2xl text-lg text-muted-foreground">
        {$t.home.description}
      </p>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row">
      <Button href="/receipts/new" size="lg">{$t.home.registerReception} <ArrowRight class="size-4" /></Button>
      <Button href="/receipts" variant="outline" size="lg">{$t.home.viewRecords}</Button>
    </div>
  </div>

  <Card class="bg-card/80">
    <CardHeader>
      <CardTitle>{$t.home.workflowTitle}</CardTitle>
    </CardHeader>
    <CardContent class="grid gap-4">
      <div class="flex gap-3 rounded-lg border bg-background p-4">
        <Database class="mt-0.5 size-5 text-primary" />
        <div><p class="font-medium">{$t.home.workflow[0].title}</p><p class="text-sm text-muted-foreground">{$t.home.workflow[0].description}</p></div>
      </div>
      <div class="flex gap-3 rounded-lg border bg-background p-4">
        <ClipboardList class="mt-0.5 size-5 text-primary" />
        <div><p class="font-medium">{$t.home.workflow[1].title}</p><p class="text-sm text-muted-foreground">{$t.home.workflow[1].description}</p></div>
      </div>
      <div class="flex gap-3 rounded-lg border bg-background p-4">
        <SearchCheck class="mt-0.5 size-5 text-primary" />
        <div><p class="font-medium">{$t.home.workflow[2].title}</p><p class="text-sm text-muted-foreground">{$t.home.workflow[2].description}</p></div>
      </div>
    </CardContent>
  </Card>
</section>
