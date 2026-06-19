import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

let _admin: SupabaseClient | null = null;

function getAdmin() {
  if (_admin) return _admin;

  const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL;
  const serviceKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
    );
  }

  _admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  return _admin;
}

export const supabaseAdmin = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop) {
    return (getAdmin() as any)[prop];
  }
});
