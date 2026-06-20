create extension if not exists pgcrypto;

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

-- Receptions (inbound lot records)
create table if not exists public.receptions (
  id               uuid primary key default gen_random_uuid(),
  received_on      date not null,
  material_id      uuid not null references public.materials(id),
  supplier         text not null,
  lot_code         text not null,
  manufacture_date date,
  expiry_date      date,
  quantity         numeric(12,3) not null check (quantity > 0),
  unit             text not null check (unit in ('kg','g','liter','unit','box')),
  temperature_c    numeric(5,2),
  status           text not null check (status in ('accepted','conditional','rejected')),
  observations     text,
  created_at       timestamptz not null default now(),
  created_by       text not null default '',
  created_by_name  text not null default '',
  constraint valid_date_range check (
    expiry_date is null or manufacture_date is null or expiry_date >= manufacture_date
  )
);

-- Saved filter views (custom only; default views are defined in app code)
create table if not exists public.reception_views (
  id         text primary key,
  name       text not null unique,
  filters    jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists receptions_received_on_idx  on public.receptions(received_on desc);
create index if not exists receptions_expiry_date_idx  on public.receptions(expiry_date);
create index if not exists receptions_lot_code_idx     on public.receptions(lot_code);
create index if not exists receptions_material_id_idx  on public.receptions(material_id);

alter table public.materials       enable row level security;
alter table public.receptions      enable row level security;
alter table public.reception_views enable row level security;
-- No public RLS policies. Server uses service-role key which bypasses RLS.
