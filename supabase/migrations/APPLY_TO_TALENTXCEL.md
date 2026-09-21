# Apply UDX Core Schema to TalentXcel Database

**Project**: `dthlgsnakhoftinssokm`  
**URL**: https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/sql/new

---

## Step 1 — Open the SQL Editor

Go to:  
👉 **https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/sql/new**

---

## Step 2 — Paste and Run

Copy the full contents of:

```
supabase/migrations/20260910190000_udx_core_schema.sql
```

Paste into the editor and click **Run**.

The migration is **idempotent** — `CREATE TABLE IF NOT EXISTS`, `ON CONFLICT DO NOTHING` — safe to run multiple times with no side effects.

---

## Step 3 — Verify

After the migration runs, execute this in the SQL editor:

```sql
-- Confirm all UDX tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'udx_%'
ORDER BY table_name;

-- Confirm tenant seed
SELECT tenant_id, domain, gsc_property_id, status
FROM udx_tenants;

-- Should show:
-- talentxcel | talentxcel.in | sc-domain:talentxcel.in | ACTIVE
```

---

## Step 4 — Get Service Role Key

Go to:  
👉 **https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/settings/api**

Copy the **service_role** key (the long `eyJ...` starting with `role: service_role`).

This is `TALENTXCEL_SERVICE_ROLE_KEY` used in the sync scripts.

---

## Step 5 — Run First Sync

Once schema is applied and credentials are ready:

```bash
TALENTXCEL_SERVICE_ROLE_KEY=eyJ... \
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com \
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----" \
node scripts/run-udx-sync.cjs
```

Or with OAuth2 refresh token:

```bash
TALENTXCEL_SERVICE_ROLE_KEY=eyJ... \
GOOGLE_OAUTH_CLIENT_ID=...apps.googleusercontent.com \
GOOGLE_OAUTH_CLIENT_SECRET=... \
GOOGLE_OAUTH_REFRESH_TOKEN=... \
node scripts/run-udx-sync.cjs
```

---

## What Success Looks Like

```
╔═══════════════════════════════════════════════════════════════════╗
║                  TOP 10 OPPORTUNITIES — talentxcel.in            ║
╠═══════════════════════════════════════════════════════════════════╣
║  1. [WIN_NOW ] customer experience manager in india   Pos:   6 Imp: 12400 Score:  847 ║
║  2. [ATTACK  ] recruiter jobs in bangalore            Pos:  14 Imp:  3200 Score:  621 ║
║  3. [FIX     ] ats resume checker free                Pos:   3 Imp:  8900 Score:  598 ║
...
╚═══════════════════════════════════════════════════════════════════╝
```

Real queries from real GSC data. Zero fabrication.
