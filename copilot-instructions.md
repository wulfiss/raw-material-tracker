---
name: raw-material-tracker
description: Workspace instructions for editing the Raw Material Tracker SvelteKit app.
applyTo:
  - "**/*"
---

- This repo is a SvelteKit 2 + Svelte 5 app using Tailwind CSS 4 and local shadcn-svelte-style UI components.
- Prefer Svelte 5 runes-style syntax in `.svelte` components and avoid legacy Svelte patterns when adding new code.
- Keep UI logic consistent with existing `src/lib/components/ui` components and reuse them when possible.
- Use `+page.server.ts` for server-side actions and validation, and `+page.svelte` for client-side rendering.
- Use `clsx`/`tailwind-merge` and class arrays/objects for utility-driven styling, matching the existing component style.
- Do not introduce a real Supabase backend unless the project is explicitly migrated; `supabase/schema.sql` is currently reference-only.
- Maintain the current local mock setup when editing auth or data flows: `src/lib/server/mock-auth.ts` and `src/lib/server/mock-db.ts`.
- Validate changes with `npm run check` and `npm run build` before committing.
