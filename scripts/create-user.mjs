// Creates a single Supabase Auth user with a role in app_metadata.
// Usage: node scripts/create-user.mjs <email> <password> <role: admin|quality|viewer> [full name]
//
// Targets whatever SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY resolve to: .env.local for
// local dev, or export the hosted project's values inline to target production, e.g.
//   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-user.mjs ...
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const [email, password, role, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(' ') || email;
const roles = ['admin', 'quality', 'viewer'];

if (!email || !password || !roles.includes(role)) {
  console.error('Usage: node scripts/create-user.mjs <email> <password> <admin|quality|viewer> [full name]');
  process.exit(1);
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (check .env.local, or export them to target a hosted project).');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const { error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  app_metadata: { role },
  user_metadata: { full_name: name }
});

if (error) {
  console.error(`Failed to create ${email}:`, error.message);
  process.exit(1);
}

console.log(`Created ${email} (${role}) against ${SUPABASE_URL}.`);
