#!/usr/bin/env node
/**
 * UDX Core Schema Migration — Applied directly to TalentXcel Supabase
 * Database: dthlgsnakhoftinssokm (talentxcel.in production)
 *
 * Run: node scripts/apply-udx-migration-talentxcel.cjs
 *
 * Requires TALENTXCEL_SERVICE_ROLE_KEY in environment.
 * Obtain from: supabase.com/dashboard → Project dthlgsnakhoftinssokm → Settings → API
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const TX_SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const TX_SERVICE_ROLE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY;

if (!TX_SERVICE_ROLE_KEY) {
  console.error('');
  console.error('❌  TALENTXCEL_SERVICE_ROLE_KEY is not set.');
  console.error('');
  console.error('   Get it from: https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/settings/api');
  console.error('   Then run:');
  console.error('   TALENTXCEL_SERVICE_ROLE_KEY=eyJ... node scripts/apply-udx-migration-talentxcel.cjs');
  console.error('');
  process.exit(1);
}

const supabase = createClient(TX_SUPABASE_URL, TX_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const MIGRATION_FILE = path.join(__dirname, '..', 'supabase', 'migrations', '20260910190000_udx_core_schema.sql');

async function applyMigration() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  UDX Core Schema → TalentXcel (dthlgsnakhoftinssokm)  ');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // Step 1: Verify connection and existing schema
  console.log('▶  Step 1: Verifying connection to TalentXcel database...');
  const { data: jobsTest, error: jobsErr } = await supabase
    .from('jobs')
    .select('id')
    .limit(1);

  if (jobsErr) {
    console.error('❌  Cannot connect to TalentXcel database:', jobsErr.message);
    process.exit(1);
  }
  console.log('✅  Connected. jobs table exists with real data.');

  // Step 2: Check if UDX schema already applied
  console.log('▶  Step 2: Checking if UDX schema already applied...');
  const { error: udxCheck } = await supabase
    .from('udx_tenants')
    .select('tenant_id')
    .limit(1);

  if (!udxCheck) {
    console.log('ℹ   UDX schema already exists. Checking tenant seed...');
    const { data: tenants } = await supabase
      .from('udx_tenants')
      .select('tenant_id, domain, status');
    console.log('   Existing tenants:', JSON.stringify(tenants, null, 2));

    // Re-seed in case talentxcel tenant is missing
    const { error: seedErr } = await supabase
      .from('udx_tenants')
      .upsert([
        { tenant_id: 'talentxcel', tenant_name: 'TalentXcel Services Pvt Ltd', domain: 'talentxcel.in', gsc_property_id: 'sc-domain:talentxcel.in', status: 'ACTIVE' },
        { tenant_id: 'chatr', tenant_name: 'CHATR', domain: 'chatrchat.in', gsc_property_id: 'sc-domain:chatrchat.in', status: 'ACTIVE' }
      ], { onConflict: 'tenant_id', ignoreDuplicates: true });

    if (seedErr) {
      console.warn('⚠  Seed error (non-fatal):', seedErr.message);
    } else {
      console.log('✅  Tenant seed confirmed.');
    }
    console.log('');
    console.log('✅  UDX schema is already in place. Nothing to migrate.');
    return;
  }

  // Step 3: Read migration SQL
  console.log('▶  Step 3: Reading migration file...');
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error('❌  Migration file not found:', MIGRATION_FILE);
    process.exit(1);
  }

  const sql = fs.readFileSync(MIGRATION_FILE, 'utf-8');
  console.log(`✅  Migration file loaded (${(sql.length / 1024).toFixed(1)} KB, ${sql.split('\n').length} lines)`);

  // Step 4: Execute migration via Supabase RPC (exec_sql)
  // Note: Supabase anon key cannot run DDL. Service role can via pg_query or REST.
  // We'll split into individual DDL statements and execute via rpc if available,
  // otherwise provide instructions for manual execution.
  console.log('▶  Step 4: Applying migration...');
  console.log('');

  // Try calling exec_sql RPC if it exists
  const { data: rpcTest, error: rpcErr } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });

  if (!rpcErr) {
    // exec_sql function exists — apply full migration
    const { error: migErr } = await supabase.rpc('exec_sql', { sql });
    if (migErr) {
      console.error('❌  Migration failed:', migErr.message);
      console.log('');
      console.log('   Manual fallback — paste the SQL below into Supabase SQL Editor:');
      console.log(`   https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/sql`);
      process.exit(1);
    }
    console.log('✅  Migration applied via exec_sql RPC.');
  } else {
    // No exec_sql — provide the SQL editor URL
    console.log('');
    console.log('⚠  exec_sql RPC not available. Apply the migration manually:');
    console.log('');
    console.log('   1. Open: https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/sql/new');
    console.log('   2. Paste the contents of:');
    console.log(`      ${MIGRATION_FILE}`);
    console.log('   3. Click "Run"');
    console.log('');
    console.log('   The migration is idempotent — safe to run multiple times.');

    // Write a compact reminder file
    const reminderPath = path.join(__dirname, '..', 'supabase', 'migrations', 'APPLY_TO_TALENTXCEL.md');
    fs.writeFileSync(reminderPath, `# Apply UDX Migration to TalentXcel

**Target**: https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/sql/new

**File**: \`supabase/migrations/20260910190000_udx_core_schema.sql\`

Copy and paste the full SQL into the editor and click Run.

The migration is idempotent (CREATE TABLE IF NOT EXISTS, ON CONFLICT DO NOTHING).
Safe to run multiple times.

After applying, verify with:
\`\`\`sql
SELECT tenant_id, domain, status FROM udx_tenants;
SELECT COUNT(*) FROM udx_demand_entities;
\`\`\`
`);
    console.log(`   Reminder saved to: supabase/migrations/APPLY_TO_TALENTXCEL.md`);
    return;
  }

  // Step 5: Seed tenant data
  console.log('▶  Step 5: Seeding tenant data...');
  const { error: seedErr } = await supabase
    .from('udx_tenants')
    .upsert([
      {
        tenant_id: 'talentxcel',
        tenant_name: 'TalentXcel Services Pvt Ltd',
        domain: 'talentxcel.in',
        gsc_property_id: 'sc-domain:talentxcel.in',
        status: 'ACTIVE'
      }
    ], { onConflict: 'tenant_id', ignoreDuplicates: false });

  if (seedErr) {
    console.warn('⚠  Seed error (non-fatal):', seedErr.message);
  } else {
    console.log('✅  TalentXcel tenant seeded.');
  }

  // Step 6: Verify
  console.log('▶  Step 6: Verifying UDX schema...');
  const tables = ['udx_tenants', 'udx_demand_entities', 'udx_opportunities', 'udx_experiments', 'udx_search_memory', 'udx_audit_log'];
  let allOk = true;

  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0);
    if (error) {
      console.error(`   ❌  ${table}: ${error.message}`);
      allOk = false;
    } else {
      console.log(`   ✅  ${table}`);
    }
  }

  console.log('');
  if (allOk) {
    console.log('════════════════════════════════════════════════════');
    console.log('  ✅  UDX Core Schema applied to TalentXcel DB     ');
    console.log('════════════════════════════════════════════════════');
    console.log('');
    console.log('  Next steps:');
    console.log('  1. Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    console.log('     in your server environment');
    console.log('  2. Run the GSC sync:');
    console.log('     TALENTXCEL_SERVICE_ROLE_KEY=... node scripts/run-udx-sync.cjs');
    console.log('  3. Watch udx_demand_entities populate with real talentxcel.in GSC data');
    console.log('');
  } else {
    console.log('⚠  Some tables failed. Check error messages above.');
  }
}

applyMigration().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
