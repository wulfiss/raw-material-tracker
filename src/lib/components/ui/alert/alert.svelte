<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  type Variant = 'default' | 'destructive' | 'warning';
  let { children, class: className, variant = 'default', ...rest }: HTMLAttributes<HTMLDivElement> & { children?: Snippet; variant?: Variant } = $props();

  const variants: Record<Variant, string> = {
    default: 'bg-background text-foreground',
    destructive: 'border-destructive/50 text-destructive',
    warning: 'border-amber-300 bg-amber-50 text-amber-950'
  };
</script>

<div class={cn('relative w-full rounded-lg border p-4 text-sm', variants[variant], className)} {...rest}>
  {@render children?.()}
</div>
