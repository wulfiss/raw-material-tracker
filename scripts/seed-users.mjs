// Creates the demo Supabase Auth accounts used by local development.
// Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (see .env.local) and a running Supabase stack.
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (check .env.local).');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const demoUsers = [
  { email: 'admin@example.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'qa@example.com', password: 'qa123', role: 'quality', name: 'Quality User' },
  { email: 'viewer@example.com', password: 'viewer123', role: 'viewer', name: 'Viewer User' }
];

for (const { email, password, role, name } of demoUsers) {
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: { full_name: name }
  });

  if (error && !error.message.includes('already been registered')) {
    console.error(`Failed to create ${email}:`, error.message);
    process.exitCode = 1;
    continue;
  }

  console.log(error ? `${email} already exists, skipping.` : `Created ${email} (${role}).`);
}
