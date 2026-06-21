# Raw Material Tracker

Small SvelteKit 2 / Svelte 5 prototype for registering raw-material receptions in an industrial kitchen.

## Development Workflow

This application uses **Supabase** for authentication and database management. 

### Local Development
For local development, use the [Supabase CLI](https://supabase.com/docs/guides/cli) to run a local Supabase stack. This provides a local PostgreSQL instance, Auth, and Storage that matches your production environment.

- **Database:** Managed via Supabase migrations (see `supabase/migrations`).
- **Auth:** Local Supabase Auth handles user sessions.
- **Environment Variables:** Required for both local and production environments (see `.env.example`).

### Production
In production, the app connects to a hosted Supabase project using environment variables configured in your deployment platform (e.g., Vercel).

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
