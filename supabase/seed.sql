-- Seed data matching src/lib/server/mock-db.ts initial state

insert into public.materials (name, category, unit, storage_condition, min_stock, expiration_required, active, created_by, created_by_name)
values
  ('Chicken breast', 'Meat', 'kg', 'refrigerated', 10, true, true, 'seed-user', 'Seed data')
    on conflict (name) do nothing;

insert into public.materials (name, category, unit, storage_condition, min_stock, expiration_required, active, created_by, created_by_name)
values
  ('Tomato', 'Vegetables', 'kg', 'refrigerated', 5, true, true, 'seed-user', 'Seed data')
    on conflict (name) do nothing;

insert into public.materials (name, category, unit, storage_condition, min_stock, expiration_required, active, created_by, created_by_name)
values
  ('Cooking oil', 'Dry goods', 'liter', 'ambient', 3, false, true, 'seed-user', 'Seed data')
    on conflict (name) do nothing;

insert into public.receptions (received_on, material_id, supplier, lot_code, manufacture_date, expiry_date, quantity, unit, temperature_c, status, observations, created_by, created_by_name)
select
  current_date,
  m.id,
  'Local poultry supplier',
  'POL-001',
  current_date - interval '1 day',
  current_date + interval '5 days',
  18.5,
  'kg',
  3.2,
  'accepted',
  'Seed mock record.',
  'seed-user',
  'Seed data'
from public.materials m
where m.name = 'Chicken breast'
  and not exists (
    select 1 from public.receptions r
    where r.lot_code = 'POL-001' and r.material_id = m.id
  );
