<script lang="ts">
  import { LogIn } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>{$t.nav.appTitle} — {$t.login.title}</title></svelte:head>

<div class="flex min-h-[60vh] items-center justify-center">
  <div class="w-full max-w-sm space-y-6">
    <div class="space-y-2 text-center">
      <h1 class="text-2xl font-bold tracking-tight">{$t.login.title}</h1>
      <p class="text-sm text-muted-foreground">{$t.login.description}</p>
    </div>

    <form method="POST" class="space-y-4">
      {#if form?.message}
        <div class="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {form.message}
        </div>
      {/if}

      <div class="space-y-2">
        <Label for="email">{$t.login.email}</Label>
        <Input id="email" name="email" type="email" placeholder="admin@example.com" value={form?.email ?? ''} required />
      </div>

      <div class="space-y-2">
        <Label for="password">{$t.login.password}</Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" required />
      </div>

      <Button type="submit" class="w-full">
        <LogIn class="mr-2 size-4" />
        {$t.login.signIn}
      </Button>
    </form>
  </div>
</div>
