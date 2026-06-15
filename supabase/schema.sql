create extension if not exists pgcrypto;

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  default_unit text not null check (default_unit in ('kg','g','l','unit','box')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  received_on date not null,
  material_id uuid not null references public.materials(id),
  supplier text not null,
  lot_code text not null,
  manufacture_date date,
  expiry_date date,
  quantity numeric(12,3) not null check (quantity > 0),
  unit text not null check (unit in ('kg','g','l','unit','box')),
  temperature_c numeric(5,2),
  status text not null check (status in ('accepted','conditional','rejected')),
  observations text,
  created_at timestamptz not null default now(),
  constraint valid_date_range check (expiry_date is null or manufacture_date is null or expiry_date >= manufacture_date)
);

create index if not exists receipts_received_on_idx on public.receipts(received_on desc);
create index if not exists receipts_expiry_date_idx on public.receipts(expiry_date);
create index if not exists receipts_lot_code_idx on public.receipts(lot_code);

alter table public.materials enable row level security;
alter table public.receipts enable row level security;
-- No public policies are created. The SvelteKit server uses the service-role key.
-- Add authentication and user-scoped RLS before exposing this as a multi-user production system.
