/**
 * Apply schema by splitting into individual statements
 * and running each via Supabase's rpc endpoint with service role
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = 'https://nsbmlujnxwfnuhnidmap.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use the Supabase Edge Functions internal admin SQL API
async function runSQL(sql) {
  // Supabase has a built-in SQL execution endpoint accessible via pg-meta
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'apikey': SERVICE_ROLE,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ sql })
  });
  return { status: res.status, body: await res.text() };
}

// Alternative: Use the Supabase DB metadata API  
async function createTableViaAPI(tableName, columns) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
    method: 'HEAD',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'apikey': SERVICE_ROLE,
    }
  });
  return res.status;
}

async function main() {
  console.log('🌱 Testing which Supabase endpoints are accessible...\n');
  
  // Test 1: Check if tables already exist via REST
  const tables = ['profiles', 'marketplace_listings', 'offer_negotiations', 'order_records'];
  let allExist = true;
  
  for (const table of tables) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=0`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE}`,
        'apikey': SERVICE_ROLE,
      }
    });
    const exists = res.status === 200;
    console.log(`   ${exists ? '✅' : '❌'} ${table}: status ${res.status}`);
    if (!exists) allExist = false;
  }

  if (allExist) {
    console.log('\n🎉 All tables already exist! Database is ready.');
    return;
  }

  console.log('\n⚠️  Some tables are missing. Please apply the schema manually:');
  console.log('');
  console.log('   1. Open: https://supabase.com/dashboard/project/nsbmlujnxwfnuhnidmap/sql/new');
  console.log('   2. Copy the contents of: supabase/schema.sql');  
  console.log('   3. Paste into the SQL editor and click "Run"');
  console.log('');
  console.log('   The schema file is at: d:\\Kheti Marketplace\\supabase\\schema.sql');

  // Print the schema for easy copy
  const schemaPath = join(__dirname, '..', 'supabase', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  console.log('\n--- SCHEMA SQL (copy this) ---');
  console.log(schema);
  console.log('--- END SCHEMA ---');
}

main().catch(console.error);
