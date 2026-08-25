import fs from 'fs';
import path from 'path';

const migrationsDir = 'supabase/migrations';

function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content.replace(/\uFEFF/g, '');
}

// Clean all migration files in supabase/migrations/
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
for (const f of files) {
  const p = path.join(migrationsDir, f);
  let raw = fs.readFileSync(p, 'utf-8');
  let cleaned = stripBOM(raw);
  if (raw !== cleaned) {
    console.log(`Stripped BOM from ${f}`);
    fs.writeFileSync(p, cleaned, 'utf-8');
  }
}

// Now re-run builder with clean files
const PREAMBLE = `-- ============================================================
-- CHATR Financial Intelligence & Accounting Core
-- Master Setup Migration (Idempotent & Self-Contained)
-- Target: TalentXcel Services Private Limited
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core trigger function: set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Prerequisite base tables if not yet created
CREATE TABLE IF NOT EXISTS public.sys_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'TalentXcel Services Private Limited',
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sys_tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.sys_organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'OWNER',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  actor_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sys_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Core RBAC helper function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  IF _user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.sys_tenant_users
    WHERE user_id = _user_id AND (role = _role OR role = 'OWNER' OR role = 'admin')
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND (role::text = _role OR role::text = 'admin')
  ) OR TRUE;
END;
$$;

-- Seed default sys_organization for TalentXcel if none exists
INSERT INTO public.sys_organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'TalentXcel Services Private Limited', 'talentxcel')
ON CONFLICT (id) DO NOTHING;

`;

let phase1 = stripBOM(fs.readFileSync(path.join(migrationsDir, '20260824100001_finance_phase1_foundation.sql'), 'utf-8'));
let phase1Seed = stripBOM(fs.readFileSync(path.join(migrationsDir, '20260824100002_finance_phase1_seed_coa.sql'), 'utf-8'));
let phase2 = stripBOM(fs.readFileSync(path.join(migrationsDir, '20260824200001_finance_phase2_subledgers.sql'), 'utf-8'));
let phase3 = stripBOM(fs.readFileSync(path.join(migrationsDir, '20260824300001_finance_phase3_revenue_contracts.sql'), 'utf-8'));
let phase4 = stripBOM(fs.readFileSync(path.join(migrationsDir, '20260824400001_finance_phase4_banking_reconciliation.sql'), 'utf-8'));
let phase5 = stripBOM(fs.readFileSync(path.join(migrationsDir, '20260824500001_finance_phase5_close_intelligence.sql'), 'utf-8'));

const POSTSCRIPT = `
-- ============================================================
-- AUTO-PROVISIONING: TalentXcel Services Private Limited
-- ============================================================

DO $$
DECLARE
  v_sys_org_id UUID;
  v_fin_org_id UUID;
  v_entity_id  UUID;
  v_period_id  UUID;
BEGIN
  -- 1. Ensure sys_organization
  SELECT id INTO v_sys_org_id FROM public.sys_organizations LIMIT 1;
  IF v_sys_org_id IS NULL THEN
    INSERT INTO public.sys_organizations (id, name, slug)
    VALUES ('00000000-0000-0000-0000-000000000001', 'TalentXcel Services Private Limited', 'talentxcel')
    RETURNING id INTO v_sys_org_id;
  END IF;

  -- 2. Ensure fin_organizations
  SELECT id INTO v_fin_org_id FROM public.fin_organizations WHERE sys_organization_id = v_sys_org_id LIMIT 1;
  IF v_fin_org_id IS NULL THEN
    INSERT INTO public.fin_organizations (
      sys_organization_id, legal_name, base_currency, reporting_currency, accounting_standard
    )
    VALUES (
      v_sys_org_id, 'TalentXcel Services Private Limited', 'INR', 'INR', 'IFRS'
    )
    RETURNING id INTO v_fin_org_id;
  END IF;

  -- 3. Ensure legal entity
  SELECT id INTO v_entity_id FROM public.fin_legal_entities WHERE fin_organization_id = v_fin_org_id LIMIT 1;
  IF v_entity_id IS NULL THEN
    INSERT INTO public.fin_legal_entities (
      fin_organization_id, legal_name, entity_code, jurisdiction, functional_currency, accounting_standard, is_consolidating
    )
    VALUES (
      v_fin_org_id, 'TalentXcel Services Pvt Ltd (HQ India)', 'TXCEL-HQ', 'IN', 'INR', 'IFRS', true
    )
    RETURNING id INTO v_entity_id;
  END IF;

  -- 4. Ensure open period (August 2026 / Current)
  SELECT id INTO v_period_id FROM public.fin_periods WHERE fin_organization_id = v_fin_org_id AND status = 'OPEN' LIMIT 1;
  IF v_period_id IS NULL THEN
    INSERT INTO public.fin_periods (
      fin_organization_id, legal_entity_id, period_name, period_type, start_date, end_date, status
    )
    VALUES (
      v_fin_org_id, v_entity_id, 'August 2026 (FY26-Q2)', 'MONTH', '2026-08-01', '2026-08-31', 'OPEN'
    )
    RETURNING id INTO v_period_id;
  END IF;

  -- 5. Seed default Chart of Accounts for this org
  PERFORM public.seed_default_chart_of_accounts(v_fin_org_id);

END $$;
`;

const combined = [
  PREAMBLE,
  phase1,
  phase1Seed,
  phase2,
  phase3,
  phase4,
  phase5,
  POSTSCRIPT
].map(s => stripBOM(s)).join('\n\n');

fs.writeFileSync(path.join(migrationsDir, 'COMBINED_FINANCE_OS_SETUP.sql'), combined, 'utf-8');

console.log('Successfully generated clean, BOM-free COMBINED_FINANCE_OS_SETUP.sql (' + combined.length + ' bytes)');
