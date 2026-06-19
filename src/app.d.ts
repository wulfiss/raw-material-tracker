import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '$lib/server/auth';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user: User | null;
    }
  }
}

export {};
