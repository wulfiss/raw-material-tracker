import { error } from '@sveltejs/kit';
import { getT } from '$lib/i18n';
import type { AppUser, Role } from './auth';

export function requireRole(user: AppUser, allowed: Role[]): void {
  if (!allowed.includes(user.role)) {
    const t = getT();
    throw error(403, t.errors.forbidden);
  }
}
