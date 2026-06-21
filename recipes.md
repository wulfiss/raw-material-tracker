# OpenCode Prompts — Recipes Feature

**Project:** Raw Material Tracker

**Context limit note:** OpenCode has about 95k context. Use these prompts one phase at a time. Do not paste all phases into a single coding request unless you are only asking for a plan.


## Phase 0 — Read-only Plan


You are working on the raw-material-tracker app.

Context:
- SvelteKit + Svelte 5 app.
- Supabase DB and auth are working.
- Canonical reception route is /receptions.
- Existing modules include materials and receptions.
- App is working; do not refactor unrelated code.
- OpenCode has limited context, so keep the plan compact.

Goal:
Plan the implementation of a Recipes module.

Feature concept:
A recipe is a formula composed of ingredients selected from existing materials.
Recipes do NOT consume stock yet.
Recipes do NOT select reception lots yet.
Reception lots will be selected later in production batches.

Required future routes:
- /recipes
- /recipes/new
- /recipes/[id]/edit

Read only:
- Inspect existing repository/server patterns.
- Inspect current Supabase schema/migrations.
- Inspect materials routes/forms.
- Inspect reception form material select/search pattern.
- Inspect translations and navigation.

Return:
1. Files that need changes.
2. Existing patterns to reuse.
3. Risks.
4. Implementation phases.
5. Exact DB tables needed.
6. Do not edit files in this phase.


## Phase 1 — DB Migration Only


Implement database migration for recipes only.

Context:
The app uses Supabase. DB and auth are working.
Do not touch app UI yet.

Goal:
Add tables:
- recipes
- recipe_ingredients

Required recipes fields:
- id uuid primary key default gen_random_uuid()
- name text not null
- category text null
- yield_quantity numeric not null
- yield_unit text not null
- active boolean not null default true
- notes text null
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Required recipe_ingredients fields:
- id uuid primary key default gen_random_uuid()
- recipe_id uuid not null references recipes(id) on delete cascade
- material_id uuid not null references materials(id)
- quantity numeric not null
- unit text not null
- loss_percent numeric null
- notes text null
- sort_order integer not null default 0
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Constraints:
- yield_quantity > 0
- quantity > 0
- loss_percent is null or between 0 and 100
- Optional: prevent duplicate material_id per recipe if safe.

Rules:
- Do not change auth.
- Do not change existing materials/receptions tables unless strictly necessary.
- Do not add production batches.
- Do not add stock ledger.
- Do not add FEFO.
- Do not change UI.

Validation:
- Run Supabase migration/reset if appropriate for local dev.
- Run npm run check if schema types affect code.
- Return migration file created and any assumptions.


## Phase 2 — Repository Functions Only


Implement recipe repository functions only.

Context:
DB migration for recipes and recipe_ingredients should already exist.
Do not add UI routes yet.

Goal:
Add server-side repository functions following existing project patterns.

Required functions:
- listRecipes()
- getRecipe(id)
- createRecipe(input)
- updateRecipe(id, input)
- setRecipeActive(id, active)
- listRecipeIngredients(recipeId)
- replaceRecipeIngredients(recipeId, ingredients)

Validation rules:
- recipe name required
- yield_quantity must be > 0
- yield_unit must be a valid material unit
- at least one ingredient required for create/update if the repository handles full recipe save
- ingredient material_id required
- ingredient quantity must be > 0
- ingredient unit must be valid
- loss_percent optional; if present must be >= 0 and <= 100
- reject duplicate material lines unless the current project pattern supports duplicates

Rules:
- Do not add UI.
- Do not change existing receptions behavior.
- Do not change existing materials behavior except reading active materials if needed.
- Keep server-only Supabase access safe.
- Do not trust client-provided user identity.

Validation:
- npm run check
- npm run build
- Return functions added and files changed.


## Phase 3 — `/recipes` List Page Only


Add /recipes list page only.

Context:
Repository functions for recipes exist.
Do not add create/edit forms yet unless minimal stubs are required.

Goal:
Create route:
- /recipes

List columns:
- Name
- Category
- Expected yield
- Ingredient count
- Active/inactive
- Actions

Actions:
- New recipe link
- Edit link
- Activate/deactivate form action

Navigation:
- Add Recipes to main navigation.

Rules:
- Reuse existing app layout and shadcn-svelte style.
- Use modern Svelte 5 syntax.
- Do not change materials/receptions behavior.
- Do not add production batches.
- Do not add stock deduction.
- Do not select reception lots.

Translations:
Add only keys needed for this page.

Validation:
- npm run check
- npm run build
- Manual: /recipes loads and navigation works.
- Return files changed.


## Phase 4 — `/recipes/new` Form Only


Add /recipes/new form.

Context:
- /recipes exists.
- Active materials can be listed.
- Use materials as recipe ingredients.
- Do NOT select reception lots here.

Goal:
Create route:
- /recipes/new

Form fields:
- Recipe name
- Category
- Expected yield quantity
- Yield unit
- Notes
- Active checkbox if consistent with project pattern
- Ingredient rows

Ingredient row fields:
- Searchable material select using active materials
- Quantity
- Unit
- Loss %
- Notes
- Remove button

Buttons:
- Add ingredient
- Save recipe
- Cancel/back

Validation:
- name required
- expected yield > 0
- yield unit valid
- at least one ingredient required
- ingredient material required
- ingredient quantity > 0
- ingredient unit valid
- loss % empty or 0–100
- duplicate material rejected unless explicitly allowed

Rules:
- Use existing form/action patterns.
- Use modern Svelte 5 syntax.
- Use keyed each blocks for ingredient rows.
- Keep form mobile-friendly.
- Do not add edit page yet unless required code can be reused safely.
- Do not change auth/db config.

Translations:
Add keys required by the new form.

Validation:
- npm run check
- npm run build
- Manual: create recipe with 2 ingredients.
- Manual: invalid form shows errors.
- Return files changed.


## Phase 5 — `/recipes/[id]/edit` Form Only


Add /recipes/[id]/edit form.

Context:
- /recipes and /recipes/new exist.
- Repository supports get/update/replace ingredients.

Goal:
Create route:
- /recipes/[id]/edit

Behavior:
- Load recipe and existing ingredients.
- Allow editing recipe fields.
- Allow adding/removing ingredient rows.
- Save updates.
- Return to /recipes after successful save.
- Handle missing recipe with 404 or existing project pattern.

Rules:
- Reuse /recipes/new components if there is already a good shared component.
- Do not over-refactor.
- Do not change unrelated modules.
- Do not add production batches.
- Do not consume stock.
- Do not select reception lots.

Validation:
- npm run check
- npm run build
- Manual: edit recipe, add ingredient, remove ingredient, save.
- Return files changed.


## Phase 6 — Translation Cleanup Only


Audit and fix recipe translation issues only.

Context:
Recipes feature exists.
Do not change logic.

Check:
- src/lib/i18n/translations.ts
- navigation labels
- /recipes labels
- /recipes/new labels
- /recipes/[id]/edit labels
- validation messages
- buttons
- active/inactive labels
- units

Rules:
- Do not change DB.
- Do not change repository logic.
- Do not change routes.
- Do not add features.
- Keep English and Spanish consistent.
- Avoid hardcoded user-facing text in Svelte files.

Validation:
- npm run check
- npm run build
- Return keys added/fixed and remaining hardcoded labels if any.


## Phase 7 — Final QA / No Feature Changes


Final QA for Recipes feature. Do not add new features.

Check:
1. /recipes
2. /recipes/new
3. /recipes/[id]/edit
4. navigation
5. create recipe with 2 ingredients
6. edit recipe
7. add ingredient
8. remove ingredient
9. invalid quantity validation
10. missing ingredient validation
11. duplicate ingredient validation
12. deactivate/reactivate recipe
13. materials still work
14. receptions still work
15. login/logout still work

Run:
- npm run check
- npm run build

Search for obvious stale terms:
- "receipt" if it should be "reception"
- hardcoded "Recipe" or "Receta" in Svelte files if translations are expected

Return:
- validation result
- manual test result
- bugs found
- recommended next implementation

Do not implement production batches yet.


## Next Feature After Recipes


After recipes are stable, implement Production Batches.

Future flow:
Materials -> Receptions -> Recipes -> Production Batches -> Traceability

Production batches will:
- select a recipe
- load required recipe ingredients
- select actual reception lots for each ingredient
- later consume stock through a stock ledger
- later support FEFO auto-selection

Do not mix production batches into the recipe implementation.
