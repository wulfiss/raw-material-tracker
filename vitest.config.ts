import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';

config({ path: '.env.local' });

export default defineConfig({
  resolve: { alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'supabase/*.test.ts'],
    setupFiles: ['src/vitest-setup.ts'],
  },
});
