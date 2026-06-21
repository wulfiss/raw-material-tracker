-- Phase 1: Recipes module tables

-- Recipe definitions (formulas composed of ingredients from existing materials)
create table if not exists public.recipes (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text,
  yield_quantity  numeric(12,3) not null check (yield_quantity > 0),
  yield_unit      text not null,
  active          boolean not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Recipe ingredients (links a recipe to a material with required quantity)
create table if not exists public.recipe_ingredients (
  id              uuid primary key default gen_random_uuid(),
  recipe_id       uuid not null references public.recipes(id) on delete cascade,
  material_id     uuid not null references public.materials(id),
  quantity        numeric(12,3) not null check (quantity > 0),
  unit            text not null,
  loss_percent    numeric(5,2) check (loss_percent is null or (loss_percent >= 0 and loss_percent <= 100)),
  notes           text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Prevent adding the same material twice to a recipe
  constraint unique_recipe_material unique (recipe_id, material_id)
);

create index if not exists recipe_ingredients_recipe_idx on public.recipe_ingredients(recipe_id);
create index if not exists recipe_ingredients_material_idx on public.recipe_ingredients(material_id);

alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;

grant all on table public.recipes to service_role;
grant all on table public.recipe_ingredients to service_role;
