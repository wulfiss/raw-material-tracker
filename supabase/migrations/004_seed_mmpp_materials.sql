-- Imports the material catalogue from mmpp.txt (flat name list, no metadata).
-- Category/unit/storage are inferred from the item's grouping in that file —
-- review and adjust via the Materials UI after import if any guess is wrong.
-- Safe to re-run: existing rows are matched by the unique `name` and skipped.

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
