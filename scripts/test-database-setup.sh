#!/usr/bin/env bash
# Local Supabase only: checks missing tables, reruns, and record preservation.
set -euo pipefail
rmt_root="$(cd "$(dirname "$0")/.." && pwd)"
rmt_container="${SUPABASE_DB_CONTAINER:-supabase_db_raw-material-tracker}"
rmt_test_db="rmt_setup_test_$$"
cleanup() { docker exec "$rmt_container" dropdb -U postgres --if-exists "$rmt_test_db"; }
docker exec "$rmt_container" createdb -U postgres "$rmt_test_db"
trap cleanup EXIT
run_setup() {
  docker exec -i "$rmt_container" psql -U postgres -d "$rmt_test_db" -v ON_ERROR_STOP=1 < "$rmt_root/supabase/setup-daily-traceability.sql"
}
run_setup
docker exec -i "$rmt_container" psql -U postgres -d "$rmt_test_db" -v ON_ERROR_STOP=1 <<'SQL'
do $$
declare m uuid := gen_random_uuid(); r uuid := gen_random_uuid();
begin
  insert into public.materials(id,name,category,unit) values(m,'Preserved material','Test','kg');
  insert into public.recipes(id,name,yield_quantity,yield_unit) values(r,'Preserved product',1,'unit');
  perform public.save_daily_material_use(null,gen_random_uuid(),'2026-10-21',m,'PRESERVED-LOT','2026-10-30',array[r],'test','Test','Preserved supplier');
end $$;
SQL
run_setup
docker exec -i "$rmt_container" psql -U postgres -d "$rmt_test_db" -v ON_ERROR_STOP=1 <<'SQL'
do $$
begin
  if (select count(*) from public.daily_material_uses) <> 1 then raise exception 'Setup changed existing records'; end if;
  if not exists(select 1 from public.daily_material_uses where lot_code='PRESERVED-LOT' and supplier='Preserved supplier' and material_name='Preserved material') then raise exception 'Setup changed recorded data'; end if;
  if (select count(*) from public.daily_material_use_products where product_name='Preserved product') <> 1 then raise exception 'Setup changed product links'; end if;
end $$;
SQL
docker exec -i "$rmt_container" psql -U postgres -d "$rmt_test_db" -v ON_ERROR_STOP=1 < "$rmt_root/supabase/tests/daily-material-uses.sql"
printf '%s\n' 'Fresh setup, repeat setup, record preservation, and daily-use checks passed.'
