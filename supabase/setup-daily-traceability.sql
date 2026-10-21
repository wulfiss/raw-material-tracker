-- Run this entire file in the SQL editor of the Supabase project used by
-- the Vercel preview. Supports databases missing migrations 002/005/006.
-- Adds the required tables/functions without deleting or seeding records.
-- Existing tables are retained; incompatible existing schemas fail the
-- transaction instead of being reset. Safe to run again after success.
begin;

-- Materials catalog
create table if not exists public.materials (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null unique,
  category            text not null,
  unit                text not null check (unit in ('kg','g','liter','unit','box')),
  storage_condition   text not null default 'ambient'
                        check (storage_condition in ('refrigerated','frozen','dry','ambient')),
  min_stock           numeric(12,3) not null default 0,
  expiration_required boolean not null default false,
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  created_by          text not null default '',
  created_by_name     text not null default ''
);


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

-- Daily traceability: one raw-material lot, one date, several finished products.
-- Deliberately independent of inbound quantities and inventory.
create table if not exists public.daily_material_uses (
  id uuid primary key default gen_random_uuid(),
  request_token uuid not null unique,
  used_on date not null,
  material_id uuid not null references public.materials(id),
  material_name text not null,
  lot_code text not null check (length(trim(lot_code)) between 1 and 120),
  expiry_date date not null,
  created_by text not null,
  created_by_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.daily_material_use_products (
  usage_id uuid not null references public.daily_material_uses(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id),
  product_name text not null,
  primary key (usage_id, recipe_id)
);
create index if not exists daily_material_uses_date_idx on public.daily_material_uses(used_on desc, created_at desc);
create index if not exists daily_material_uses_lot_idx on public.daily_material_uses(lot_code);
create index if not exists daily_material_use_products_recipe_idx on public.daily_material_use_products(recipe_id);
alter table public.daily_material_uses enable row level security;
alter table public.daily_material_use_products enable row level security;
grant all on public.daily_material_uses, public.daily_material_use_products to service_role;
grant select on public.daily_material_uses, public.daily_material_use_products to authenticated;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'daily_material_uses' and policyname = 'daily_uses_read') then
    create policy daily_uses_read on public.daily_material_uses for select to authenticated using (true);
  end if;
end $policy$;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'daily_material_use_products' and policyname = 'daily_use_products_read') then
    create policy daily_use_products_read on public.daily_material_use_products for select to authenticated using (true);
  end if;
end $policy$;


-- Server access to the catalogue, including projects created manually.
alter table public.materials enable row level security;
grant all on public.materials to service_role;

-- Brand/supplier belongs to the raw-material use, never the finished-product lot.
-- Existing rows remain unchanged; old clients may omit the new RPC argument.
alter table public.daily_material_uses add column if not exists supplier text not null default '';
drop function if exists public.save_daily_material_use(uuid,uuid,date,uuid,text,date,uuid[],text,text);

create or replace function public.save_daily_material_use(
  p_id uuid, p_request_token uuid, p_used_on date, p_material_id uuid,
  p_lot_code text, p_expiry_date date, p_product_ids uuid[],
  p_user_id text, p_user_name text, p_supplier text default null
) returns uuid language plpgsql set search_path = public as $$
declare
  saved_id uuid;
  material_label text;
  previous public.daily_material_uses;
  product_labels jsonb;
begin
  if p_supplier is not null and (length(trim(p_supplier)) = 0 or length(trim(p_supplier)) > 160) then
    raise exception 'daily_use_invalid_supplier';
  end if;
  if p_id is not null then
    select * into previous from public.daily_material_uses where id = p_id for update;
    if not found then raise exception 'daily_use_not_found'; end if;
  end if;
  if p_product_ids is null or cardinality(p_product_ids) = 0 or cardinality(p_product_ids) > 100 then
    raise exception 'daily_use_products_required';
  end if;
  if cardinality(p_product_ids) <> (select count(distinct x) from unnest(p_product_ids) x) then
    raise exception 'daily_use_invalid_products';
  end if;
  select case when previous.material_id = m.id then previous.material_name else m.name end
    into material_label from public.materials m
    where m.id = p_material_id and (m.active or previous.material_id = m.id);
  if material_label is null then raise exception 'daily_use_invalid_material'; end if;
  if exists (
    select 1 from unnest(p_product_ids) selected(id)
    left join public.recipes r on r.id = selected.id
    where r.id is null or (not r.active and not exists (
      select 1 from public.daily_material_use_products old where old.usage_id = p_id and old.recipe_id = r.id
    ))
  ) then raise exception 'daily_use_invalid_products'; end if;
  select jsonb_object_agg(r.id::text, coalesce(old.product_name, r.name)) into product_labels
    from public.recipes r left join public.daily_material_use_products old
    on old.usage_id = p_id and old.recipe_id = r.id where r.id = any(p_product_ids);
  if p_id is null then
    insert into public.daily_material_uses
      (request_token, used_on, material_id, material_name, lot_code, expiry_date, created_by, created_by_name, supplier)
    values (p_request_token, p_used_on, p_material_id, material_label, trim(p_lot_code), p_expiry_date, p_user_id, p_user_name, coalesce(trim(p_supplier), ''))
    on conflict (request_token) do nothing returning id into saved_id;
    if saved_id is null then
      select id into saved_id from public.daily_material_uses where request_token = p_request_token;
      return saved_id;
    end if;
  else
    saved_id := p_id;
    update public.daily_material_uses set used_on = p_used_on, material_id = p_material_id,
      material_name = material_label, supplier = coalesce(trim(p_supplier), previous.supplier), lot_code = trim(p_lot_code), expiry_date = p_expiry_date,
      updated_at = now() where id = saved_id;
    delete from public.daily_material_use_products where usage_id = saved_id;
  end if;
  insert into public.daily_material_use_products (usage_id, recipe_id, product_name)
    select saved_id, id, product_labels ->> id::text from unnest(p_product_ids) id;
  return saved_id;
end;
$$;
revoke all on function public.save_daily_material_use(uuid,uuid,date,uuid,text,date,uuid[],text,text,text) from public, anon, authenticated;
grant execute on function public.save_daily_material_use(uuid,uuid,date,uuid,text,date,uuid[],text,text,text) to service_role;

notify pgrst, 'reload schema';

select 'Daily traceability ready' as status,
       to_regclass('public.daily_material_uses') as daily_records,
       to_regclass('public.daily_material_use_products') as product_links,
       exists (
         select 1 from information_schema.columns
         where table_schema = 'public' and table_name = 'daily_material_uses' and column_name = 'supplier'
       ) as supplier_ready;
commit;
