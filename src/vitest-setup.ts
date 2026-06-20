import { vi } from 'vitest';
import { config } from 'dotenv';

config({ path: '.env.local' });

vi.mock('$env/static/private', () => ({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}));
