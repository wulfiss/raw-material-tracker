<!-- .opencode/AGENTS.md -->
# Project context

Stack: SvelteKit 2, Svelte 5, Supabase JS v2, TypeScript strict.

## Rules
- Svelte 5 runes only: $state(), $derived(), $effect(), $props()
- onclick not on:click
- Always call svelte-autofixer after editing any .svelte file
- Read files before editing — never overwrite blindly
- Write minimal diffs, not full rewrites
- Supabase: use typed client from $lib/supabase, RLS is enabled
- Migrations go in supabase/migrations/

## Type checking commands
- `npx tsc --noEmit` — full TypeScript check
- `npx svelte-check` — Svelte + TypeScript check combined
- Run these after any significant change to catch errors LSP may miss