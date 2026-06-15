<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  type Variant = 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
  let { children, class: className, variant = 'default', ...rest }: HTMLAttributes<HTMLSpanElement> & { children?: Snippet; variant?: Variant } = $props();

  const variants: Record<Variant, string> = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    outline: 'text-foreground',
    destructive: 'border-transparent bg-destructive text-destructive-foreground',
    success: 'border-transparent bg-emerald-600 text-white'
  };
</script>

<span class={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors', variants[variant], className)} {...rest}>
  {@render children?.()}
</span>
