# Product recipe import

Sources copied without modification from GitHub branch `feat/daily-material-use`,
commit `2b4abf3f7fcd9e0319b168cd7e7965e23d748e56`.

Run `node scripts/build-recipe-import.mjs` to regenerate
`supabase/import-product-recipes.sql`. Apply that SQL in the intended hosted
Supabase project's SQL editor after reviewing it. It requires the existing
materials, recipes, and recipe_ingredients tables; it does not require resetting
the database or replaying historical seeds. **Do not run migration 004 for this
import: it truncates existing materials, receptions, and recipe ingredients.**

The import is one transaction and can be rerun. It adds 68 recipe definitions and six raw materials
and 376 ingredient memberships. Duplicate dish names in different departments
remain separate because their ingredient lists differ. Existing recipe and
material attributes are preserved; matching material names are reused exactly.
Other spellings, brands, food states, and alternatives are retained for review.

Each recipe has an `output_material_id`. Other recipes reference that material
in recipe_ingredients, so a preparation can be both a finished dish and an
ingredient. Output material names include department and `elaborado` to avoid
confusing raw milanesas or pizza bases with prepared products. The generator
contains the explicit, reviewable preparation aliases. It does not guess the
composition of unspecified sauces or fillings.

The sources contain no quantities or yields. Imported recipes have
`quantities_specified = false`, and notes explain the legacy numeric values of 1
are compatibility placeholders. They must not be used for production scaling or
stock calculations. New materials use `unit` and `ambient` as compatibility
defaults, not verified handling instructions; review storage and units before
operational use. The six Fiambrería intermediate entries are treated as raw materials, as
requested. Their consuming recipes reference those materials directly. They do
not create recipe definitions. The separate Cocina filling recipes remain recipes.
If the previous import was already run, this version repoints its memberships
and removes only the six untouched empty imported recipe placeholders. Foreign
keys prevent removal if operational records already reference a placeholder.
Old output materials are preserved to avoid affecting historical references.

The current checkout's detailed recipe UI does not interpret the new
`quantities_specified` flag; imported numeric values must be understood using
these notes. The simpler membership workflow on `feat/daily-material-use` is
better suited to these source documents. This import does not deploy that branch.

Validation: `npx vitest run supabase/recipe-import.test.ts`. The SQL has also been
executed twice against an isolated PostgreSQL-compatible PGlite database using
the repository table definitions, checking repeatability, preservation of existing
records, recipe outputs, and preparation links. Hosted execution is separate.
