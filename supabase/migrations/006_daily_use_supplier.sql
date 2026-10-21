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
