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
supabase start            # Start local Supabase (PostgreSQL, Auth, Studio)
cp .env.example .env      # Copy env vars for local dev (first time only)
npm run dev               # Start dev server at http://localhost:5173
```

### Local Supabase commands

```bash
supabase db reset         # Reset database to migrations + seed data
npm run seed:users        # Create the demo admin/quality/viewer accounts in local Supabase Auth
supabase stop             # Stop local Supabase containers
```

### Authentication & roles

Auth is handled by Supabase Auth (`@supabase/ssr`) — `src/hooks.server.ts` reads the session on every request via `event.locals.supabase`/`event.locals.user`. There's no self-serve signup; accounts are provisioned with the Auth Admin API (see `scripts/seed-users.mjs` for local dev, or call `supabase.auth.admin.createUser()` with `app_metadata: { role }` against your hosted project for production users).

Each user has a `role` of `admin`, `quality`, or `viewer`, stored in `app_metadata` (only settable via the service-role key, so users can't self-promote). `viewer` is read-only; `admin`/`quality` can create/edit/delete materials, receptions, and recipes — enforced both in `src/lib/server/authorize.ts` (`requireRole`) and via RLS policies (`supabase/migrations/003_rls_policies.sql`) as defense-in-depth.

## Validate

```bash
npm run check
npm run build
```

## Important files

```text
src/lib/server/db.ts              # Supabase client (service-role key, used by the data layer)
src/lib/server/auth.ts            # AppUser shape, mapped from the Supabase Auth user
src/lib/server/authorize.ts       # requireRole() guard for role-gated actions
src/routes/materials              # material catalogue and form
src/routes/receptions             # reception list and form
src/lib/components/ui             # local shadcn-style UI components
supabase/migrations/001_initial_schema.sql  # database schema source of truth
supabase/migrations/003_rls_policies.sql    # RLS policies (defense-in-depth)
supabase/seed.sql                 # seed data for local development
scripts/seed-users.mjs            # provisions the demo Supabase Auth accounts
```
