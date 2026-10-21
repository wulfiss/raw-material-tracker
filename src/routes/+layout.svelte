<script lang="ts">
  import '../styles.css';
  import { Button } from '$lib/components/ui/button';
  import { Package, Menu, X } from '@lucide/svelte';
  import { t } from '$lib/i18n';
  import { page } from '$app/stores';
  import type { LayoutProps } from './$types';
  let { children, data }: LayoutProps = $props();
  let menuOpen = $state(false);
  const canWrite = $derived(data.user?.role === 'admin' || data.user?.role === 'quality');
  function current(path: string) { return $page.url.pathname === path || (path !== '/' && $page.url.pathname.startsWith(path + '/')); }
</script>
<svelte:head><title>{$t.nav.appTitle}</title></svelte:head>
<div class="min-h-screen bg-background">
  <header class="sticky top-0 z-20 border-b bg-card/95 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
      <a class="flex min-w-0 items-center gap-2 text-lg font-bold tracking-tight" href="/"><Package class="size-5 shrink-0 text-primary" /><span>{$t.nav.appTitle}</span></a>
      {#if data.user}
        <nav class="hidden items-center gap-1 lg:flex" aria-label={$t.workspace.navigation}>
          <Button href="/" size="sm" variant={current('/') ? 'secondary' : 'ghost'}>{$t.workspace.dashboard}</Button>
          {#if canWrite}<Button href="/daily-use/new" size="sm" variant={current('/daily-use') ? 'secondary' : 'ghost'}>{$t.workspace.daily}</Button>{/if}
          <Button href="/recipes" size="sm" variant={current('/recipes') ? 'secondary' : 'ghost'}>{$t.workspace.recipes}</Button>
          <form method="POST" action="/logout"><Button type="submit" variant="ghost" size="sm">{$t.nav.logout}</Button></form>
        </nav>
        <button class="flex size-10 shrink-0 items-center justify-center rounded-md hover:bg-accent lg:hidden" type="button"
          aria-label={menuOpen ? $t.workspace.closeMenu : $t.workspace.openMenu} aria-expanded={menuOpen} aria-controls="mobile-navigation" onclick={() => menuOpen = !menuOpen}>
          {#if menuOpen}<X class="size-5" />{:else}<Menu class="size-5" />{/if}
        </button>
      {/if}
    </div>
    {#if data.user && menuOpen}
      <nav id="mobile-navigation" class="space-y-2 border-t bg-card p-4 lg:hidden" aria-label={$t.workspace.navigation}>
        <p class="mb-3 break-words text-sm text-muted-foreground">{data.user.name}</p>
        <Button href="/" class="w-full justify-start" variant={current('/') ? 'secondary' : 'ghost'} onclick={() => menuOpen = false}>{$t.workspace.dashboard}</Button>
        {#if canWrite}<Button href="/daily-use/new" class="w-full justify-start" variant={current('/daily-use') ? 'secondary' : 'ghost'} onclick={() => menuOpen = false}>{$t.workspace.daily}</Button>{/if}
        <Button href="/recipes" class="w-full justify-start" variant={current('/recipes') ? 'secondary' : 'ghost'} onclick={() => menuOpen = false}>{$t.workspace.recipes}</Button>
        <form method="POST" action="/logout"><Button type="submit" variant="ghost" class="w-full justify-start">{$t.nav.logout}</Button></form>
      </nav>
    {/if}
  </header>
  <main class="mx-auto max-w-6xl px-4 py-8">{@render children()}</main>
</div>
