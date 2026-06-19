-- Run this in your Supabase SQL Editor dashboard
-- after creating the project at https://supabase.com

create extension if not exists pgcrypto;

-- ── Profiles (linked to auth.users) ──────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null check (role in ('admin', 'quality', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create profile on sign-up (triggered by auth.users)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'viewer')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Materials ────────────────────────────────────────────────

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  unit text not null check (unit in ('kg','g','liter','unit','box')),
  storage_condition text not null default 'ambient'
    check (storage_condition in ('refrigerated','frozen','dry','ambient')),
  min_stock numeric(10,2) not null default 0,
  expiration_required boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  created_by_name text not null
);

alter table public.materials enable row level security;

-- ── Receptions ───────────────────────────────────────────────

create table if not exists public.receptions (
  id uuid primary key default gen_random_uuid(),
  received_on date not null,
  material_id uuid not null references public.materials(id),
  supplier text not null,
  lot_code text not null,
  manufacture_date date,
  expiry_date date,
  quantity numeric(12,3) not null check (quantity > 0),
  unit text not null check (unit in ('kg','g','liter','unit','box')),
  temperature_c numeric(5,2),
  status text not null check (status in ('accepted','conditional','rejected')),
  observations text,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  created_by_name text not null,
  constraint valid_date_range check (
    expiry_date is null or manufacture_date is null or expiry_date >= manufacture_date
  )
);

create index if not exists receptions_received_on_idx on public.receptions(received_on desc);
create index if not exists receptions_expiry_date_idx on public.receptions(expiry_date);
create index if not exists receptions_lot_code_idx on public.receptions(lot_code);
create index if not exists receptions_material_id_idx on public.receptions(material_id);

alter table public.receptions enable row level security;

-- ── Reception Views (saved filter presets) ───────────────────

create table if not exists public.reception_views (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id uuid not null references auth.users(id),
  is_default boolean not null default false,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.reception_views enable row level security;

-- ── RLS Policies ─────────────────────────────────────────────
-- Server-side code uses the service-role key (bypasses RLS).
-- These policies provide defence-in-depth for direct DB access.

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Materials are viewable by authenticated users"
  on public.materials for select
  to authenticated
  using (true);

create policy "Materials are manageable by authenticated users"
  on public.materials for insert
  to authenticated
  with check (true);

create policy "Materials are updatable by authenticated users"
  on public.materials for update
  to authenticated
  using (true);

create policy "Receptions are viewable by authenticated users"
  on public.receptions for select
  to authenticated
  using (true);

create policy "Receptions are manageable by authenticated users"
  on public.receptions for insert
  to authenticated
  with check (true);

create policy "Receptions are updatable by authenticated users"
  on public.receptions for update
  to authenticated
  using (true);

create policy "Receptions are deletable by authenticated users"
  on public.receptions for delete
  to authenticated
  using (true);

create policy "Reception views are viewable by authenticated users"
  on public.reception_views for select
  to authenticated
  using (true);

create policy "Reception views are manageable by authenticated users"
  on public.reception_views for insert
  to authenticated
  with check (true);

create policy "Reception views are deletable by authenticated users"
  on public.reception_views for delete
  to authenticated
  using (true);
