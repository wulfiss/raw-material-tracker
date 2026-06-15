# Raw Material Tracker

Small SvelteKit 2 / Svelte 5 prototype for registering raw-material receptions in an industrial kitchen.

## Current mode

This version uses a **local in-memory mock** for auth and database data:

- no Supabase project is required
- no environment variables are required
- one mock user is loaded from `src/lib/server/mock-auth.ts`
- mock data is stored in module memory in `src/lib/server/mock-db.ts`
- records reset when the dev server/build runtime restarts

This keeps the app easy to test before connecting a real database.

## Features

- Material catalogue
- New material form
- Reception form with lot, supplier, dates, quantity, temperature and decision
- Searchable reception table
- Server-side validation through SvelteKit actions
- shadcn-svelte-style local UI components
- Tailwind CSS 4
- Vercel adapter configured

## Run locally

```bash
npm install
npm run dev
```

## Validate

```bash
npm run check
npm run build
```

## Important files

```text
src/lib/server/mock-auth.ts      # mock user/session replacement
src/lib/server/mock-db.ts        # in-memory data store and validation helpers
src/routes/materials             # material catalogue and form
src/routes/receipts              # reception list and form
src/lib/components/ui            # local shadcn-style UI components
supabase/schema.sql              # future Supabase schema reference only
```

## Next production step

Replace the mock modules with Supabase Auth plus database access, then add RLS policies, `created_by`, `updated_at`, and role-based permissions.
