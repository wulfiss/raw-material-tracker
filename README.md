# Raw Material Tracker

SvelteKit 2 / Svelte 5 application for daily raw-material traceability in an industrial kitchen.

## Current workflow

The main navigation has three sections:

- **Panel** (`/`): all daily-use history, accurate totals across the full result set, and filters for dates, raw material, finished product, brand/supplier, and raw-material lot. Each record shows its production date, raw material, brand/supplier, lot, expiration, finished products, product lot, and operator. Results are paginated; totals include all matching records.
- **Registro de uso diario** (`/daily-use/new`): enter the use date (today in Buenos Aires by default), raw material, **Marca / Proveedor**, packaging lot, expiration, and one or several finished products. Product lots use the name and date, for example `empanada-20261021`. **Guardar y agregar otra materia prima** retains the date and suggests the preceding products for confirmation while clearing the material, supplier, and lot fields.
- **Recetas** (`/recipes`): define a finished product using only its name and a list of ingredients. Ingredients come from the shared raw-material catalogue; users can add a new ingredient by name directly in this form.

No quantities, stock movements, yields, categories, losses, or temperatures are required in the current forms. Existing reception/material routes and records are retained for compatibility but removed from the main navigation. The previous full reception form remains at `/receptions/new?mode=reception`.

Brand/supplier suggestions read the existing Supabase `receptions.supplier` column as well as names saved in `daily_material_uses.supplier`. Each source's `material_id` supplies the raw-material association. The same text box accepts existing suggestions or a new name. Suggestions prioritize frequent suppliers for the selected material; materials without history can reuse suppliers from other materials. Names differing only in case or spacing appear once across both sources. Saving a new value makes it available on the next entry. This uses the existing schema and requires no additional SQL. Installations created with only the standalone daily-use setup can still use daily-use suggestions without a legacy receptions table.

## Authentication and roles

Supabase Auth supplies sessions. There is no self-service signup; provision accounts through the Auth Admin API or the provided local scripts. Roles are stored in `app_metadata.role`:

- `admin` and `quality`: create/correct daily-use records and create/edit recipes and their ingredient lists.
- `viewer`: read-only access to the dashboard, history, and recipe catalogue.

The service-role credential remains server-only. HTTP actions enforce roles, and table RLS supplies defense in depth. Daily saves use a server-only database function and a request token to prevent duplicate submissions. Historical material/product names are preserved with the daily record.

## Development

Node 24 and npm 11 are verified. Required application variables are `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in an ignored `.env.local` or the deployment platform's environment settings. Never commit credentials.

```bash
npm ci
npx supabase start
npx supabase migration up --local
# Configure .env.local from local Supabase status without printing credentials.
npm run seed:users
npm run dev
```

For this prepared cloud environment, retain its existing Supabase cache and image-registry settings. The saved setup helpers handle Docker VFS disk limits; do not replace the prepared PostgreSQL image with the original multilayer image on VFS.

## Database migrations and deployment

Apply the repository migrations before deploying code that needs them:

- `005_daily_material_uses.sql`: daily records, product links, and atomic save function.
- `006_daily_use_supplier.sql`: adds the brand/supplier field and extends the save function. Existing rows display `—` until corrected. The new argument is optional for older clients, and older corrections retain a recorded supplier. The migration also reloads the PostgREST schema cache.

For hosted Supabase, apply migrations in order. Migration 006 requires the tables from
migration 005. If the SQL editor reports `relation "public.daily_material_uses" does not
exist`, run the entire `supabase/setup-daily-traceability.sql` file instead. This single,
transactional script creates missing catalogue/recipe/daily-use tables and installs the
supplier-aware save function. It can be rerun without deleting existing records and does
not reset or seed data. On success it returns `Daily traceability ready` and
`supplier_ready = true`. Run it against the same Supabase project used by Vercel before
updating the preview deployment.

Simple recipe forms reuse the existing schema. New records receive compatibility defaults for legacy required formula columns; these are not measured quantities and are not used by daily traceability. Editing an existing recipe retains its legacy metadata and retained ingredient IDs.

## Validation

```bash
npm run check
npm test -- --run
npm run build
# Local database checks; fixtures and changes roll back:
docker exec -i supabase_db_raw-material-tracker psql -U postgres -d postgres \
  < supabase/tests/daily-material-uses.sql
# Fresh database setup and rerun checks (uses a temporary local database):
bash scripts/test-database-setup.sh
```

Browser checks cover ingredient-only recipe creation/editing, inline ingredient creation, normal-user/admin permissions, brand/supplier persistence, error recovery, full-history dashboard totals beyond 1,000 records, pagination and filters, and mobile/tablet/desktop layout.
