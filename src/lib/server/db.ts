import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import type { WebSocketLikeConstructor } from '@supabase/realtime-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws as unknown as WebSocketLikeConstructor }
});
