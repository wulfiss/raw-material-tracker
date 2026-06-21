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
supabase stop             # Stop local Supabase containers
```

## Validate

```bash
npm run check
npm run build
```

## Important files

```text
src/lib/server/db.ts              # Supabase client (service-role key)
src/lib/server/mock-auth.ts       # mock authentication for development
src/routes/materials              # material catalogue and form
src/routes/receptions             # reception list and form
src/lib/components/ui             # local shadcn-style UI components
supabase/migrations/001_initial_schema.sql  # database schema source of truth
supabase/seed.sql                 # seed data for local development
```

## Next production step

Connect Supabase Auth for real user sign-in, enable RLS policies in the migration, and add role-based permissions.
