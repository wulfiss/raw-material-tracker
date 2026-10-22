-- Run once in the hosted Supabase SQL Editor. Reads application data only.
-- No source data changes, no authentication tables, no new public access.
begin;
create or replace function public.export_excel_snapshot()
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare
  table_name text;
  rows_json jsonb;
  tables_json jsonb := '{}'::jsonb;
  missing_json jsonb := '[]'::jsonb;
begin
  foreach table_name in array array[
    'materials', 'receptions', 'recipes', 'recipe_ingredients', 'reception_views',
    'daily_material_uses', 'daily_material_use_products',
    'production_batches', 'production_batch_ingredients', 'production_batch_lot_usages'
  ] loop
    if pg_catalog.to_regclass('public.' || table_name) is null then
      missing_json := missing_json || pg_catalog.jsonb_build_array(table_name);
    else
      execute pg_catalog.format(
        'select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), ''[]''::jsonb) from public.%I t', table_name)
        into rows_json;
      tables_json := tables_json || pg_catalog.jsonb_build_object(table_name, rows_json);
    end if;
  end loop;
  if pg_catalog.to_regclass('public.daily_material_uses') is not null
     and pg_catalog.to_regclass('public.daily_material_use_products') is not null then
    execute $query$
      select coalesce(jsonb_agg(to_jsonb(t) order by t.used_on, t.usage_id, t.recipe_id), '[]'::jsonb)
      from (
        select u.id as usage_id, u.used_on, u.material_id, u.material_name,
          u.lot_code, u.expiry_date, to_jsonb(u)->>'supplier' as supplier,
          p.recipe_id, p.product_name as recipe_name,
          u.created_by_name, u.created_at,
          case when p.recipe_id is null then 'Sin producto registrado' else 'Uso registrado' end as record_status
        from public.daily_material_uses u
        left join public.daily_material_use_products p on p.usage_id = u.id
      ) t
    $query$ into rows_json;
    tables_json := tables_json || pg_catalog.jsonb_build_object('traceability', rows_json);
  else
    missing_json := missing_json || '["traceability"]'::jsonb;
  end if;
  return pg_catalog.jsonb_build_object('version', 1, 'exported_at', pg_catalog.statement_timestamp(),
    'tables', tables_json, 'missing_tables', missing_json);
end;
$$;
revoke all on function public.export_excel_snapshot() from public, anon, authenticated;
grant execute on function public.export_excel_snapshot() to service_role;
commit;
