export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'quality' | 'viewer';
}

import { supabaseAdmin } from './supabase';

export async function getProfile(userId: string): Promise<User | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name, role')
    .eq('id', userId)
    .single();

  if (!data) return null;

  return { id: data.id, email: data.email, name: data.name, role: data.role as User['role'] };
}
