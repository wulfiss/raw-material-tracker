<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  type Variant = 'default' | 'warning' | 'danger' | 'success';

  let {
    title,
    value,
    description,
    variant = 'default',
    href,
    class: className = '',
    children
  }: HTMLAttributes<HTMLDivElement> & {
    title: string;
    value: number | string;
    description?: string;
    variant?: Variant;
    href?: string;
    class?: string;
    children?: Snippet;
  } = $props();

  const base = 'rounded-xl border bg-card p-5 transition-all hover:shadow-sm';
  const variants: Record<Variant, string> = {
    default: '',
    warning: 'ring-1 ring-warning/30',
    danger: 'ring-1 ring-destructive/30',
    success: ''
  };

  const classes = $derived(cn(base, variants[variant], className));
</script>

{#if href}
  <a {href} class={classes}>
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1.5">
        <p class="text-sm font-medium text-muted-foreground">{title}</p>
        <p class="text-2xl font-bold tracking-tight">{value}</p>
        {#if description}
          <p class="text-xs text-muted-foreground">{description}</p>
        {/if}
      </div>
      {@render children?.()}
    </div>
  </a>
{:else}
  <div class={classes}>
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1.5">
        <p class="text-sm font-medium text-muted-foreground">{title}</p>
        <p class="text-2xl font-bold tracking-tight">{value}</p>
        {#if description}
          <p class="text-xs text-muted-foreground">{description}</p>
        {/if}
      </div>
      {@render children?.()}
    </div>
  </div>
{/if}
