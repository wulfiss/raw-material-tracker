-- Imports the material catalogue from mmpp.txt (flat name list, no metadata).
-- Category/unit/storage are inferred from the item's grouping in that file —
-- review and adjust via the Materials UI after import if any guess is wrong.
-- Safe to re-run: existing rows are matched by the unique `name` and skipped.

-- The hosted project's materials/receptions tables were created before this
-- migration history existed, with created_by as uuid instead of the text type
-- defined in 001_initial_schema.sql. Confirmed with the project owner that
-- existing rows in these tables are disposable, so we clear them and convert
-- the column to text rather than trying to preserve uuid values that don't
-- correspond to any real user record.

truncate table public.recipe_ingredients, public.receptions, public.materials;

-- Drop whatever foreign key(s) were attached to created_by (e.g. a reference
-- to auth.users(id) added outside this migration history) — looked up
-- dynamically since the constraint name isn't part of our schema history.
do $$
declare
  con record;
begin
  for con in
    select distinct c.conname, c.conrelid::regclass::text as tbl
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
    where c.contype = 'f'
      and c.conrelid in ('public.materials'::regclass, 'public.receptions'::regclass)
      and a.attname = 'created_by'
  loop
    execute format('alter table %s drop constraint %I', con.tbl, con.conname);
  end loop;
end $$;

alter table public.materials alter column created_by drop default;
alter table public.materials alter column created_by type text using created_by::text;
alter table public.materials alter column created_by set default '';
alter table public.materials alter column created_by set not null;

alter table public.receptions alter column created_by drop default;
alter table public.receptions alter column created_by type text using created_by::text;
alter table public.receptions alter column created_by set default '';
alter table public.receptions alter column created_by set not null;

insert into public.materials (name, category, unit, storage_condition, expiration_required, created_by, created_by_name)
values
  ('Bondiola de cerdo', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Carne molida', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Carne molida de pollo', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Carne vacuna', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Jamón cocido', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Matambre de cerdo', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Matambre vacuno', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Milanesa de carne', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Milanesa de pollo', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Patamuslo de pollo', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Pecho vacuno', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Pechuga de pollo', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Pollo', 'Carnes', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt')
on conflict (name) do nothing;

insert into public.materials (name, category, unit, storage_condition, expiration_required, created_by, created_by_name)
values
  ('Triturado de jamón y queso', 'Salsas y rellenos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Salsa boloñesa', 'Salsas y rellenos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Salsa de tomate', 'Salsas y rellenos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Relleno de acelga', 'Salsas y rellenos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Relleno de jamón y queso', 'Salsas y rellenos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Relleno de pollo', 'Salsas y rellenos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Relleno de atún', 'Salsas y rellenos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Chimichurri', 'Salsas y rellenos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt')
on conflict (name) do nothing;

insert into public.materials (name, category, unit, storage_condition, expiration_required, created_by, created_by_name)
values
  ('Acelga', 'Verduras', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Ajo', 'Verduras', 'kg', 'ambient', false, 'mmpp-import', 'Importación mmpp.txt'),
  ('Arvejas', 'Verduras', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Berenjena', 'Verduras', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Brócoli', 'Verduras', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Calabaza', 'Verduras', 'kg', 'ambient', false, 'mmpp-import', 'Importación mmpp.txt'),
  ('Cebolla', 'Verduras', 'kg', 'ambient', false, 'mmpp-import', 'Importación mmpp.txt'),
  ('Chaucha', 'Verduras', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Morrón amarillo', 'Verduras', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Morrón rojo', 'Verduras', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Morrón verde', 'Verduras', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Papa', 'Verduras', 'kg', 'ambient', false, 'mmpp-import', 'Importación mmpp.txt'),
  ('Remolacha', 'Verduras', 'kg', 'ambient', false, 'mmpp-import', 'Importación mmpp.txt'),
  ('Tomate', 'Verduras', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Zanahoria', 'Verduras', 'kg', 'ambient', false, 'mmpp-import', 'Importación mmpp.txt'),
  ('Zapallo de tronco', 'Verduras', 'kg', 'ambient', false, 'mmpp-import', 'Importación mmpp.txt')
on conflict (name) do nothing;

insert into public.materials (name, category, unit, storage_condition, expiration_required, created_by, created_by_name)
values
  ('Aceitunas', 'Conservas', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Tomate triturado', 'Conservas', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Atún en lata', 'Conservas', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Caballa en lata', 'Conservas', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt')
on conflict (name) do nothing;

insert into public.materials (name, category, unit, storage_condition, expiration_required, created_by, created_by_name)
values
  ('Huevo', 'Lácteos y huevos', 'unit', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Crema de leche', 'Lácteos y huevos', 'liter', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Leche', 'Lácteos y huevos', 'liter', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Manteca', 'Lácteos y huevos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Muzzarella', 'Lácteos y huevos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Queso crema', 'Lácteos y huevos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Queso cremoso', 'Lácteos y huevos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt')
on conflict (name) do nothing;

insert into public.materials (name, category, unit, storage_condition, expiration_required, created_by, created_by_name)
values
  ('Agua', 'Aceites y condimentos', 'liter', 'ambient', false, 'mmpp-import', 'Importación mmpp.txt'),
  ('Aceite de girasol', 'Aceites y condimentos', 'liter', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Mayonesa', 'Aceites y condimentos', 'kg', 'refrigerated', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Vinagre', 'Aceites y condimentos', 'liter', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Mostaza', 'Aceites y condimentos', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt')
on conflict (name) do nothing;

insert into public.materials (name, category, unit, storage_condition, expiration_required, created_by, created_by_name)
values
  ('Arroz', 'Almacén', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Caldo', 'Almacén', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Harina', 'Almacén', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Pan rallado', 'Almacén', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt')
on conflict (name) do nothing;

insert into public.materials (name, category, unit, storage_condition, expiration_required, created_by, created_by_name)
values
  ('Masa pascualina', 'Masas', 'kg', 'frozen', true, 'mmpp-import', 'Importación mmpp.txt')
on conflict (name) do nothing;

insert into public.materials (name, category, unit, storage_condition, expiration_required, created_by, created_by_name)
values
  ('Nuez moscada', 'Especias', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Orégano', 'Especias', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt'),
  ('Pimentón', 'Especias', 'kg', 'ambient', true, 'mmpp-import', 'Importación mmpp.txt')
on conflict (name) do nothing;
