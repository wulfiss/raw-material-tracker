import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppUser } from '$lib/server/auth';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user: AppUser | null;
    }
  }
}

export {};
