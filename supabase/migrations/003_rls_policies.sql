-- RLS policies for Supabase Auth users.
-- The server still queries with the service-role key (which always bypasses RLS),
-- so these policies are defense-in-depth in case the anon key is ever used directly
-- by a client. Role comes from app_metadata, which only the service-role key can set.

create or replace function public.jwt_role() returns text
language sql stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'viewer');
$$;

-- Materials: any authenticated user can read; only admin/quality can write.
grant select, insert, update, delete on table public.materials to authenticated;

create policy "materials_select" on public.materials
  for select to authenticated using (true);

create policy "materials_write" on public.materials
  for all to authenticated
  using (public.jwt_role() in ('admin', 'quality'))
  with check (public.jwt_role() in ('admin', 'quality'));

-- Receptions: any authenticated user can read; only admin/quality can write.
grant select, insert, update, delete on table public.receptions to authenticated;

create policy "receptions_select" on public.receptions
  for select to authenticated using (true);

create policy "receptions_write" on public.receptions
  for all to authenticated
  using (public.jwt_role() in ('admin', 'quality'))
  with check (public.jwt_role() in ('admin', 'quality'));

-- Reception views: shared saved searches, any authenticated user can manage them.
grant select, insert, update, delete on table public.reception_views to authenticated;

create policy "reception_views_all" on public.reception_views
  for all to authenticated using (true) with check (true);

-- Recipes / recipe ingredients: any authenticated user can read; only admin/quality can write.
grant select, insert, update, delete on table public.recipes to authenticated;

create policy "recipes_select" on public.recipes
  for select to authenticated using (true);

create policy "recipes_write" on public.recipes
  for all to authenticated
  using (public.jwt_role() in ('admin', 'quality'))
  with check (public.jwt_role() in ('admin', 'quality'));

grant select, insert, update, delete on table public.recipe_ingredients to authenticated;

create policy "recipe_ingredients_select" on public.recipe_ingredients
  for select to authenticated using (true);

create policy "recipe_ingredients_write" on public.recipe_ingredients
  for all to authenticated
  using (public.jwt_role() in ('admin', 'quality'))
  with check (public.jwt_role() in ('admin', 'quality'));
