-- Phase 2: Production Batches module
-- Records which recipe was used and which reception lots supplied each ingredient.
-- Read-only: does not deduct stock, no ledger, no FEFO.

-- Batch header
create table if not exists public.production_batches (
  id              uuid primary key default gen_random_uuid(),
  recipe_id       uuid not null references public.recipes(id),
  status          text not null default 'planned'
                    check (status in ('planned', 'in_progress', 'completed', 'cancelled')),
  target_yield    numeric(12,3),
  actual_yield    numeric(12,3) check (actual_yield is null or actual_yield > 0),
  yield_unit      text,
  batch_number    text,
  started_at      timestamptz,
  completed_at    timestamptz,
  observations    text,
  created_at      timestamptz not null default now(),
  created_by      text not null default '',
  created_by_name text not null default ''
);

-- Junction: reception lots assigned to recipe ingredients within a batch
create table if not exists public.batch_ingredient_lots (
  id              uuid primary key default gen_random_uuid(),
  batch_id        uuid not null references public.production_batches(id) on delete cascade,
  recipe_ing_id   uuid not null references public.recipe_ingredients(id),
  reception_id    uuid not null references public.receptions(id),
  quantity_used   numeric(12,3) not null check (quantity_used > 0),
  unit            text not null,
  notes           text,
  created_at      timestamptz not null default now()
);

create index if not exists batch_ingredient_lots_batch_idx on public.batch_ingredient_lots(batch_id);
create index if not exists batch_ingredient_lots_reception_idx on public.batch_ingredient_lots(reception_id);
create index if not exists production_batches_recipe_idx on public.production_batches(recipe_id);

alter table public.production_batches enable row level security;
alter table public.batch_ingredient_lots enable row level security;

grant all on table public.production_batches to service_role;
grant all on table public.batch_ingredient_lots to service_role;