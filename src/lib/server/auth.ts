import type { User } from '@supabase/supabase-js';

export type Role = 'admin' | 'quality' | 'viewer';

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

const roles: Role[] = ['admin', 'quality', 'viewer'];

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && roles.includes(value as Role);
}

export function toAppUser(user: User): AppUser {
  const rawRole = user.app_metadata?.role;
  return {
    id: user.id,
    email: user.email ?? '',
    name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? '',
    role: isRole(rawRole) ? rawRole : 'viewer'
  };
}
