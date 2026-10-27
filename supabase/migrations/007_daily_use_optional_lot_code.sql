-- Lot codes are optional; keep empty strings and the existing length limit.
alter table public.daily_material_uses
  drop constraint if exists daily_material_uses_lot_code_check;
alter table public.daily_material_uses
  add constraint daily_material_uses_lot_code_check
  check (length(trim(lot_code)) <= 120);
