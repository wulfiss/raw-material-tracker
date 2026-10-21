-- Run against local Supabase only; fixtures and changes roll back.
\set ON_ERROR_STOP on
begin;
do $$
declare
  m uuid := gen_random_uuid(); p uuid := gen_random_uuid(); q uuid := gen_random_uuid();
  token uuid := gen_random_uuid(); entry uuid; retry uuid;
begin
  insert into materials(id,name,category,unit) values(m,'Daily use test ' || m,'Test','kg');
  insert into recipes(id,name,yield_quantity,yield_unit) values(p,'Milanesa test',1,'unit'),(q,'Empanada test',1,'unit');
  entry := save_daily_material_use(null,token,'2026-10-21',m,'POL-184','2026-10-24',array[p,q],'test','Test');
  if (select count(*) from daily_material_use_products where usage_id=entry) <> 2 then raise exception 'missing product links'; end if;
  retry := save_daily_material_use(null,token,'2026-10-21',m,'POL-184','2026-10-24',array[p,q],'test','Test');
  if retry <> entry or (select count(*) from daily_material_uses where request_token=token) <> 1 then raise exception 'duplicate submission'; end if;
  update materials set name='Renamed material',active=false where id=m;
  update recipes set name='Renamed product',active=false where id=p;
  perform save_daily_material_use(entry,token,'2026-10-22',m,'POL-185','2026-10-25',array[p],'test','Test');
  if (select product_name from daily_material_use_products where usage_id=entry) <> 'Milanesa test' then raise exception 'lost product snapshot'; end if;
  if (select material_name from daily_material_uses where id=entry) not like 'Daily use test %' then raise exception 'lost material snapshot'; end if;
  begin
    perform save_daily_material_use(entry,token,'2026-10-23',m,'BAD','2026-10-25',array[gen_random_uuid()],'test','Test');
    raise exception 'accepted invalid product';
  exception when others then
    if sqlerrm = 'accepted invalid product' then raise; end if;
  end;
  if (select lot_code from daily_material_uses where id=entry) <> 'POL-185' or
     (select count(*) from daily_material_use_products where usage_id=entry) <> 1 then raise exception 'partial failed save'; end if;
  begin
    perform save_daily_material_use(null,gen_random_uuid(),'2026-10-21',m,'BAD','2026-10-24',array[q],'test','Test');
    raise exception 'accepted inactive material';
  exception when others then
    if sqlerrm = 'accepted inactive material' then raise; end if;
  end;
  if has_function_privilege('authenticated','public.save_daily_material_use(uuid,uuid,date,uuid,text,date,uuid[],text,text)','execute')
    or has_function_privilege('anon','public.save_daily_material_use(uuid,uuid,date,uuid,text,date,uuid[],text,text)','execute') then raise exception 'exposed write RPC'; end if;
  if has_table_privilege('authenticated','public.daily_material_uses','insert') then raise exception 'exposed direct insert'; end if;
  raise notice 'Daily-use database checks passed';
end $$;
rollback;
