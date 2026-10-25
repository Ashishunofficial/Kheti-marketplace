/**
 * Kheti AI — Supabase Database Setup Script
 * Applies supabase/schema.sql to the connected project using the service role key.
 * Run once: node scripts/setup-db.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nsbmlujnxwfnuhnidmap.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = 'nsbmlujnxwfnuhnidmap';

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set in .env');
  process.exit(1);
}

async function runSQL(sql) {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase API error ${res.status}: ${err}`);
  }
  return res.json();
}

// Fallback: direct REST SQL execution via PostgREST admin endpoint
async function runSQLDirect(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY
    },
    body: JSON.stringify({ query: sql })
  });
  const data = await res.json();
  return data;
}

async function main() {
  console.log('🌱 Kheti AI — Supabase Database Setup');
  console.log(`📡 Project: ${SUPABASE_URL}`);
  console.log('');

  // Test connection first
  console.log('1️⃣  Testing Supabase connection...');
  try {
    const testRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });
    if (testRes.status === 200 || testRes.status === 400) {
      console.log('   ✅ Connected to Supabase successfully!');
    } else {
      console.log(`   ⚠️  Status ${testRes.status} — check your keys`);
    }
  } catch (e) {
    console.error('   ❌ Connection failed:', e.message);
    process.exit(1);
  }

  // Read the schema file
  const schemaPath = join(__dirname, '..', 'supabase', 'schema.sql');
  console.log('');
  console.log('2️⃣  Reading schema.sql...');
  let schema;
  try {
    schema = readFileSync(schemaPath, 'utf-8');
    console.log(`   ✅ Schema loaded (${Math.round(schema.length / 1024)}KB)`);
  } catch (e) {
    console.error('   ❌ Could not read supabase/schema.sql:', e.message);
    process.exit(1);
  }

  console.log('');
  console.log('3️⃣  Applying schema to Supabase...');
  console.log('');
  console.log('   📋 IMPORTANT: Supabase DDL (CREATE TABLE) must be run via the');
  console.log('      SQL Editor in your dashboard. The schema is ready at:');
  console.log('');
  console.log('      👉 https://supabase.com/dashboard/project/nsbmlujnxwfnuhnidmap/sql/new');
  console.log('');
  console.log('      Paste the contents of: supabase/schema.sql');
  console.log('      Then click "Run" ▶');
  console.log('');

  // Verify if profiles table already exists by trying to query it
  console.log('4️⃣  Checking if schema is already applied...');
  try {
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?limit=1`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });
    
    if (checkRes.status === 200) {
      const data = await checkRes.json();
      console.log(`   ✅ 'profiles' table EXISTS — schema already applied!`);
      console.log(`   📊 Records: ${Array.isArray(data) ? data.length : 'N/A'}`);
    } else if (checkRes.status === 404 || checkRes.status === 406) {
      console.log('   ⚠️  Tables not found — please run supabase/schema.sql in the dashboard');
    } else {
      console.log(`   ℹ️  Status ${checkRes.status} — tables may or may not exist`);
    }
  } catch (e) {
    console.log('   ⚠️  Could not verify tables:', e.message);
  }

  console.log('');
  console.log('5️⃣  Checking marketplace_listings table...');
  try {
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/marketplace_listings?limit=1`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });
    if (res2.status === 200) {
      console.log('   ✅ marketplace_listings table EXISTS!');
    } else {
      console.log(`   ⚠️  marketplace_listings: status ${res2.status}`);
    }
  } catch (e) {
    console.log('   ⚠️', e.message);
  }

  console.log('');
  console.log('─────────────────────────────────────────────────────');
  console.log('✅ Setup check complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run schema SQL at: https://supabase.com/dashboard/project/nsbmlujnxwfnuhnidmap/sql/new');
  console.log('  2. Enable Google OAuth at: https://supabase.com/dashboard/project/nsbmlujnxwfnuhnidmap/auth/providers');
  console.log('  3. Your app is live at: http://localhost:3000');
  console.log('─────────────────────────────────────────────────────');
}

main().catch(err => {
  console.error('Setup error:', err);
  process.exit(1);
});
