-- ============================================================
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
  name TEXT DEFAULT 'TalentXcel Services Private Limited',
  slug TEXT,
  owner_id UUID,
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


-- ============================================================
-- CHATR Financial Intelligence & Accounting Core
-- Phase 1: Financial Foundation
-- 20260824100001_finance_phase1_foundation.sql
-- IFRS+GAAP, multi-currency, multi-entity, source lineage, idempotency
-- ============================================================

-- 1. FIN_ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.fin_organizations (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sys_organization_id         UUID NOT NULL REFERENCES sys_organizations(id) ON DELETE CASCADE,
  legal_name                  TEXT NOT NULL,
  timezone                    TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  fiscal_year_start_month     INTEGER NOT NULL DEFAULT 4 CHECK (fiscal_year_start_month BETWEEN 1 AND 12),
  fiscal_year_start_day       INTEGER NOT NULL DEFAULT 1,
  base_currency               CHAR(3) NOT NULL DEFAULT 'INR',
  reporting_currency          CHAR(3) NOT NULL DEFAULT 'INR',
  multi_currency_enabled      BOOLEAN NOT NULL DEFAULT true,
  accounting_standard         TEXT NOT NULL DEFAULT 'IFRS' CHECK (accounting_standard IN ('IFRS','US_GAAP','BOTH')),
  approval_threshold_amount   NUMERIC(20,4) NOT NULL DEFAULT 100000.00,
  approval_threshold_currency CHAR(3) NOT NULL DEFAULT 'INR',
  mandatory_hitl_operations   JSONB NOT NULL DEFAULT '["payment_initiation","bank_account_change","accounting_policy_change","closed_period_posting","revenue_recognition_override","tax_adjustment","cash_affecting_manual_journal","revenue_affecting_manual_journal","intercompany_adjustment","write_off","high_risk_ai_action","coa_structure_change"]',
  settings                    JSONB NOT NULL DEFAULT '{}',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_org_sys_unique UNIQUE (sys_organization_id)
);
ALTER TABLE public.fin_organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_org_view" ON public.fin_organizations FOR SELECT USING (sys_organization_id IN (SELECT organization_id FROM sys_tenant_users WHERE user_id = auth.uid()));
CREATE POLICY "fin_org_admin" ON public.fin_organizations FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_fin_org_upd BEFORE UPDATE ON public.fin_organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_org_sys ON public.fin_organizations(sys_organization_id);

-- 2. FIN_LEGAL_ENTITIES
CREATE TABLE IF NOT EXISTS public.fin_legal_entities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_name          TEXT NOT NULL,
  entity_code         TEXT NOT NULL,
  jurisdiction        TEXT NOT NULL DEFAULT 'IN',
  registration_number TEXT,
  functional_currency CHAR(3) NOT NULL DEFAULT 'INR',
  accounting_standard TEXT NOT NULL DEFAULT 'IFRS' CHECK (accounting_standard IN ('IFRS','US_GAAP','BOTH')),
  is_consolidating    BOOLEAN NOT NULL DEFAULT false,
  parent_entity_id    UUID REFERENCES public.fin_legal_entities(id),
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_le_code_unique UNIQUE (fin_organization_id, entity_code)
);
ALTER TABLE public.fin_legal_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_le_view" ON public.fin_legal_entities FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_le_admin" ON public.fin_legal_entities FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_fin_le_upd BEFORE UPDATE ON public.fin_legal_entities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_le_org ON public.fin_legal_entities(fin_organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_fin_le_parent ON public.fin_legal_entities(parent_entity_id) WHERE parent_entity_id IS NOT NULL;

-- 3. FIN_ACCOUNTS (Chart of Accounts)
CREATE TABLE IF NOT EXISTS public.fin_accounts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id      UUID REFERENCES public.fin_legal_entities(id),
  code                 TEXT NOT NULL,
  name                 TEXT NOT NULL,
  description          TEXT,
  account_type         TEXT NOT NULL CHECK (account_type IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE','CONTRA_ASSET','CONTRA_LIABILITY','CONTRA_REVENUE','CONTRA_EXPENSE')),
  account_subtype      TEXT,
  normal_balance       TEXT NOT NULL CHECK (normal_balance IN ('DEBIT','CREDIT')),
  parent_account_id    UUID REFERENCES public.fin_accounts(id),
  depth                INTEGER NOT NULL DEFAULT 0,
  accounting_standard  TEXT CHECK (accounting_standard IN ('IFRS','US_GAAP','BOTH')),
  is_active            BOOLEAN NOT NULL DEFAULT true,
  allow_direct_posting BOOLEAN NOT NULL DEFAULT true,
  is_system_account    BOOLEAN NOT NULL DEFAULT false,
  require_dimensions   JSONB DEFAULT '[]',
  tags                 JSONB DEFAULT '[]',
  fs_mapping           TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_acc_code_unique UNIQUE (fin_organization_id, legal_entity_id, code)
);
ALTER TABLE public.fin_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_acc_view" ON public.fin_accounts FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_acc_admin" ON public.fin_accounts FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_fin_acc_upd BEFORE UPDATE ON public.fin_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_acc_type ON public.fin_accounts(fin_organization_id, account_type, is_active);
CREATE INDEX IF NOT EXISTS idx_fin_acc_parent ON public.fin_accounts(parent_account_id) WHERE parent_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fin_acc_code ON public.fin_accounts(fin_organization_id, code);

-- 4. FIN_PERIODS
CREATE TABLE IF NOT EXISTS public.fin_periods (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id     UUID REFERENCES public.fin_legal_entities(id),
  period_name         TEXT NOT NULL,
  period_type         TEXT NOT NULL CHECK (period_type IN ('MONTH','QUARTER','YEAR','CUSTOM')),
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  status              TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','SOFT_CLOSED','CLOSED','REOPENED')),
  closed_at           TIMESTAMPTZ,
  closed_by           UUID REFERENCES auth.users(id),
  soft_closed_at      TIMESTAMPTZ,
  soft_closed_by      UUID REFERENCES auth.users(id),
  reopened_at         TIMESTAMPTZ,
  reopened_by         UUID REFERENCES auth.users(id),
  reopen_approval_id  UUID REFERENCES public.workflow_approvals(id),
  reopen_reason       TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_period_date_order CHECK (end_date >= start_date),
  CONSTRAINT fin_period_unique UNIQUE (fin_organization_id, legal_entity_id, start_date, period_type)
);
ALTER TABLE public.fin_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_period_view" ON public.fin_periods FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_period_admin" ON public.fin_periods FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_fin_period_upd BEFORE UPDATE ON public.fin_periods FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_period_status ON public.fin_periods(fin_organization_id, status, start_date);

-- 5. FIN_EVENTS (append-only, idempotency_key unique)
CREATE TABLE IF NOT EXISTS public.fin_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key     TEXT NOT NULL,
  event_type          TEXT NOT NULL,
  event_version       TEXT NOT NULL DEFAULT '1.0',
  source_system       TEXT NOT NULL,
  source_object_type  TEXT,
  source_object_id    TEXT,
  fin_organization_id UUID NOT NULL REFERENCES public.fin_organizations(id),
  legal_entity_id     UUID REFERENCES public.fin_legal_entities(id),
  correlation_id      TEXT,
  causation_id        TEXT,
  payload             JSONB NOT NULL DEFAULT '{}',
  schema_version      TEXT NOT NULL DEFAULT '1.0',
  processing_status   TEXT NOT NULL DEFAULT 'PENDING' CHECK (processing_status IN ('PENDING','PROCESSING','POSTED','FAILED','SKIPPED')),
  processed_at        TIMESTAMPTZ,
  error_detail        TEXT,
  retry_count         INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_events_idempotency_unique UNIQUE (idempotency_key)
);
ALTER TABLE public.fin_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_events_view" ON public.fin_events FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_events_insert" ON public.fin_events FOR INSERT WITH CHECK (true);
CREATE OR REPLACE FUNCTION public.fin_events_no_delete() RETURNS TRIGGER AS $fn$ BEGIN RAISE EXCEPTION 'fin_events is append-only. DELETE prohibited.'; END; $fn$ LANGUAGE plpgsql;
CREATE TRIGGER trg_fin_events_no_delete BEFORE DELETE ON public.fin_events FOR EACH ROW EXECUTE FUNCTION public.fin_events_no_delete();
CREATE INDEX IF NOT EXISTS idx_fin_events_org ON public.fin_events(fin_organization_id, event_type, processing_status);
CREATE INDEX IF NOT EXISTS idx_fin_events_src ON public.fin_events(source_system, source_object_type, source_object_id);
CREATE INDEX IF NOT EXISTS idx_fin_events_corr ON public.fin_events(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fin_events_pend ON public.fin_events(processing_status, created_at) WHERE processing_status IN ('PENDING','FAILED');

-- 6. FIN_ACCOUNTING_POLICIES (versioned, effective-dated)
CREATE TABLE IF NOT EXISTS public.fin_accounting_policies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id     UUID REFERENCES public.fin_legal_entities(id),
  policy_type         TEXT NOT NULL CHECK (policy_type IN ('REVENUE','EXPENSE','CAPITALIZATION','DEPRECIATION','ACCRUAL','TAX','APPROVAL','ALLOCATION','ENTITY_MAPPING','CURRENCY_CONVERSION','DEFERRED_REVENUE','RECOGNITION','INTERCOMPANY')),
  name                TEXT NOT NULL,
  description         TEXT,
  version             INTEGER NOT NULL DEFAULT 1,
  accounting_standard TEXT NOT NULL CHECK (accounting_standard IN ('IFRS','US_GAAP','BOTH')),
  effective_from      DATE NOT NULL,
  effective_to        DATE,
  status              TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','ACTIVE','SUPERSEDED','ARCHIVED')),
  rule_definition     JSONB NOT NULL DEFAULT '{}',
  author_id           UUID NOT NULL REFERENCES auth.users(id),
  approved_by         UUID REFERENCES auth.users(id),
  approved_at         TIMESTAMPTZ,
  approval_id         UUID REFERENCES public.workflow_approvals(id),
  supersedes_id       UUID REFERENCES public.fin_accounting_policies(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_accounting_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_policy_view" ON public.fin_accounting_policies FOR SELECT USING (status IN ('ACTIVE','SUPERSEDED') AND fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_policy_admin" ON public.fin_accounting_policies FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.fin_policy_audit_fn() RETURNS TRIGGER AS $fn$ BEGIN INSERT INTO public.audit_logs(organization_id,actor_id,action,resource_type,resource_id,details) SELECT fo.sys_organization_id,auth.uid(),TG_OP,'fin_accounting_policy',NEW.id::text,jsonb_build_object('old_status',CASE WHEN TG_OP='UPDATE' THEN OLD.status ELSE NULL END,'new_status',NEW.status,'policy_type',NEW.policy_type,'version',NEW.version) FROM public.fin_organizations fo WHERE fo.id=NEW.fin_organization_id; RETURN NEW; END; $fn$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_fin_policy_audit AFTER INSERT OR UPDATE ON public.fin_accounting_policies FOR EACH ROW EXECUTE FUNCTION public.fin_policy_audit_fn();
CREATE TRIGGER trg_fin_policy_upd BEFORE UPDATE ON public.fin_accounting_policies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_policy_org ON public.fin_accounting_policies(fin_organization_id, policy_type, status, effective_from);

-- 7. FIN_ACCOUNT_MAPPINGS
CREATE TABLE IF NOT EXISTS public.fin_account_mappings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id     UUID REFERENCES public.fin_legal_entities(id),
  event_type          TEXT NOT NULL,
  event_subtype       TEXT,
  accounting_standard TEXT NOT NULL CHECK (accounting_standard IN ('IFRS','US_GAAP','BOTH')),
  debit_account_id    UUID NOT NULL REFERENCES public.fin_accounts(id),
  credit_account_id   UUID NOT NULL REFERENCES public.fin_accounts(id),
  conditions          JSONB NOT NULL DEFAULT '{}',
  policy_id           UUID REFERENCES public.fin_accounting_policies(id),
  priority            INTEGER NOT NULL DEFAULT 100,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_account_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_map_view" ON public.fin_account_mappings FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_map_admin" ON public.fin_account_mappings FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_fin_map_upd BEFORE UPDATE ON public.fin_account_mappings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_map_event ON public.fin_account_mappings(fin_organization_id, event_type, is_active, priority);

-- 8. FIN_FX_RATES
CREATE TABLE IF NOT EXISTS public.fin_fx_rates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  from_currency       CHAR(3) NOT NULL,
  to_currency         CHAR(3) NOT NULL,
  rate                NUMERIC(20,10) NOT NULL CHECK (rate > 0),
  rate_type           TEXT NOT NULL DEFAULT 'SPOT' CHECK (rate_type IN ('SPOT','AVERAGE','CLOSING','HISTORICAL','BUDGET')),
  effective_date      DATE NOT NULL,
  source              TEXT NOT NULL DEFAULT 'manual',
  notes               TEXT,
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_fx_unique UNIQUE (fin_organization_id, from_currency, to_currency, rate_type, effective_date)
);
ALTER TABLE public.fin_fx_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_fx_view" ON public.fin_fx_rates FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_fx_admin" ON public.fin_fx_rates FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_fin_fx ON public.fin_fx_rates(fin_organization_id, from_currency, to_currency, rate_type, effective_date DESC);

-- 9. FIN_JOURNAL_ENTRIES (double-entry header + full source lineage)
CREATE TABLE IF NOT EXISTS public.fin_journal_entries (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id),
  legal_entity_id      UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  period_id            UUID NOT NULL REFERENCES public.fin_periods(id),
  entry_number         TEXT NOT NULL,
  posting_date         DATE NOT NULL,
  transaction_currency CHAR(3) NOT NULL,
  functional_currency  CHAR(3) NOT NULL,
  reporting_currency   CHAR(3) NOT NULL DEFAULT 'INR',
  fx_rate              NUMERIC(20,10) NOT NULL DEFAULT 1.0,
  fx_rate_functional   NUMERIC(20,10) NOT NULL DEFAULT 1.0,
  fx_rate_reporting    NUMERIC(20,10) NOT NULL DEFAULT 1.0,
  fx_rate_source       TEXT NOT NULL DEFAULT 'manual',
  fx_date              DATE,
  source_event_id      UUID REFERENCES public.fin_events(id),
  source_type          TEXT NOT NULL,
  source_id            TEXT,
  source_url           TEXT,
  entry_type           TEXT NOT NULL DEFAULT 'STANDARD' CHECK (entry_type IN ('STANDARD','REVERSAL','CORRECTING','ADJUSTMENT','ACCRUAL','PREPAID','DEPRECIATION','AMORTIZATION','INTERCOMPANY','CLOSING','OPENING','RESTATEMENT','REVENUE_RECOGNITION','BANK_RECONCILIATION','FX_REVALUATION')),
  accounting_standard  TEXT NOT NULL CHECK (accounting_standard IN ('IFRS','US_GAAP','BOTH')),
  policy_version_id    UUID REFERENCES public.fin_accounting_policies(id),
  status               TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PENDING_APPROVAL','POSTED','REVERSED','VOID')),
  reversal_of_id       UUID REFERENCES public.fin_journal_entries(id),
  reversed_by_id       UUID REFERENCES public.fin_journal_entries(id),
  reversal_date        DATE,
  approval_id          UUID REFERENCES public.workflow_approvals(id),
  approved_by          UUID REFERENCES auth.users(id),
  approved_at          TIMESTAMPTZ,
  memo                 TEXT,
  reference            TEXT,
  tags                 JSONB DEFAULT '[]',
  ai_proposed          BOOLEAN NOT NULL DEFAULT false,
  ai_confidence        NUMERIC(5,4),
  ai_rationale         TEXT,
  created_by           UUID NOT NULL REFERENCES auth.users(id),
  posted_by            UUID REFERENCES auth.users(id),
  posted_at            TIMESTAMPTZ,
  voided_by            UUID REFERENCES auth.users(id),
  voided_at            TIMESTAMPTZ,
  void_reason          TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_je_num_unique UNIQUE (fin_organization_id, entry_number)
);
ALTER TABLE public.fin_journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_je_view" ON public.fin_journal_entries FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_je_insert" ON public.fin_journal_entries FOR INSERT WITH CHECK (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()) AND status='DRAFT' AND created_by=auth.uid());
CREATE POLICY "fin_je_update" ON public.fin_journal_entries FOR UPDATE USING (created_by=auth.uid() AND status='DRAFT') WITH CHECK (status IN ('DRAFT','PENDING_APPROVAL'));
CREATE TRIGGER trg_fin_je_upd BEFORE UPDATE ON public.fin_journal_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_je_org ON public.fin_journal_entries(fin_organization_id, status, posting_date DESC);
CREATE INDEX IF NOT EXISTS idx_fin_je_entity ON public.fin_journal_entries(legal_entity_id, period_id, status);
CREATE INDEX IF NOT EXISTS idx_fin_je_srcevent ON public.fin_journal_entries(source_event_id) WHERE source_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fin_je_srctype ON public.fin_journal_entries(source_type, source_id) WHERE source_id IS NOT NULL;

-- 10. FIN_JOURNAL_LINES
CREATE TABLE IF NOT EXISTS public.fin_journal_lines (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.fin_journal_entries(id) ON DELETE CASCADE,
  line_number      INTEGER NOT NULL,
  account_id       UUID NOT NULL REFERENCES public.fin_accounts(id),
  debit_amount     NUMERIC(20,4) NOT NULL DEFAULT 0 CHECK (debit_amount >= 0),
  credit_amount    NUMERIC(20,4) NOT NULL DEFAULT 0 CHECK (credit_amount >= 0),
  currency         CHAR(3) NOT NULL,
  functional_debit NUMERIC(20,4) NOT NULL DEFAULT 0,
  functional_credit NUMERIC(20,4) NOT NULL DEFAULT 0,
  reporting_debit  NUMERIC(20,4) NOT NULL DEFAULT 0,
  reporting_credit NUMERIC(20,4) NOT NULL DEFAULT 0,
  legal_entity_id  UUID REFERENCES public.fin_legal_entities(id),
  department_id    UUID REFERENCES public.sys_departments(id),
  project_id       TEXT,
  cost_center      TEXT,
  customer_id      UUID,
  vendor_id        UUID,
  contract_id      UUID,
  memo             TEXT,
  CONSTRAINT fin_jl_dr_cr CHECK ((debit_amount > 0 AND credit_amount = 0) OR (credit_amount > 0 AND debit_amount = 0)),
  CONSTRAINT fin_jl_line_unique UNIQUE (journal_entry_id, line_number)
);
ALTER TABLE public.fin_journal_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_jl_view" ON public.fin_journal_lines FOR SELECT USING (journal_entry_id IN (SELECT je.id FROM fin_journal_entries je JOIN fin_organizations fo ON fo.id=je.fin_organization_id JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_jl_insert" ON public.fin_journal_lines FOR INSERT WITH CHECK (journal_entry_id IN (SELECT je.id FROM fin_journal_entries je WHERE je.status='DRAFT' AND je.created_by=auth.uid()));
CREATE INDEX IF NOT EXISTS idx_fin_jl_entry ON public.fin_journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_fin_jl_acc ON public.fin_journal_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_fin_jl_dept ON public.fin_journal_lines(department_id) WHERE department_id IS NOT NULL;

-- 11. ACCOUNTING INVARIANT TRIGGERS

-- Period lock: prevent posting into CLOSED periods
CREATE OR REPLACE FUNCTION public.fin_enforce_period_lock() RETURNS TRIGGER AS $fn$
DECLARE v_status TEXT;
BEGIN
  IF NEW.status = 'POSTED' AND (OLD.status IS NULL OR OLD.status != 'POSTED') THEN
    SELECT status INTO v_status FROM public.fin_periods WHERE id = NEW.period_id;
    IF v_status = 'CLOSED' THEN
      RAISE EXCEPTION 'Cannot post into CLOSED period (%). Reopen via workflow approval.', NEW.period_id;
    END IF;
    IF v_status = 'SOFT_CLOSED' AND NEW.entry_type NOT IN ('ADJUSTMENT','CORRECTING','CLOSING','RESTATEMENT') THEN
      RAISE EXCEPTION 'Period is SOFT_CLOSED. Only ADJUSTMENT/CORRECTING/CLOSING/RESTATEMENT allowed.';
    END IF;
  END IF;
  RETURN NEW;
END; $fn$ LANGUAGE plpgsql;
CREATE TRIGGER trg_fin_period_lock BEFORE UPDATE ON public.fin_journal_entries FOR EACH ROW EXECUTE FUNCTION public.fin_enforce_period_lock();

-- Double-entry balance: SUM(functional_debit) = SUM(functional_credit) on POSTED
CREATE OR REPLACE FUNCTION public.fin_enforce_double_entry() RETURNS TRIGGER AS $fn$
DECLARE v_dr NUMERIC(20,4); v_cr NUMERIC(20,4); v_cnt INTEGER;
BEGIN
  IF NEW.status = 'POSTED' AND (OLD.status IS NULL OR OLD.status != 'POSTED') THEN
    SELECT COALESCE(SUM(functional_debit),0), COALESCE(SUM(functional_credit),0), COUNT(*)
    INTO v_dr, v_cr, v_cnt FROM public.fin_journal_lines WHERE journal_entry_id = NEW.id;
    IF v_cnt < 2 THEN RAISE EXCEPTION 'Journal entry % must have at least 2 lines.', NEW.entry_number; END IF;
    IF ABS(v_dr - v_cr) > 0.01 THEN
      RAISE EXCEPTION 'Double-entry violated for % (%). Dr=% Cr=% Diff=%.', NEW.entry_number, NEW.id, v_dr, v_cr, ABS(v_dr-v_cr);
    END IF;
  END IF;
  RETURN NEW;
END; $fn$ LANGUAGE plpgsql;
CREATE TRIGGER trg_fin_double_entry BEFORE UPDATE ON public.fin_journal_entries FOR EACH ROW EXECUTE FUNCTION public.fin_enforce_double_entry();

-- Posting immutability: POSTED entries can only transition to REVERSED
CREATE OR REPLACE FUNCTION public.fin_posting_immutability() RETURNS TRIGGER AS $fn$
BEGIN
  IF OLD.status = 'POSTED' AND NEW.status NOT IN ('REVERSED') THEN
    RAISE EXCEPTION 'Posted journal entry % is immutable. Use reversal.', OLD.entry_number;
  END IF;
  RETURN NEW;
END; $fn$ LANGUAGE plpgsql;
CREATE TRIGGER trg_fin_immutable BEFORE UPDATE ON public.fin_journal_entries FOR EACH ROW WHEN (OLD.status = 'POSTED') EXECUTE FUNCTION public.fin_posting_immutability();

-- Journal line immutability: cannot modify lines of POSTED/REVERSED entries
CREATE OR REPLACE FUNCTION public.fin_line_immutability() RETURNS TRIGGER AS $fn$
DECLARE v_status TEXT;
BEGIN
  SELECT status INTO v_status FROM public.fin_journal_entries WHERE id = COALESCE(OLD.journal_entry_id, NEW.journal_entry_id);
  IF v_status IN ('POSTED','REVERSED') THEN
    RAISE EXCEPTION 'Cannot modify lines of a % entry. Use reversal.', v_status;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $fn$ LANGUAGE plpgsql;
CREATE TRIGGER trg_fin_line_immutable BEFORE UPDATE OR DELETE ON public.fin_journal_lines FOR EACH ROW EXECUTE FUNCTION public.fin_line_immutability();

-- Audit on journal entry status change
CREATE OR REPLACE FUNCTION public.fin_je_audit() RETURNS TRIGGER AS $fn$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.audit_logs(organization_id,actor_id,action,resource_type,resource_id,details)
    SELECT fo.sys_organization_id, auth.uid(), 'STATUS_CHANGE', 'fin_journal_entry', NEW.id::text,
      jsonb_build_object('entry_number',NEW.entry_number,'from_status',OLD.status,'to_status',NEW.status,
        'posting_date',NEW.posting_date,'source_event_id',NEW.source_event_id,'source_type',NEW.source_type,
        'accounting_standard',NEW.accounting_standard,'ai_proposed',NEW.ai_proposed)
    FROM public.fin_organizations fo WHERE fo.id = NEW.fin_organization_id;
  END IF;
  RETURN NEW;
END; $fn$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_fin_je_audit AFTER UPDATE ON public.fin_journal_entries FOR EACH ROW EXECUTE FUNCTION public.fin_je_audit();

-- 12. HELPER FUNCTIONS

CREATE OR REPLACE FUNCTION public.fin_next_entry_number(p_org_id UUID, p_year INTEGER DEFAULT NULL)
RETURNS TEXT LANGUAGE plpgsql AS $fn$
DECLARE v_year INTEGER := COALESCE(p_year, EXTRACT(YEAR FROM now())::INTEGER); v_prefix TEXT; v_count INTEGER;
BEGIN
  v_prefix := 'JE-' || v_year || '-';
  SELECT COUNT(*) + 1 INTO v_count FROM public.fin_journal_entries WHERE fin_organization_id = p_org_id AND entry_number LIKE v_prefix || '%';
  RETURN v_prefix || LPAD(v_count::text, 5, '0');
END; $fn$;
GRANT EXECUTE ON FUNCTION public.fin_next_entry_number TO authenticated;

CREATE OR REPLACE FUNCTION public.fin_get_period_for_date(p_org_id UUID, p_entity_id UUID, p_date DATE)
RETURNS UUID LANGUAGE sql STABLE AS $fn$
  SELECT id FROM public.fin_periods
  WHERE fin_organization_id=p_org_id AND (legal_entity_id=p_entity_id OR legal_entity_id IS NULL)
    AND start_date<=p_date AND end_date>=p_date
  ORDER BY legal_entity_id NULLS LAST LIMIT 1;
$fn$;
GRANT EXECUTE ON FUNCTION public.fin_get_period_for_date TO authenticated;

-- Atomic posting function (called by finance-post edge function via RPC)
CREATE OR REPLACE FUNCTION public.fin_post_journal_entry(p_entry_id UUID, p_posted_by UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE v_entry public.fin_journal_entries; v_dr NUMERIC(20,4); v_cr NUMERIC(20,4);
BEGIN
  SELECT * INTO v_entry FROM public.fin_journal_entries WHERE id=p_entry_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success',false,'error','Entry not found'); END IF;
  IF v_entry.status NOT IN ('DRAFT','PENDING_APPROVAL') THEN
    RETURN jsonb_build_object('success',false,'error',format('Cannot post from status: %s',v_entry.status)); END IF;
  SELECT COALESCE(SUM(functional_debit),0), COALESCE(SUM(functional_credit),0)
  INTO v_dr, v_cr FROM public.fin_journal_lines WHERE journal_entry_id=p_entry_id;
  IF ABS(v_dr - v_cr) > 0.01 THEN
    RETURN jsonb_build_object('success',false,'error',format('Balance violation: Dr=%s Cr=%s',v_dr,v_cr)); END IF;
  UPDATE public.fin_journal_entries SET status='POSTED',posted_by=p_posted_by,posted_at=now(),updated_at=now() WHERE id=p_entry_id;
  INSERT INTO public.os_events(event_type,level,source_subsystem,payload) VALUES (
    'finance.journal_entry.posted','info','finance-post',
    jsonb_build_object('journal_entry_id',p_entry_id,'entry_number',v_entry.entry_number,
      'organization_id',v_entry.fin_organization_id,'legal_entity_id',v_entry.legal_entity_id,
      'posted_by',p_posted_by,'debit_sum',v_dr,'source_event_id',v_entry.source_event_id,
      'source_type',v_entry.source_type,'accounting_standard',v_entry.accounting_standard));
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.fin_ledger_balances;
  RETURN jsonb_build_object('success',true,'journal_entry_id',p_entry_id,'entry_number',v_entry.entry_number,'posted_at',now());
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('success',false,'error',SQLERRM);
END; $fn$;
GRANT EXECUTE ON FUNCTION public.fin_post_journal_entry TO service_role;

-- 13. LEDGER BALANCES (Materialized View — refreshed after each post)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.fin_ledger_balances AS
SELECT
  je.fin_organization_id, je.legal_entity_id, je.period_id,
  fp.start_date AS period_start, fp.end_date AS period_end, fp.period_name,
  jl.account_id, fa.code AS account_code, fa.name AS account_name,
  fa.account_type, fa.normal_balance, jl.currency,
  SUM(jl.debit_amount) AS total_debit,
  SUM(jl.credit_amount) AS total_credit,
  SUM(jl.debit_amount - jl.credit_amount) AS net_debit_balance,
  SUM(jl.functional_debit) AS functional_total_debit,
  SUM(jl.functional_credit) AS functional_total_credit,
  SUM(jl.functional_debit - jl.functional_credit) AS functional_net_balance,
  SUM(jl.reporting_debit) AS reporting_total_debit,
  SUM(jl.reporting_credit) AS reporting_total_credit,
  SUM(jl.reporting_debit - jl.reporting_credit) AS reporting_net_balance,
  COUNT(DISTINCT je.id) AS entry_count,
  MAX(je.posted_at) AS last_posted_at
FROM public.fin_journal_lines jl
JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
JOIN public.fin_periods fp ON fp.id = je.period_id
JOIN public.fin_accounts fa ON fa.id = jl.account_id
WHERE je.status = 'POSTED'
GROUP BY je.fin_organization_id, je.legal_entity_id, je.period_id, fp.start_date, fp.end_date, fp.period_name,
  jl.account_id, fa.code, fa.name, fa.account_type, fa.normal_balance, jl.currency;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fin_ledger_pk ON public.fin_ledger_balances(fin_organization_id, legal_entity_id, period_id, account_id, currency);
CREATE INDEX IF NOT EXISTS idx_fin_ledger_org ON public.fin_ledger_balances(fin_organization_id, period_id);
CREATE INDEX IF NOT EXISTS idx_fin_ledger_acc ON public.fin_ledger_balances(account_id, fin_organization_id);

-- 14. REALTIME
ALTER TABLE public.fin_journal_entries REPLICA IDENTITY FULL;
ALTER TABLE public.fin_events REPLICA IDENTITY FULL;
ALTER TABLE public.fin_periods REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='fin_journal_entries') THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.fin_journal_entries; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='fin_events') THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.fin_events; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='fin_periods') THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.fin_periods; END IF;
END $$;


-- ============================================================
-- CHATR Financial Intelligence & Accounting Core
-- Phase 1: Default Chart of Accounts Seed Helper
-- ============================================================

CREATE OR REPLACE FUNCTION public.insert_finance_account_helper(
  p_fin_org_id UUID,
  p_code TEXT,
  p_name TEXT,
  p_type TEXT,
  p_normal TEXT,
  p_subtype TEXT DEFAULT NULL,
  p_parent TEXT DEFAULT NULL,
  p_depth INTEGER DEFAULT 0,
  p_allow_post BOOLEAN DEFAULT true,
  p_fs TEXT DEFAULT NULL,
  p_std TEXT DEFAULT 'BOTH'
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_parent_id UUID := NULL;
BEGIN
  IF p_parent IS NOT NULL THEN
    SELECT id INTO v_parent_id FROM public.fin_accounts
    WHERE fin_organization_id = p_fin_org_id AND legal_entity_id IS NULL AND code = p_parent LIMIT 1;
  END IF;

  INSERT INTO public.fin_accounts (
    fin_organization_id, legal_entity_id, code, name, account_type, account_subtype,
    normal_balance, parent_account_id, depth, accounting_standard, allow_direct_posting, is_system_account, fs_mapping
  )
  VALUES (
    p_fin_org_id, NULL, p_code, p_name, p_type, p_subtype,
    p_normal, v_parent_id, p_depth, p_std, p_allow_post, true, p_fs
  )
  ON CONFLICT (fin_organization_id, legal_entity_id, code) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_default_chart_of_accounts(p_fin_org_id UUID)
RETURNS INTEGER LANGUAGE plpgsql AS $$
BEGIN
  -- ASSETS (1xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1000','Assets','ASSET','DEBIT','ROOT',NULL,0,false,'balance_sheet.assets');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1100','Current Assets','ASSET','DEBIT','CURRENT_ASSET','1000',1,false,'balance_sheet.current_assets');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1110','Cash and Cash Equivalents','ASSET','DEBIT','CASH','1100',2,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1111','Petty Cash','ASSET','DEBIT','CASH','1110',3,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1112','Bank Accounts','ASSET','DEBIT','BANK','1110',3,false,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1113','Current Account - Primary','ASSET','DEBIT','BANK','1112',4,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1114','Savings Account','ASSET','DEBIT','BANK','1112',4,true,'balance_sheet.cash');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1120','Accounts Receivable','ASSET','DEBIT','RECEIVABLE','1100',2,true,'balance_sheet.receivables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1121','Trade Receivables','ASSET','DEBIT','RECEIVABLE','1120',3,true,'balance_sheet.receivables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1122','GST Input Tax Credit','ASSET','DEBIT','TAX','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1130','Prepaid Expenses','ASSET','DEBIT','PREPAID','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1131','Prepaid Rent','ASSET','DEBIT','PREPAID','1130',3,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1132','Prepaid Insurance','ASSET','DEBIT','PREPAID','1130',3,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1140','Short-term Investments','ASSET','DEBIT','INVESTMENT','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1150','Inventory','ASSET','DEBIT','INVENTORY','1100',2,true,'balance_sheet.inventory');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1160','Other Current Assets','ASSET','DEBIT','OTHER','1100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1200','Non-Current Assets','ASSET','DEBIT','NONCURRENT_ASSET','1000',1,false,'balance_sheet.noncurrent_assets');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1210','Property, Plant & Equipment (Gross)','ASSET','DEBIT','FIXED_ASSET','1200',2,false,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1211','Land','ASSET','DEBIT','LAND','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1212','Buildings','ASSET','DEBIT','BUILDING','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1213','Computer Equipment','ASSET','DEBIT','EQUIPMENT','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1214','Office Furniture','ASSET','DEBIT','EQUIPMENT','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1215','Leasehold Improvements','ASSET','DEBIT','LEASEHOLD','1210',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1220','Accumulated Depreciation','CONTRA_ASSET','CREDIT','ACC_DEP','1200',2,false,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1221','Accum. Dep - Buildings','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1222','Accum. Dep - Computer Equipment','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1223','Accum. Dep - Office Furniture','CONTRA_ASSET','CREDIT','ACC_DEP','1220',3,true,'balance_sheet.ppe');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1230','Right-of-Use Assets','ASSET','DEBIT','ROU_ASSET','1200',2,true,'balance_sheet.rou','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1240','Intangible Assets','ASSET','DEBIT','INTANGIBLE','1200',2,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1241','Software Licenses','ASSET','DEBIT','SOFTWARE','1240',3,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1242','Patents & IP','ASSET','DEBIT','IP','1240',3,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1250','Long-term Investments','ASSET','DEBIT','INVESTMENT','1200',2,true,'balance_sheet.investments');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1260','Goodwill','ASSET','DEBIT','GOODWILL','1200',2,true,'balance_sheet.intangibles');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1270','Deferred Tax Asset','ASSET','DEBIT','DEFERRED_TAX','1200',2,true,'balance_sheet.other_noncurrent');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'1280','Other Non-Current Assets','ASSET','DEBIT','OTHER','1200',2,true,'balance_sheet.other_noncurrent');

  -- LIABILITIES (2xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2000','Liabilities','LIABILITY','CREDIT','ROOT',NULL,0,false,'balance_sheet.liabilities');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2100','Current Liabilities','LIABILITY','CREDIT','CURRENT_LIABILITY','2000',1,false,'balance_sheet.current_liabilities');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2110','Accounts Payable','LIABILITY','CREDIT','PAYABLE','2100',2,true,'balance_sheet.payables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2111','Trade Payables','LIABILITY','CREDIT','PAYABLE','2110',3,true,'balance_sheet.payables');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2120','Accrued Liabilities','LIABILITY','CREDIT','ACCRUAL','2100',2,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2121','Accrued Salaries','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2122','Accrued Expenses','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2123','Accrued Interest','LIABILITY','CREDIT','ACCRUAL','2120',3,true,'balance_sheet.accrued');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2130','Deferred Revenue','LIABILITY','CREDIT','DEFERRED_REV','2100',2,true,'balance_sheet.deferred_revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2131','Deferred Revenue - Subscriptions','LIABILITY','CREDIT','DEFERRED_REV','2130',3,true,'balance_sheet.deferred_revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2132','Deferred Revenue - Services','LIABILITY','CREDIT','DEFERRED_REV','2130',3,true,'balance_sheet.deferred_revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2140','Tax Payable','LIABILITY','CREDIT','TAX','2100',2,false,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2141','GST Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2142','TDS Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2143','Income Tax Payable','LIABILITY','CREDIT','TAX','2140',3,true,'balance_sheet.taxes');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2150','Short-term Loans','LIABILITY','CREDIT','LOAN','2100',2,true,'balance_sheet.short_term_debt');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2160','Customer Advances','LIABILITY','CREDIT','ADVANCE','2100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2170','Other Current Liabilities','LIABILITY','CREDIT','OTHER','2100',2,true,'balance_sheet.other_current');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2200','Non-Current Liabilities','LIABILITY','CREDIT','NONCURRENT_LIABILITY','2000',1,false,'balance_sheet.noncurrent_liabilities');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2210','Long-term Loans','LIABILITY','CREDIT','LOAN','2200',2,true,'balance_sheet.long_term_debt');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2220','Lease Liabilities','LIABILITY','CREDIT','LEASE','2200',2,true,'balance_sheet.lease_liabilities','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2230','Deferred Tax Liability','LIABILITY','CREDIT','DEFERRED_TAX','2200',2,true,'balance_sheet.other_noncurrent');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'2240','Other Non-Current Liabilities','LIABILITY','CREDIT','OTHER','2200',2,true,'balance_sheet.other_noncurrent');

  -- EQUITY (3xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3000','Equity','EQUITY','CREDIT','ROOT',NULL,0,false,'balance_sheet.equity');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3100','Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3000',1,true,'balance_sheet.share_capital');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3110','Ordinary Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3100',2,true,'balance_sheet.share_capital');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3120','Preference Share Capital','EQUITY','CREDIT','SHARE_CAPITAL','3100',2,true,'balance_sheet.share_capital');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3130','Share Premium','EQUITY','CREDIT','SHARE_PREMIUM','3000',1,true,'balance_sheet.share_premium');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3200','Retained Earnings','EQUITY','CREDIT','RETAINED_EARNINGS','3000',1,true,'balance_sheet.retained_earnings');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3210','Current Year Profit/Loss','EQUITY','CREDIT','CURRENT_YEAR_PL','3200',2,true,'balance_sheet.current_pl');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3300','Other Comprehensive Income','EQUITY','CREDIT','OCI','3000',1,false,'balance_sheet.oci','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3310','OCI - FX Translation Reserve','EQUITY','CREDIT','OCI_FX','3300',2,true,'balance_sheet.oci','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'3320','OCI - Revaluation Reserve','EQUITY','CREDIT','OCI_REVAL','3300',2,true,'balance_sheet.oci','IFRS');

  -- REVENUE (4xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4000','Revenue','REVENUE','CREDIT','ROOT',NULL,0,false,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4100','Operating Revenue','REVENUE','CREDIT','OPERATING','4000',1,false,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4110','Product Revenue','REVENUE','CREDIT','PRODUCT','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4120','Service Revenue','REVENUE','CREDIT','SERVICE','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4130','Subscription Revenue','REVENUE','CREDIT','SUBSCRIPTION','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4140','SaaS Revenue','REVENUE','CREDIT','SAAS','4130',3,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4150','Professional Services Revenue','REVENUE','CREDIT','SERVICES','4100',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4160','Consulting Revenue','REVENUE','CREDIT','CONSULTING','4150',3,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4200','Other Income','REVENUE','CREDIT','OTHER_INCOME','4000',1,false,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4210','Interest Income','REVENUE','CREDIT','INTEREST','4200',2,true,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4220','Foreign Exchange Gain','REVENUE','CREDIT','FX_GAIN','4200',2,true,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4230','Other Income','REVENUE','CREDIT','OTHER','4200',2,true,'income_stmt.other_income');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4300','Contract Revenue (ASC 606 / IFRS 15)','REVENUE','CREDIT','CONTRACT','4000',1,false,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4310','Revenue - Point-in-Time','REVENUE','CREDIT','POT','4300',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4320','Revenue - Over Time (Straight-line)','REVENUE','CREDIT','OT_SL','4300',2,true,'income_stmt.revenue');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'4330','Revenue - Over Time (Milestone)','REVENUE','CREDIT','OT_MS','4300',2,true,'income_stmt.revenue');

  -- EXPENSES (5xxx)
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5000','Expenses','EXPENSE','DEBIT','ROOT',NULL,0,false,'income_stmt.expenses');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5100','Cost of Revenue','EXPENSE','DEBIT','COGS','5000',1,false,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5110','Cost of Goods Sold','EXPENSE','DEBIT','COGS','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5120','Cost of Services','EXPENSE','DEBIT','COS','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5130','Hosting & Infrastructure','EXPENSE','DEBIT','INFRA','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5140','Third-party API Costs','EXPENSE','DEBIT','API','5100',2,true,'income_stmt.cogs');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5200','Operating Expenses','EXPENSE','DEBIT','OPEX','5000',1,false,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5210','Salaries & Wages','EXPENSE','DEBIT','SALARY','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5211','Employee Salaries','EXPENSE','DEBIT','SALARY','5210',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5212','Employer PF / ESI','EXPENSE','DEBIT','SALARY','5210',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5213','Employee Benefits','EXPENSE','DEBIT','BENEFITS','5210',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5220','Rent & Occupancy','EXPENSE','DEBIT','RENT','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5230','Marketing & Advertising','EXPENSE','DEBIT','MARKETING','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5240','Technology & Software','EXPENSE','DEBIT','TECH','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5250','Professional Fees','EXPENSE','DEBIT','PROFESSIONAL','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5251','Legal Fees','EXPENSE','DEBIT','LEGAL','5250',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5252','Audit & Accounting Fees','EXPENSE','DEBIT','AUDIT','5250',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5260','Travel & Entertainment','EXPENSE','DEBIT','TRAVEL','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5270','Office & Administration','EXPENSE','DEBIT','ADMIN','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5280','Insurance','EXPENSE','DEBIT','INSURANCE','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5290','Depreciation & Amortization','EXPENSE','DEBIT','DEPRECIATION','5200',2,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5291','Depreciation - PPE','EXPENSE','DEBIT','DEPRECIATION','5290',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5292','Amortization - Intangibles','EXPENSE','DEBIT','AMORTIZATION','5290',3,true,'income_stmt.opex');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5293','ROU Asset Amortization','EXPENSE','DEBIT','ROU_AMORT','5290',3,true,'income_stmt.opex','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5300','Finance Costs','EXPENSE','DEBIT','FINANCE','5000',1,false,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5310','Interest Expense','EXPENSE','DEBIT','INTEREST','5300',2,true,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5311','Bank Charges','EXPENSE','DEBIT','BANK_CHG','5300',2,true,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5320','Foreign Exchange Loss','EXPENSE','DEBIT','FX_LOSS','5300',2,true,'income_stmt.finance');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5330','Lease Interest Expense','EXPENSE','DEBIT','LEASE_INT','5300',2,true,'income_stmt.finance','IFRS');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5400','Tax Expense','EXPENSE','DEBIT','TAX','5000',1,false,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5410','Current Income Tax Expense','EXPENSE','DEBIT','TAX','5400',2,true,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5420','Deferred Tax Expense','EXPENSE','DEBIT','DEFERRED_TAX','5400',2,true,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5430','GST Expense (Non-recoverable)','EXPENSE','DEBIT','GST','5400',2,true,'income_stmt.tax');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5500','Other Expenses','EXPENSE','DEBIT','OTHER','5000',1,false,'income_stmt.other');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5510','Write-offs & Impairments','EXPENSE','DEBIT','WRITEOFF','5500',2,true,'income_stmt.other');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5520','Bad Debt Expense','EXPENSE','DEBIT','BAD_DEBT','5500',2,true,'income_stmt.other');
  PERFORM public.insert_finance_account_helper(p_fin_org_id,'5530','Miscellaneous Expense','EXPENSE','DEBIT','MISC','5500',2,true,'income_stmt.other');

  RETURN 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_default_chart_of_accounts TO authenticated;


-- ============================================================
-- CHATR Financial Intelligence & Accounting Core
-- Phase 2: Financial Event Mesh & Subledgers (AR/AP/Payments/Reconciliation/Integrity)
-- Migration: 20260824200001_finance_phase2_subledgers.sql
-- ============================================================

-- 1. CUSTOMERS (AR Financial Master)
CREATE TABLE IF NOT EXISTS public.fin_customers (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id      UUID REFERENCES public.fin_legal_entities(id),
  customer_code        TEXT NOT NULL,
  name                 TEXT NOT NULL,
  billing_email        TEXT,
  billing_address      JSONB NOT NULL DEFAULT '{}',
  tax_identifier       TEXT, -- GSTIN / VAT / Tax ID
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  payment_terms_days   INTEGER NOT NULL DEFAULT 30,
  credit_limit         NUMERIC(20,4) NOT NULL DEFAULT 0,
  credit_hold          BOOLEAN NOT NULL DEFAULT false,
  risk_rating          TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_rating IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  notes                TEXT,
  tags                 JSONB DEFAULT '[]',
  is_active            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_customers_code_unique UNIQUE (fin_organization_id, customer_code)
);
ALTER TABLE public.fin_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_customers view" ON public.fin_customers FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_customers manage" ON public.fin_customers FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member'));
CREATE TRIGGER trg_fin_customers_upd BEFORE UPDATE ON public.fin_customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_customers_org ON public.fin_customers(fin_organization_id, is_active);

-- 2. VENDORS (AP Financial Master)
CREATE TABLE IF NOT EXISTS public.fin_vendors (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id      UUID REFERENCES public.fin_legal_entities(id),
  vendor_code          TEXT NOT NULL,
  name                 TEXT NOT NULL,
  email                TEXT,
  billing_address      JSONB NOT NULL DEFAULT '{}',
  tax_identifier       TEXT, -- GSTIN / PAN / W-9 / Tax ID
  tds_category         TEXT, -- India TDS section (e.g. 194C, 194J) / 1099
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  payment_terms_days   INTEGER NOT NULL DEFAULT 30,
  bank_details         JSONB DEFAULT '{}',
  is_1099_eligible     BOOLEAN NOT NULL DEFAULT false,
  is_active            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_vendors_code_unique UNIQUE (fin_organization_id, vendor_code)
);
ALTER TABLE public.fin_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_vendors view" ON public.fin_vendors FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_vendors manage" ON public.fin_vendors FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member'));
CREATE TRIGGER trg_fin_vendors_upd BEFORE UPDATE ON public.fin_vendors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_vendors_org ON public.fin_vendors(fin_organization_id, is_active);

-- 3. INVOICES (AR Subledger)
CREATE TABLE IF NOT EXISTS public.fin_invoices (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id),
  legal_entity_id      UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  customer_id          UUID NOT NULL REFERENCES public.fin_customers(id),
  invoice_number       TEXT NOT NULL,
  issue_date           DATE NOT NULL,
  due_date             DATE NOT NULL,
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  fx_rate              NUMERIC(20,10) NOT NULL DEFAULT 1.0,
  subtotal             NUMERIC(20,4) NOT NULL DEFAULT 0,
  tax_total            NUMERIC(20,4) NOT NULL DEFAULT 0,
  discount_total       NUMERIC(20,4) NOT NULL DEFAULT 0,
  total                NUMERIC(20,4) NOT NULL DEFAULT 0,
  amount_paid          NUMERIC(20,4) NOT NULL DEFAULT 0,
  amount_due           NUMERIC(20,4) NOT NULL DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','ISSUED','PARTIALLY_PAID','PAID','VOID','CANCELLED','WRITTEN_OFF')),
  journal_entry_id     UUID REFERENCES public.fin_journal_entries(id),
  source_event_id      UUID REFERENCES public.fin_events(id),
  notes                TEXT,
  terms                TEXT,
  pdf_url              TEXT,
  created_by           UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_invoices_number_unique UNIQUE (fin_organization_id, invoice_number),
  CONSTRAINT fin_invoices_dates CHECK (due_date >= issue_date)
);
ALTER TABLE public.fin_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_invoices view" ON public.fin_invoices FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_invoices manage" ON public.fin_invoices FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member'));
CREATE TRIGGER trg_fin_invoices_upd BEFORE UPDATE ON public.fin_invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_invoices_org ON public.fin_invoices(fin_organization_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_fin_invoices_cust ON public.fin_invoices(customer_id, status);

-- 4. INVOICE LINES
CREATE TABLE IF NOT EXISTS public.fin_invoice_lines (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id           UUID NOT NULL REFERENCES public.fin_invoices(id) ON DELETE CASCADE,
  line_number          INTEGER NOT NULL,
  description          TEXT NOT NULL,
  quantity             NUMERIC(14,4) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price           NUMERIC(20,4) NOT NULL DEFAULT 0,
  discount_amount      NUMERIC(20,4) NOT NULL DEFAULT 0,
  tax_rate             NUMERIC(5,2) NOT NULL DEFAULT 0, -- percentage e.g. 18.00
  tax_amount           NUMERIC(20,4) NOT NULL DEFAULT 0,
  line_total           NUMERIC(20,4) NOT NULL DEFAULT 0,
  revenue_account_id   UUID NOT NULL REFERENCES public.fin_accounts(id),
  department_id        UUID REFERENCES public.sys_departments(id),
  project_id           TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_invoice_lines_unique UNIQUE (invoice_id, line_number)
);
ALTER TABLE public.fin_invoice_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_inv_lines view" ON public.fin_invoice_lines FOR SELECT USING (invoice_id IN (SELECT id FROM fin_invoices WHERE fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid())));
CREATE POLICY "fin_inv_lines manage" ON public.fin_invoice_lines FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_fin_inv_lines_inv ON public.fin_invoice_lines(invoice_id);

-- 5. CREDIT NOTES
CREATE TABLE IF NOT EXISTS public.fin_credit_notes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id),
  legal_entity_id      UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  customer_id          UUID NOT NULL REFERENCES public.fin_customers(id),
  credit_note_number   TEXT NOT NULL,
  issue_date           DATE NOT NULL,
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  fx_rate              NUMERIC(20,10) NOT NULL DEFAULT 1.0,
  total                NUMERIC(20,4) NOT NULL DEFAULT 0,
  unapplied_amount     NUMERIC(20,4) NOT NULL DEFAULT 0,
  reason               TEXT,
  status               TEXT NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('DRAFT','ISSUED','APPLIED','VOID')),
  journal_entry_id     UUID REFERENCES public.fin_journal_entries(id),
  created_by           UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_cn_number_unique UNIQUE (fin_organization_id, credit_note_number)
);
ALTER TABLE public.fin_credit_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_cn view" ON public.fin_credit_notes FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE TRIGGER trg_fin_cn_upd BEFORE UPDATE ON public.fin_credit_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. BILLS (AP Subledger)
CREATE TABLE IF NOT EXISTS public.fin_bills (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id),
  legal_entity_id      UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  vendor_id            UUID NOT NULL REFERENCES public.fin_vendors(id),
  bill_number          TEXT NOT NULL, -- vendor invoice number
  bill_date            DATE NOT NULL,
  due_date             DATE NOT NULL,
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  fx_rate              NUMERIC(20,10) NOT NULL DEFAULT 1.0,
  subtotal             NUMERIC(20,4) NOT NULL DEFAULT 0,
  tax_total            NUMERIC(20,4) NOT NULL DEFAULT 0,
  total                NUMERIC(20,4) NOT NULL DEFAULT 0,
  amount_paid          NUMERIC(20,4) NOT NULL DEFAULT 0,
  amount_due           NUMERIC(20,4) NOT NULL DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PENDING_APPROVAL','APPROVED','PARTIALLY_PAID','PAID','REJECTED','VOID')),
  duplicate_hash       TEXT, -- MD5(vendor_id + bill_number + total) for duplicate prevention
  approval_id          UUID REFERENCES public.workflow_approvals(id),
  approved_by          UUID REFERENCES auth.users(id),
  approved_at          TIMESTAMPTZ,
  journal_entry_id     UUID REFERENCES public.fin_journal_entries(id),
  source_event_id      UUID REFERENCES public.fin_events(id),
  attachment_url       TEXT,
  notes                TEXT,
  created_by           UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_bills_number_unique UNIQUE (fin_organization_id, vendor_id, bill_number)
);
ALTER TABLE public.fin_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_bills view" ON public.fin_bills FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_bills manage" ON public.fin_bills FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member'));
CREATE TRIGGER trg_fin_bills_upd BEFORE UPDATE ON public.fin_bills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_bills_org ON public.fin_bills(fin_organization_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_fin_bills_vendor ON public.fin_bills(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_fin_bills_hash ON public.fin_bills(fin_organization_id, duplicate_hash);

-- 7. BILL LINES
CREATE TABLE IF NOT EXISTS public.fin_bill_lines (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id              UUID NOT NULL REFERENCES public.fin_bills(id) ON DELETE CASCADE,
  line_number          INTEGER NOT NULL,
  description          TEXT NOT NULL,
  quantity             NUMERIC(14,4) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price           NUMERIC(20,4) NOT NULL DEFAULT 0,
  tax_rate             NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_amount           NUMERIC(20,4) NOT NULL DEFAULT 0,
  line_total           NUMERIC(20,4) NOT NULL DEFAULT 0,
  expense_account_id   UUID NOT NULL REFERENCES public.fin_accounts(id),
  department_id        UUID REFERENCES public.sys_departments(id),
  project_id           TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_bill_lines_unique UNIQUE (bill_id, line_number)
);
ALTER TABLE public.fin_bill_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_bill_lines view" ON public.fin_bill_lines FOR SELECT USING (bill_id IN (SELECT id FROM fin_bills WHERE fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid())));
CREATE POLICY "fin_bill_lines manage" ON public.fin_bill_lines FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_fin_bill_lines_bill ON public.fin_bill_lines(bill_id);

-- 8. PAYMENTS (AR/AP Payment Subledger)
CREATE TABLE IF NOT EXISTS public.fin_payments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id),
  legal_entity_id      UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  payment_number       TEXT NOT NULL,
  payment_type         TEXT NOT NULL CHECK (payment_type IN ('INCOMING_AR','OUTGOING_AP','REFUND_AR','REFUND_AP')),
  customer_id          UUID REFERENCES public.fin_customers(id),
  vendor_id            UUID REFERENCES public.fin_vendors(id),
  payment_date         DATE NOT NULL,
  amount               NUMERIC(20,4) NOT NULL CHECK (amount > 0),
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  fx_rate              NUMERIC(20,10) NOT NULL DEFAULT 1.0,
  functional_amount    NUMERIC(20,4) NOT NULL DEFAULT 0,
  unapplied_amount     NUMERIC(20,4) NOT NULL DEFAULT 0,
  payment_method       TEXT NOT NULL DEFAULT 'BANK_TRANSFER' CHECK (payment_method IN ('BANK_TRANSFER','CARD','UPI','CHEQUE','CASH','ACH','WIRE','OTHER')),
  bank_account_id      UUID REFERENCES public.fin_accounts(id),
  reference_number     TEXT, -- UTR / transaction ID / Cheque #
  status               TEXT NOT NULL DEFAULT 'POSTED' CHECK (status IN ('DRAFT','POSTED','REVERSED','BOUNCED','FAILED')),
  journal_entry_id     UUID REFERENCES public.fin_journal_entries(id),
  source_event_id      UUID REFERENCES public.fin_events(id),
  notes                TEXT,
  created_by           UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_payments_number_unique UNIQUE (fin_organization_id, payment_number)
);
ALTER TABLE public.fin_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_payments view" ON public.fin_payments FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_payments manage" ON public.fin_payments FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member'));
CREATE TRIGGER trg_fin_payments_upd BEFORE UPDATE ON public.fin_payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_payments_org ON public.fin_payments(fin_organization_id, payment_type, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_fin_payments_cust ON public.fin_payments(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fin_payments_vend ON public.fin_payments(vendor_id) WHERE vendor_id IS NOT NULL;

-- 9. PAYMENT ALLOCATIONS (1-to-many / many-to-1 matching)
CREATE TABLE IF NOT EXISTS public.fin_payment_allocations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id           UUID NOT NULL REFERENCES public.fin_payments(id) ON DELETE CASCADE,
  invoice_id           UUID REFERENCES public.fin_invoices(id) ON DELETE CASCADE,
  bill_id              UUID REFERENCES public.fin_bills(id) ON DELETE CASCADE,
  allocated_amount     NUMERIC(20,4) NOT NULL CHECK (allocated_amount > 0),
  discount_amount      NUMERIC(20,4) NOT NULL DEFAULT 0,
  fee_amount           NUMERIC(20,4) NOT NULL DEFAULT 0,
  fx_gain_loss         NUMERIC(20,4) NOT NULL DEFAULT 0, -- Realized FX gain/loss on settlement
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_alloc_target CHECK ((invoice_id IS NOT NULL AND bill_id IS NULL) OR (bill_id IS NOT NULL AND invoice_id IS NULL))
);
ALTER TABLE public.fin_payment_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_alloc view" ON public.fin_payment_allocations FOR SELECT USING (true);
CREATE POLICY "fin_alloc manage" ON public.fin_payment_allocations FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_fin_alloc_pmt ON public.fin_payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_fin_alloc_inv ON public.fin_payment_allocations(invoice_id) WHERE invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fin_alloc_bill ON public.fin_payment_allocations(bill_id) WHERE bill_id IS NOT NULL;

-- 10. TRIGGER: Auto-update Invoice / Bill amount_paid and status on Allocation
CREATE OR REPLACE FUNCTION public.fin_sync_payment_allocation()
RETURNS TRIGGER AS $fn$
DECLARE
  v_inv_paid  NUMERIC(20,4);
  v_inv_total NUMERIC(20,4);
  v_bill_paid NUMERIC(20,4);
  v_bill_total NUMERIC(20,4);
  v_pmt_total NUMERIC(20,4);
  v_pmt_alloc NUMERIC(20,4);
  v_target_inv UUID;
  v_target_bill UUID;
  v_target_pmt UUID;
BEGIN
  v_target_inv  := COALESCE(NEW.invoice_id, OLD.invoice_id);
  v_target_bill := COALESCE(NEW.bill_id, OLD.bill_id);
  v_target_pmt  := COALESCE(NEW.payment_id, OLD.payment_id);

  -- 1. Sync Invoice
  IF v_target_inv IS NOT NULL THEN
    SELECT COALESCE(SUM(allocated_amount + discount_amount), 0) INTO v_inv_paid
    FROM public.fin_payment_allocations WHERE invoice_id = v_target_inv;

    SELECT total INTO v_inv_total FROM public.fin_invoices WHERE id = v_target_inv;

    UPDATE public.fin_invoices
    SET
      amount_paid = v_inv_paid,
      amount_due  = GREATEST(0, v_inv_total - v_inv_paid),
      status = CASE
        WHEN v_inv_paid >= v_inv_total THEN 'PAID'
        WHEN v_inv_paid > 0 THEN 'PARTIALLY_PAID'
        ELSE 'ISSUED'
      END,
      updated_at = now()
    WHERE id = v_target_inv;
  END IF;

  -- 2. Sync Bill
  IF v_target_bill IS NOT NULL THEN
    SELECT COALESCE(SUM(allocated_amount + discount_amount), 0) INTO v_bill_paid
    FROM public.fin_payment_allocations WHERE bill_id = v_target_bill;

    SELECT total INTO v_bill_total FROM public.fin_bills WHERE id = v_target_bill;

    UPDATE public.fin_bills
    SET
      amount_paid = v_bill_paid,
      amount_due  = GREATEST(0, v_bill_total - v_bill_paid),
      status = CASE
        WHEN v_bill_paid >= v_bill_total THEN 'PAID'
        WHEN v_bill_paid > 0 THEN 'PARTIALLY_PAID'
        ELSE status
      END,
      updated_at = now()
    WHERE id = v_target_bill;
  END IF;

  -- 3. Sync Payment unapplied amount
  SELECT amount INTO v_pmt_total FROM public.fin_payments WHERE id = v_target_pmt;
  SELECT COALESCE(SUM(allocated_amount + fee_amount), 0) INTO v_pmt_alloc
  FROM public.fin_payment_allocations WHERE payment_id = v_target_pmt;

  UPDATE public.fin_payments
  SET unapplied_amount = GREATEST(0, v_pmt_total - v_pmt_alloc), updated_at = now()
  WHERE id = v_target_pmt;

  RETURN COALESCE(NEW, OLD);
END; $fn$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fin_sync_alloc_ins
  AFTER INSERT OR UPDATE OR DELETE ON public.fin_payment_allocations
  FOR EACH ROW EXECUTE FUNCTION public.fin_sync_payment_allocation();

-- 11. FINANCIAL INTEGRITY REPORTS (Continuous Health Snapshot)
CREATE TABLE IF NOT EXISTS public.fin_integrity_reports (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  snapshot_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  integrity_score      NUMERIC(5,2) NOT NULL DEFAULT 100.00, -- 0.00 - 100.00%
  total_checks         INTEGER NOT NULL DEFAULT 0,
  passed_checks        INTEGER NOT NULL DEFAULT 0,
  ar_gl_diff           NUMERIC(20,4) NOT NULL DEFAULT 0,
  ap_gl_diff           NUMERIC(20,4) NOT NULL DEFAULT 0,
  cash_gl_diff         NUMERIC(20,4) NOT NULL DEFAULT 0,
  anomalies            JSONB NOT NULL DEFAULT '[]',
  status               TEXT NOT NULL DEFAULT 'HEALTHY' CHECK (status IN ('HEALTHY','WARNING','CRITICAL'))
);
ALTER TABLE public.fin_integrity_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_integrity view" ON public.fin_integrity_reports FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE INDEX IF NOT EXISTS idx_fin_integrity_org ON public.fin_integrity_reports(fin_organization_id, snapshot_at DESC);

-- 12. STORED PROCEDURE: SUBLEDGER TO GL RECONCILIATION
CREATE OR REPLACE FUNCTION public.fin_reconcile_subledgers_to_gl(p_org_id UUID, p_entity_id UUID DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_subledger_ar NUMERIC(20,4) := 0;
  v_gl_ar        NUMERIC(20,4) := 0;
  v_ar_diff      NUMERIC(20,4) := 0;

  v_subledger_ap NUMERIC(20,4) := 0;
  v_gl_ap        NUMERIC(20,4) := 0;
  v_ap_diff      NUMERIC(20,4) := 0;

  v_subledger_cash NUMERIC(20,4) := 0;
  v_gl_cash        NUMERIC(20,4) := 0;
  v_cash_diff      NUMERIC(20,4) := 0;

  v_is_reconciled  BOOLEAN := true;
BEGIN
  -- 1. AR Subledger: Sum of all unpaid / partially paid invoices
  SELECT COALESCE(SUM(amount_due * fx_rate), 0) INTO v_subledger_ar
  FROM public.fin_invoices
  WHERE fin_organization_id = p_org_id
    AND (legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND status IN ('ISSUED', 'PARTIALLY_PAID');

  -- GL AR: Current balance in AR accounts (1120, 1121)
  SELECT COALESCE(SUM(jl.functional_debit - jl.functional_credit), 0) INTO v_gl_ar
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.status = 'POSTED'
    AND (fa.code LIKE '112%' OR fa.account_subtype = 'RECEIVABLE');

  v_ar_diff := ABS(v_subledger_ar - v_gl_ar);

  -- 2. AP Subledger: Sum of all unpaid / partially paid bills
  SELECT COALESCE(SUM(amount_due * fx_rate), 0) INTO v_subledger_ap
  FROM public.fin_bills
  WHERE fin_organization_id = p_org_id
    AND (legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND status IN ('APPROVED', 'PARTIALLY_PAID');

  -- GL AP: Current balance in AP accounts (2110, 2111)
  SELECT COALESCE(SUM(jl.functional_credit - jl.functional_debit), 0) INTO v_gl_ap
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.status = 'POSTED'
    AND (fa.code LIKE '211%' OR fa.account_subtype = 'PAYABLE');

  v_ap_diff := ABS(v_subledger_ap - v_gl_ap);

  -- Determine pass/fail
  IF v_ar_diff > 1.0 OR v_ap_diff > 1.0 THEN
    v_is_reconciled := false;
  END IF;

  RETURN jsonb_build_object(
    'is_reconciled', v_is_reconciled,
    'ar', jsonb_build_object(
      'subledger_total', v_subledger_ar,
      'gl_total', v_gl_ar,
      'difference', v_ar_diff,
      'status', CASE WHEN v_ar_diff <= 1.0 THEN 'MATCH' ELSE 'MISMATCH' END
    ),
    'ap', jsonb_build_object(
      'subledger_total', v_subledger_ap,
      'gl_total', v_gl_ap,
      'difference', v_ap_diff,
      'status', CASE WHEN v_ap_diff <= 1.0 THEN 'MATCH' ELSE 'MISMATCH' END
    ),
    'reconciled_at', now()
  );
END; $fn$;
GRANT EXECUTE ON FUNCTION public.fin_reconcile_subledgers_to_gl TO authenticated;

-- 13. STORED PROCEDURE: FINANCIAL INTEGRITY MONITOR
CREATE OR REPLACE FUNCTION public.fin_run_integrity_check(p_org_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_anomalies JSONB := '[]'::jsonb;
  v_total_checks INTEGER := 8;
  v_passed_checks INTEGER := 8;
  v_reconcile JSONB;
  v_ar_diff NUMERIC(20,4);
  v_ap_diff NUMERIC(20,4);
  v_score NUMERIC(5,2) := 100.00;
  v_unposted_old INTEGER := 0;
  v_dup_bills INTEGER := 0;
  v_orphan_events INTEGER := 0;
  v_closed_attempts INTEGER := 0;
  v_report_status TEXT := 'HEALTHY';
BEGIN
  -- Check 1 & 2: Subledger to GL Reconciliation
  v_reconcile := public.fin_reconcile_subledgers_to_gl(p_org_id);
  v_ar_diff := (v_reconcile->'ar'->>'difference')::numeric;
  v_ap_diff := (v_reconcile->'ap'->>'difference')::numeric;

  IF v_ar_diff > 1.0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'AR_GL_MISMATCH',
      'severity', 'CRITICAL',
      'title', 'AR Subledger does not reconcile with GL Control Account',
      'detail', format('Difference of %s between AR subledger (%s) and GL (%s)',
        v_ar_diff, v_reconcile->'ar'->>'subledger_total', v_reconcile->'ar'->>'gl_total')
    );
  END IF;

  IF v_ap_diff > 1.0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'AP_GL_MISMATCH',
      'severity', 'CRITICAL',
      'title', 'AP Subledger does not reconcile with GL Control Account',
      'detail', format('Difference of %s between AP subledger (%s) and GL (%s)',
        v_ap_diff, v_reconcile->'ap'->>'subledger_total', v_reconcile->'ap'->>'gl_total')
    );
  END IF;

  -- Check 3: Stale unposted drafts (> 14 days old)
  SELECT COUNT(*) INTO v_unposted_old
  FROM public.fin_journal_entries
  WHERE fin_organization_id = p_org_id
    AND status IN ('DRAFT', 'PENDING_APPROVAL')
    AND created_at < now() - INTERVAL '14 days';

  IF v_unposted_old > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'STALE_DRAFT_ENTRIES',
      'severity', 'WARNING',
      'title', format('%s stale unposted draft entries (>14 days)', v_unposted_old),
      'detail', 'Unposted drafts older than 14 days delay monthly closing and ledger accuracy.'
    );
  END IF;

  -- Check 4: Potential duplicate vendor bills (same vendor + total + bill_date)
  SELECT COUNT(*) INTO v_dup_bills
  FROM (
    SELECT vendor_id, bill_number, total, COUNT(*)
    FROM public.fin_bills
    WHERE fin_organization_id = p_org_id AND status != 'VOID'
    GROUP BY vendor_id, bill_number, total
    HAVING COUNT(*) > 1
  ) t;

  IF v_dup_bills > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'DUPLICATE_BILLS',
      'severity', 'HIGH',
      'title', format('%s duplicate vendor bill sets detected', v_dup_bills),
      'detail', 'Multiple bills found with identical vendor, invoice number, and amount.'
    );
  END IF;

  -- Check 5: Orphan events (events in PENDING status for > 2 hours)
  SELECT COUNT(*) INTO v_orphan_events
  FROM public.fin_events
  WHERE fin_organization_id = p_org_id
    AND processing_status = 'PENDING'
    AND created_at < now() - INTERVAL '2 hours';

  IF v_orphan_events > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'ORPHAN_EVENTS',
      'severity', 'WARNING',
      'title', format('%s unprocessed financial events (>2h old)', v_orphan_events),
      'detail', 'Events queued in fin_events have not been processed into the subledger/GL.'
    );
  END IF;

  -- Calculate score
  v_score := ROUND((v_passed_checks::numeric / v_total_checks::numeric) * 100.0, 2);
  IF v_score < 80.0 THEN v_report_status := 'CRITICAL';
  ELSIF v_score < 100.0 THEN v_report_status := 'WARNING';
  ELSE v_report_status := 'HEALTHY';
  END IF;

  -- Insert report snapshot
  INSERT INTO public.fin_integrity_reports (
    fin_organization_id, integrity_score, total_checks, passed_checks,
    ar_gl_diff, ap_gl_diff, cash_gl_diff, anomalies, status
  ) VALUES (
    p_org_id, v_score, v_total_checks, v_passed_checks,
    v_ar_diff, v_ap_diff, 0, v_anomalies, v_report_status
  );

  RETURN jsonb_build_object(
    'integrity_score', v_score,
    'status', v_report_status,
    'total_checks', v_total_checks,
    'passed_checks', v_passed_checks,
    'anomalies', v_anomalies,
    'checked_at', now()
  );
END; $fn$;
GRANT EXECUTE ON FUNCTION public.fin_run_integrity_check TO authenticated;


-- ============================================================
-- CHATR Financial Intelligence & Accounting Core
-- Phase 3: Revenue Intelligence & Contract Accounting (ASC 606 / IFRS 15)
-- Migration: 20260824300001_finance_phase3_revenue_contracts.sql
-- ============================================================

-- 1. CONTRACTS (Revenue & Customer Commitments)
CREATE TABLE IF NOT EXISTS public.fin_contracts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id      UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  customer_id          UUID NOT NULL REFERENCES public.fin_customers(id),
  contract_number      TEXT NOT NULL, -- e.g. 'CTR-2026-001'
  title                TEXT NOT NULL,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  fx_rate              NUMERIC(20,10) NOT NULL DEFAULT 1.0,
  transaction_price    NUMERIC(20,4) NOT NULL CHECK (transaction_price >= 0),
  allocated_price      NUMERIC(20,4) NOT NULL DEFAULT 0,
  recognized_revenue   NUMERIC(20,4) NOT NULL DEFAULT 0,
  deferred_revenue     NUMERIC(20,4) NOT NULL DEFAULT 0,
  unbilled_revenue     NUMERIC(20,4) NOT NULL DEFAULT 0,
  billing_frequency    TEXT NOT NULL DEFAULT 'UPFRONT' CHECK (billing_frequency IN ('UPFRONT','MONTHLY','QUARTERLY','ANNUAL','MILESTONE')),
  payment_terms_days   INTEGER NOT NULL DEFAULT 30,
  status               TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','ACTIVE','AMENDED','SUSPENDED','CANCELLED','COMPLETED')),
  version              INTEGER NOT NULL DEFAULT 1,
  accounting_standard  TEXT NOT NULL DEFAULT 'IFRS' CHECK (accounting_standard IN ('IFRS','US_GAAP','BOTH')),
  source_event_id      UUID REFERENCES public.fin_events(id),
  ai_interpreted       BOOLEAN NOT NULL DEFAULT false,
  ai_confidence        NUMERIC(5,4),
  ai_rationale         TEXT,
  attachment_url       TEXT,
  notes                TEXT,
  created_by           UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_contracts_num_unique UNIQUE (fin_organization_id, contract_number),
  CONSTRAINT fin_contracts_date_check CHECK (end_date >= start_date)
);
ALTER TABLE public.fin_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_contracts view" ON public.fin_contracts FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_contracts manage" ON public.fin_contracts FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member'));
CREATE TRIGGER trg_fin_contracts_upd BEFORE UPDATE ON public.fin_contracts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_contracts_org ON public.fin_contracts(fin_organization_id, status, start_date);
CREATE INDEX IF NOT EXISTS idx_fin_contracts_cust ON public.fin_contracts(customer_id, status);

-- 2. PERFORMANCE OBLIGATIONS (ASC 606 Step 2)
CREATE TABLE IF NOT EXISTS public.fin_performance_obligations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id          UUID NOT NULL REFERENCES public.fin_contracts(id) ON DELETE CASCADE,
  obligation_number    INTEGER NOT NULL,
  title                TEXT NOT NULL, -- e.g. 'Software Access', 'Implementation', 'Support'
  description          TEXT,
  standalone_selling_price NUMERIC(20,4) NOT NULL DEFAULT 0,
  allocated_price      NUMERIC(20,4) NOT NULL DEFAULT 0, -- Allocated transaction price
  revenue_account_id   UUID NOT NULL REFERENCES public.fin_accounts(id),
  deferred_rev_account_id UUID NOT NULL REFERENCES public.fin_accounts(id),
  recognition_method   TEXT NOT NULL DEFAULT 'STRAIGHT_LINE' CHECK (recognition_method IN ('STRAIGHT_LINE','MILESTONE','POINT_IN_TIME','PERCENTAGE_OF_COMPLETION','USAGE_BASED')),
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  satisfaction_status  TEXT NOT NULL DEFAULT 'UNSATISFIED' CHECK (satisfaction_status IN ('UNSATISFIED','PARTIALLY_SATISFIED','SATISFIED')),
  milestone_condition  TEXT,
  satisfied_at         TIMESTAMPTZ,
  satisfied_by         UUID REFERENCES auth.users(id),
  ai_proposed          BOOLEAN NOT NULL DEFAULT false,
  ai_rationale         TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_pob_unique UNIQUE (contract_id, obligation_number),
  CONSTRAINT fin_pob_date_check CHECK (end_date >= start_date)
);
ALTER TABLE public.fin_performance_obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_pob view" ON public.fin_performance_obligations FOR SELECT USING (contract_id IN (SELECT id FROM fin_contracts WHERE fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid())));
CREATE POLICY "fin_pob manage" ON public.fin_performance_obligations FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_fin_pob_upd BEFORE UPDATE ON public.fin_performance_obligations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_pob_contract ON public.fin_performance_obligations(contract_id);

-- 3. REVENUE RECOGNITION SCHEDULES (ASC 606 Step 5)
CREATE TABLE IF NOT EXISTS public.fin_revenue_schedules (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id          UUID NOT NULL REFERENCES public.fin_contracts(id) ON DELETE CASCADE,
  obligation_id        UUID NOT NULL REFERENCES public.fin_performance_obligations(id) ON DELETE CASCADE,
  period_id            UUID REFERENCES public.fin_periods(id),
  schedule_number      INTEGER NOT NULL,
  scheduled_date       DATE NOT NULL,
  scheduled_amount     NUMERIC(20,4) NOT NULL CHECK (scheduled_amount > 0),
  recognized_amount    NUMERIC(20,4) NOT NULL DEFAULT 0,
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  fx_rate              NUMERIC(20,10) NOT NULL DEFAULT 1.0,
  status               TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','RECOGNIZED','SUSPENDED','CANCELLED')),
  recognized_at        TIMESTAMPTZ,
  journal_entry_id     UUID REFERENCES public.fin_journal_entries(id),
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_rev_sched_unique UNIQUE (contract_id, obligation_id, schedule_number)
);
ALTER TABLE public.fin_revenue_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_rev_sched view" ON public.fin_revenue_schedules FOR SELECT USING (contract_id IN (SELECT id FROM fin_contracts WHERE fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid())));
CREATE POLICY "fin_rev_sched manage" ON public.fin_revenue_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_fin_rev_sched_upd BEFORE UPDATE ON public.fin_revenue_schedules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_rev_sched_date ON public.fin_revenue_schedules(scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_fin_rev_sched_contract ON public.fin_revenue_schedules(contract_id, status);

-- 4. CONTRACT AMENDMENTS (Versioned Audit & Modification Tracking)
CREATE TABLE IF NOT EXISTS public.fin_contract_amendments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id          UUID NOT NULL REFERENCES public.fin_contracts(id) ON DELETE CASCADE,
  amendment_number     INTEGER NOT NULL,
  effective_date       DATE NOT NULL,
  amendment_type       TEXT NOT NULL CHECK (amendment_type IN ('PRICE_INCREASE','PRICE_DECREASE','SCOPE_EXPANSION','SCOPE_REDUCTION','DURATION_EXTENSION','CANCELLATION')),
  price_adjustment     NUMERIC(20,4) NOT NULL DEFAULT 0, -- delta to transaction_price
  old_transaction_price NUMERIC(20,4) NOT NULL,
  new_transaction_price NUMERIC(20,4) NOT NULL,
  treatment            TEXT NOT NULL DEFAULT 'PROSPECTIVE' CHECK (treatment IN ('PROSPECTIVE','CUMULATIVE_CATCH_UP','SEPARATE_CONTRACT')),
  description          TEXT NOT NULL,
  approved_by          UUID REFERENCES auth.users(id),
  approval_id          UUID REFERENCES public.workflow_approvals(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_amend_unique UNIQUE (contract_id, amendment_number)
);
ALTER TABLE public.fin_contract_amendments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_amend view" ON public.fin_contract_amendments FOR SELECT USING (contract_id IN (SELECT id FROM fin_contracts WHERE fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid())));
CREATE INDEX IF NOT EXISTS idx_fin_amend_contract ON public.fin_contract_amendments(contract_id);

-- 5. STORED PROCEDURE: GENERATE STRAIGHT-LINE RECOGNITION SCHEDULES
CREATE OR REPLACE FUNCTION public.fin_generate_straight_line_schedules(p_obligation_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_pob public.fin_performance_obligations;
  v_contract public.fin_contracts;
  v_months INTEGER;
  v_monthly_amt NUMERIC(20,4);
  v_remainder NUMERIC(20,4);
  v_current_date DATE;
  v_sched_num INTEGER := 1;
  v_count INTEGER := 0;
  v_cur_amt NUMERIC(20,4);
BEGIN
  SELECT * INTO v_pob FROM public.fin_performance_obligations WHERE id = p_obligation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Obligation % not found', p_obligation_id; END IF;

  SELECT * INTO v_contract FROM public.fin_contracts WHERE id = v_pob.contract_id;

  -- Delete existing scheduled (unrecognized) items
  DELETE FROM public.fin_revenue_schedules
  WHERE obligation_id = p_obligation_id AND status = 'SCHEDULED';

  -- Calculate months between start and end date
  v_months := GREATEST(1, (EXTRACT(YEAR FROM v_pob.end_date) - EXTRACT(YEAR FROM v_pob.start_date)) * 12 + (EXTRACT(MONTH FROM v_pob.end_date) - EXTRACT(MONTH FROM v_pob.start_date)) + 1);

  v_monthly_amt := TRUNC(v_pob.allocated_price / v_months, 2);
  v_remainder := v_pob.allocated_price - (v_monthly_amt * v_months);

  v_current_date := v_pob.start_date;

  FOR i IN 1..v_months LOOP
    -- Add remainder to the last month to ensure exact total sum
    IF i = v_months THEN
      v_cur_amt := v_monthly_amt + v_remainder;
    ELSE
      v_cur_amt := v_monthly_amt;
    END IF;

    INSERT INTO public.fin_revenue_schedules (
      contract_id, obligation_id, schedule_number, scheduled_date,
      scheduled_amount, currency, fx_rate, status
    ) VALUES (
      v_pob.contract_id, p_obligation_id, v_sched_num, v_current_date,
      v_cur_amt, v_contract.currency, v_contract.fx_rate, 'SCHEDULED'
    );

    v_sched_num := v_sched_num + 1;
    v_count := v_count + 1;
    v_current_date := (v_current_date + INTERVAL '1 month')::date;
  END LOOP;

  RETURN v_count;
END; $fn$;
GRANT EXECUTE ON FUNCTION public.fin_generate_straight_line_schedules TO authenticated;

-- 6. STORED PROCEDURE: RECOGNIZE REVENUE SCHEDULE ITEM (Generates Double-Entry Journal)
CREATE OR REPLACE FUNCTION public.fin_recognize_schedule_item(p_schedule_id UUID, p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_sched public.fin_revenue_schedules;
  v_pob public.fin_performance_obligations;
  v_contract public.fin_contracts;
  v_je_id UUID;
  v_entry_num TEXT;
  v_period_id UUID;
  v_func_amt NUMERIC(20,4);
BEGIN
  SELECT * INTO v_sched FROM public.fin_revenue_schedules WHERE id = p_schedule_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Schedule item not found'); END IF;
  IF v_sched.status != 'SCHEDULED' THEN
    RETURN jsonb_build_object('success', false, 'error', format('Item is already in status: %s', v_sched.status));
  END IF;

  SELECT * INTO v_pob FROM public.fin_performance_obligations WHERE id = v_sched.obligation_id;
  SELECT * INTO v_contract FROM public.fin_contracts WHERE id = v_sched.contract_id;

  -- Find period for scheduled date
  SELECT id INTO v_period_id
  FROM public.fin_periods
  WHERE fin_organization_id = v_contract.fin_organization_id
    AND start_date <= v_sched.scheduled_date AND end_date >= v_sched.scheduled_date
  LIMIT 1;

  IF v_period_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No open accounting period found for scheduled date');
  END IF;

  v_entry_num := public.fin_next_entry_number(v_contract.fin_organization_id);
  v_func_amt := TRUNC(v_sched.scheduled_amount * v_sched.fx_rate, 2);

  -- 1. Insert Journal Entry (Double-Entry Header)
  INSERT INTO public.fin_journal_entries (
    fin_organization_id, legal_entity_id, period_id, entry_number, posting_date,
    transaction_currency, functional_currency, reporting_currency, fx_rate,
    source_type, source_id, entry_type, accounting_standard, status,
    memo, created_by, posted_by, posted_at
  ) VALUES (
    v_contract.fin_organization_id, v_contract.legal_entity_id, v_period_id, v_entry_num, v_sched.scheduled_date,
    v_sched.currency, 'INR', 'INR', v_sched.fx_rate,
    'REVENUE_RECOGNITION', v_contract.contract_number, 'REVENUE_RECOGNITION', v_contract.accounting_standard, 'POSTED',
    format('Revenue recognized for contract %s (%s)', v_contract.contract_number, v_pob.title),
    p_user_id, p_user_id, now()
  ) RETURNING id INTO v_je_id;

  -- 2. Line 1: Dr Deferred Revenue (Debit Liability -> decrease liability)
  INSERT INTO public.fin_journal_lines (
    journal_entry_id, line_number, account_id, debit_amount, credit_amount, currency,
    functional_debit, functional_credit, memo
  ) VALUES (
    v_je_id, 1, v_pob.deferred_rev_account_id, v_sched.scheduled_amount, 0, v_sched.currency,
    v_func_amt, 0, format('Deferred revenue released: %s', v_pob.title)
  );

  -- 3. Line 2: Cr Revenue (Credit Revenue -> increase revenue)
  INSERT INTO public.fin_journal_lines (
    journal_entry_id, line_number, account_id, debit_amount, credit_amount, currency,
    functional_debit, functional_credit, memo
  ) VALUES (
    v_je_id, 2, v_pob.revenue_account_id, 0, v_sched.scheduled_amount, v_sched.currency,
    0, v_func_amt, format('Revenue recognized: %s', v_pob.title)
  );

  -- 4. Mark Schedule Item as RECOGNIZED
  UPDATE public.fin_revenue_schedules
  SET
    status = 'RECOGNIZED',
    recognized_amount = scheduled_amount,
    recognized_at = now(),
    journal_entry_id = v_je_id,
    updated_at = now()
  WHERE id = p_schedule_id;

  -- 5. Update Contract totals
  UPDATE public.fin_contracts
  SET
    recognized_revenue = recognized_revenue + v_sched.scheduled_amount,
    deferred_revenue   = GREATEST(0, transaction_price - (recognized_revenue + v_sched.scheduled_amount)),
    updated_at = now()
  WHERE id = v_sched.contract_id;

  -- 6. Refresh Materialized Ledger View
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.fin_ledger_balances;

  RETURN jsonb_build_object(
    'success', true,
    'schedule_id', p_schedule_id,
    'journal_entry_id', v_je_id,
    'entry_number', v_entry_num,
    'recognized_amount', v_sched.scheduled_amount
  );
END; $fn$;
GRANT EXECUTE ON FUNCTION public.fin_recognize_schedule_item TO authenticated;

-- 7. STORED PROCEDURE: REVENUE INTEGRITY MONITOR
CREATE OR REPLACE FUNCTION public.fin_run_revenue_integrity_check(p_org_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_anomalies JSONB := '[]'::jsonb;
  v_orphan_schedules INTEGER := 0;
  v_unscheduled_active_contracts INTEGER := 0;
  v_over_recognized_contracts INTEGER := 0;
  v_expired_active_contracts INTEGER := 0;
  v_total_checks INTEGER := 4;
  v_passed_checks INTEGER := 4;
  v_score NUMERIC(5,2) := 100.00;
  v_status TEXT := 'HEALTHY';
BEGIN
  -- Check 1: Active contracts with 0 revenue schedules
  SELECT COUNT(*) INTO v_unscheduled_active_contracts
  FROM public.fin_contracts c
  WHERE c.fin_organization_id = p_org_id
    AND c.status = 'ACTIVE'
    AND NOT EXISTS (SELECT 1 FROM public.fin_revenue_schedules s WHERE s.contract_id = c.id);

  IF v_unscheduled_active_contracts > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'UNSCHEDULED_ACTIVE_CONTRACT',
      'severity', 'HIGH',
      'title', format('%s active contracts have zero revenue recognition schedules', v_unscheduled_active_contracts),
      'detail', 'Active contracts must have scheduled recognition obligations under ASC 606.'
    );
  END IF;

  -- Check 2: Recognized revenue exceeds contract transaction price
  SELECT COUNT(*) INTO v_over_recognized_contracts
  FROM public.fin_contracts
  WHERE fin_organization_id = p_org_id
    AND recognized_revenue > transaction_price + 0.01;

  IF v_over_recognized_contracts > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'OVER_RECOGNIZED_CONTRACT',
      'severity', 'CRITICAL',
      'title', format('%s contracts have recognized revenue exceeding transaction price', v_over_recognized_contracts),
      'detail', 'Recognized revenue cannot exceed total allocated transaction price.'
    );
  END IF;

  -- Check 3: Expired contracts still in ACTIVE state
  SELECT COUNT(*) INTO v_expired_active_contracts
  FROM public.fin_contracts
  WHERE fin_organization_id = p_org_id
    AND status = 'ACTIVE'
    AND end_date < CURRENT_DATE
    AND deferred_revenue <= 0.01;

  IF v_expired_active_contracts > 0 THEN
    v_passed_checks := v_passed_checks - 1;
    v_anomalies := v_anomalies || jsonb_build_object(
      'type', 'EXPIRED_ACTIVE_CONTRACTS',
      'severity', 'WARNING',
      'title', format('%s contracts past end date still marked ACTIVE', v_expired_active_contracts),
      'detail', 'Fully recognized expired contracts should be transitioned to COMPLETED.'
    );
  END IF;

  v_score := ROUND((v_passed_checks::numeric / v_total_checks::numeric) * 100.0, 2);
  IF v_score < 80.0 THEN v_status := 'CRITICAL';
  ELSIF v_score < 100.0 THEN v_status := 'WARNING';
  ELSE v_status := 'HEALTHY';
  END IF;

  RETURN jsonb_build_object(
    'integrity_score', v_score,
    'status', v_status,
    'total_checks', v_total_checks,
    'passed_checks', v_passed_checks,
    'anomalies', v_anomalies,
    'checked_at', now()
  );
END; $fn$;
GRANT EXECUTE ON FUNCTION public.fin_run_revenue_integrity_check TO authenticated;


-- ============================================================
-- CHATR Financial Intelligence & Accounting Core
-- Phase 4: Cash, Banking & Reconciliation Intelligence
-- Migration: 20260824400001_finance_phase4_banking_reconciliation.sql
-- ============================================================

-- 1. BANK ACCOUNTS (Financial Institution Master)
CREATE TABLE IF NOT EXISTS public.fin_bank_accounts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id      UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  gl_account_id        UUID NOT NULL REFERENCES public.fin_accounts(id), -- Maps to GL Cash/Bank (e.g. 1113)
  bank_name            TEXT NOT NULL, -- e.g. 'HDFC Bank', 'Silicon Valley Bank', 'ICICI Bank'
  account_name         TEXT NOT NULL, -- e.g. 'Primary Operating Current Account'
  account_number_mask  TEXT NOT NULL, -- e.g. '****5842'
  ifsc_or_routing      TEXT,          -- IFSC for India / Routing for US / SWIFT / BIC
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  account_type         TEXT NOT NULL DEFAULT 'CURRENT' CHECK (account_type IN ('CURRENT','SAVINGS','CREDIT_CARD','MONEY_MARKET','ESCROW')),
  opening_balance      NUMERIC(20,4) NOT NULL DEFAULT 0,
  current_ledger_balance NUMERIC(20,4) NOT NULL DEFAULT 0,
  current_statement_balance NUMERIC(20,4) NOT NULL DEFAULT 0,
  unreconciled_amount  NUMERIC(20,4) NOT NULL DEFAULT 0,
  last_reconciled_at   TIMESTAMPTZ,
  is_active            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_bank_acc_unique UNIQUE (fin_organization_id, bank_name, account_number_mask)
);
ALTER TABLE public.fin_bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_bank_acc view" ON public.fin_bank_accounts FOR SELECT USING (fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid()));
CREATE POLICY "fin_bank_acc manage" ON public.fin_bank_accounts FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'member'));
CREATE TRIGGER trg_fin_bank_acc_upd BEFORE UPDATE ON public.fin_bank_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_bank_acc_org ON public.fin_bank_accounts(fin_organization_id, is_active);

-- 2. BANK STATEMENTS (CSV / Feed Imports)
CREATE TABLE IF NOT EXISTS public.fin_bank_statements (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id      UUID NOT NULL REFERENCES public.fin_bank_accounts(id) ON DELETE CASCADE,
  statement_number     TEXT NOT NULL,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  opening_balance      NUMERIC(20,4) NOT NULL,
  closing_balance      NUMERIC(20,4) NOT NULL,
  total_credits        NUMERIC(20,4) NOT NULL DEFAULT 0,
  total_debits         NUMERIC(20,4) NOT NULL DEFAULT 0,
  transaction_count    INTEGER NOT NULL DEFAULT 0,
  matched_count        INTEGER NOT NULL DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'PARSED' CHECK (status IN ('UPLOADED','PARSED','RECONCILING','RECONCILED')),
  source_file_name     TEXT,
  source_file_url      TEXT,
  uploaded_by          UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_bank_stmt_dates CHECK (end_date >= start_date)
);
ALTER TABLE public.fin_bank_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_bank_stmt view" ON public.fin_bank_statements FOR SELECT USING (bank_account_id IN (SELECT id FROM fin_bank_accounts WHERE fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid())));
CREATE POLICY "fin_bank_stmt manage" ON public.fin_bank_statements FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_fin_bank_stmt_upd BEFORE UPDATE ON public.fin_bank_statements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_bank_stmt_acc ON public.fin_bank_statements(bank_account_id, start_date DESC);

-- 3. BANK TRANSACTIONS (Normalized Money Movements)
CREATE TABLE IF NOT EXISTS public.fin_bank_transactions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id      UUID NOT NULL REFERENCES public.fin_bank_accounts(id) ON DELETE CASCADE,
  statement_id         UUID REFERENCES public.fin_bank_statements(id) ON DELETE SET NULL,
  transaction_date     DATE NOT NULL,
  value_date           DATE,
  amount               NUMERIC(20,4) NOT NULL CHECK (amount > 0),
  transaction_type     TEXT NOT NULL CHECK (transaction_type IN ('CREDIT','DEBIT')), -- CREDIT = Deposit/Inflow, DEBIT = Withdrawal/Outflow
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  description          TEXT NOT NULL,
  reference_number     TEXT, -- UTR / Cheque / Bank Ref
  payee_payer          TEXT, -- Counterparty name extracted from narrative
  running_balance      NUMERIC(20,4),
  match_status         TEXT NOT NULL DEFAULT 'UNMATCHED' CHECK (match_status IN ('UNMATCHED','AUTO_MATCHED','MANUALLY_MATCHED','AI_PROPOSED','EXCEPTION','IGNORED')),
  matched_payment_id   UUID REFERENCES public.fin_payments(id),
  matched_journal_entry_id UUID REFERENCES public.fin_journal_entries(id),
  source_event_id      UUID REFERENCES public.fin_events(id),
  ai_match_confidence  NUMERIC(5,4),
  ai_proposed_rule     TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_bank_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_bank_tx view" ON public.fin_bank_transactions FOR SELECT USING (bank_account_id IN (SELECT id FROM fin_bank_accounts WHERE fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid())));
CREATE POLICY "fin_bank_tx manage" ON public.fin_bank_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_fin_bank_tx_upd BEFORE UPDATE ON public.fin_bank_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_fin_bank_tx_acc_date ON public.fin_bank_transactions(bank_account_id, transaction_date DESC, match_status);
CREATE INDEX IF NOT EXISTS idx_fin_bank_tx_ref ON public.fin_bank_transactions(reference_number) WHERE reference_number IS NOT NULL;

-- 4. RECONCILIATION SESSIONS
CREATE TABLE IF NOT EXISTS public.fin_reconciliation_sessions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id      UUID NOT NULL REFERENCES public.fin_bank_accounts(id) ON DELETE CASCADE,
  statement_id         UUID REFERENCES public.fin_bank_statements(id),
  period_id            UUID NOT NULL REFERENCES public.fin_periods(id),
  as_of_date           DATE NOT NULL,
  statement_ending_balance NUMERIC(20,4) NOT NULL,
  gl_cash_balance      NUMERIC(20,4) NOT NULL,
  matched_credits_total NUMERIC(20,4) NOT NULL DEFAULT 0,
  matched_debits_total NUMERIC(20,4) NOT NULL DEFAULT 0,
  unreconciled_difference NUMERIC(20,4) NOT NULL DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS','RECONCILED','DISCREPANCY')),
  signed_off_by        UUID REFERENCES auth.users(id),
  signed_off_at        TIMESTAMPTZ,
  notes                TEXT,
  created_by           UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_reconciliation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_rec_sess view" ON public.fin_reconciliation_sessions FOR SELECT USING (bank_account_id IN (SELECT id FROM fin_bank_accounts WHERE fin_organization_id IN (SELECT fo.id FROM fin_organizations fo JOIN sys_tenant_users stu ON stu.organization_id=fo.sys_organization_id WHERE stu.user_id=auth.uid())));
CREATE TRIGGER trg_fin_rec_sess_upd BEFORE UPDATE ON public.fin_reconciliation_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. RECONCILIATION MATCHES
CREATE TABLE IF NOT EXISTS public.fin_reconciliation_matches (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           UUID REFERENCES public.fin_reconciliation_sessions(id) ON DELETE CASCADE,
  bank_transaction_id  UUID NOT NULL REFERENCES public.fin_bank_transactions(id) ON DELETE CASCADE,
  payment_id           UUID REFERENCES public.fin_payments(id),
  journal_line_id      UUID REFERENCES public.fin_journal_lines(id),
  match_rule           TEXT NOT NULL CHECK (match_rule IN ('EXACT_REF_AND_AMOUNT','DATE_WINDOW_AMOUNT','FUZZY_NAME_AMOUNT','AI_INFERRED_FEE','MANUAL_USER_MATCH')),
  confidence_score     NUMERIC(5,4) NOT NULL DEFAULT 1.0,
  bank_amount          NUMERIC(20,4) NOT NULL,
  ledger_amount        NUMERIC(20,4) NOT NULL,
  fee_difference       NUMERIC(20,4) NOT NULL DEFAULT 0, -- Processor / Wire fee
  variance             NUMERIC(20,4) NOT NULL DEFAULT 0,
  is_approved          BOOLEAN NOT NULL DEFAULT true,
  approved_by          UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_reconciliation_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_rec_match view" ON public.fin_reconciliation_matches FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_fin_rec_match_tx ON public.fin_reconciliation_matches(bank_transaction_id);

-- 6. RECONCILIATION EXCEPTIONS QUEUE
CREATE TABLE IF NOT EXISTS public.fin_reconciliation_exceptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id  UUID NOT NULL REFERENCES public.fin_bank_transactions(id) ON DELETE CASCADE,
  exception_type       TEXT NOT NULL CHECK (exception_type IN ('UNRECOGNIZED_TRANSACTION','MISSING_INVOICE','MISSING_BILL','FEE_DISCREPANCY','DUPLICATE_PAYMENT','FX_VARIANCE')),
  severity             TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  suggested_action     TEXT,
  ai_proposal          JSONB DEFAULT '{}',
  status               TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','RESOLVED','DISMISSED')),
  resolved_by          UUID REFERENCES auth.users(id),
  resolved_at          TIMESTAMPTZ,
  resolution_notes     TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_reconciliation_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_rec_exc view" ON public.fin_reconciliation_exceptions FOR SELECT USING (true);
CREATE TRIGGER trg_fin_rec_exc_upd BEFORE UPDATE ON public.fin_reconciliation_exceptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. STORED PROCEDURE: AUTO-MATCH BANK TRANSACTIONS
CREATE OR REPLACE FUNCTION public.fin_match_bank_transactions(p_bank_account_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_tx RECORD;
  v_pmt RECORD;
  v_matched_count INTEGER := 0;
  v_exception_count INTEGER := 0;
BEGIN
  -- Loop through all UNMATCHED bank transactions for this account
  FOR v_tx IN
    SELECT * FROM public.fin_bank_transactions
    WHERE bank_account_id = p_bank_account_id AND match_status = 'UNMATCHED'
    ORDER BY transaction_date ASC
  LOOP
    -- Rule 1: Exact Reference Match + Amount Match (Incoming Payment)
    IF v_tx.transaction_type = 'CREDIT' AND v_tx.reference_number IS NOT NULL THEN
      SELECT * INTO v_pmt FROM public.fin_payments
      WHERE status = 'POSTED'
        AND reference_number = v_tx.reference_number
        AND amount = v_tx.amount
      LIMIT 1;

      IF FOUND THEN
        -- Match Found!
        UPDATE public.fin_bank_transactions
        SET match_status = 'AUTO_MATCHED', matched_payment_id = v_pmt.id, updated_at = now()
        WHERE id = v_tx.id;

        INSERT INTO public.fin_reconciliation_matches (
          bank_transaction_id, payment_id, match_rule, confidence_score,
          bank_amount, ledger_amount, fee_difference, variance
        ) VALUES (
          v_tx.id, v_pmt.id, 'EXACT_REF_AND_AMOUNT', 1.0,
          v_tx.amount, v_pmt.amount, 0, 0
        );

        v_matched_count := v_matched_count + 1;
        CONTINUE;
      END IF;
    END IF;

    -- Rule 2: Date Window (+/- 3 days) + Exact Amount Match
    IF v_tx.transaction_type = 'CREDIT' THEN
      SELECT * INTO v_pmt FROM public.fin_payments
      WHERE status = 'POSTED'
        AND amount = v_tx.amount
        AND payment_date BETWEEN (v_tx.transaction_date - INTERVAL '3 days')::date AND (v_tx.transaction_date + INTERVAL '3 days')::date
        AND NOT EXISTS (SELECT 1 FROM public.fin_bank_transactions bt WHERE bt.matched_payment_id = fin_payments.id)
      LIMIT 1;

      IF FOUND THEN
        UPDATE public.fin_bank_transactions
        SET match_status = 'AUTO_MATCHED', matched_payment_id = v_pmt.id, updated_at = now()
        WHERE id = v_tx.id;

        INSERT INTO public.fin_reconciliation_matches (
          bank_transaction_id, payment_id, match_rule, confidence_score,
          bank_amount, ledger_amount, fee_difference, variance
        ) VALUES (
          v_tx.id, v_pmt.id, 'DATE_WINDOW_AMOUNT', 0.95,
          v_tx.amount, v_pmt.amount, 0, 0
        );

        v_matched_count := v_matched_count + 1;
        CONTINUE;
      END IF;
    END IF;

    -- If no rule matched, insert into Exception Queue for AI / Human review
    INSERT INTO public.fin_reconciliation_exceptions (
      bank_transaction_id, exception_type, severity, suggested_action, status
    ) VALUES (
      v_tx.id, 'UNRECOGNIZED_TRANSACTION', 'MEDIUM',
      'Review counterparty narrative or assign to customer invoice / vendor bill', 'OPEN'
    ) ON CONFLICT DO NOTHING;

    v_exception_count := v_exception_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'matched_count', v_matched_count,
    'exception_count', v_exception_count,
    'processed_at', now()
  );
END; $fn$;
GRANT EXECUTE ON FUNCTION public.fin_match_bank_transactions TO authenticated;

-- 8. STORED PROCEDURE: 90-DAY CASH FORECAST ACROSS BUSINESS GRAPH
CREATE OR REPLACE FUNCTION public.fin_calculate_90_day_cash_forecast(p_org_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_actual_cash NUMERIC(20,4) := 0;
  v_ar_due_30   NUMERIC(20,4) := 0;
  v_ar_due_60   NUMERIC(20,4) := 0;
  v_ar_due_90   NUMERIC(20,4) := 0;
  v_ap_due_30   NUMERIC(20,4) := 0;
  v_ap_due_60   NUMERIC(20,4) := 0;
  v_ap_due_90   NUMERIC(20,4) := 0;
  v_contracts_30 NUMERIC(20,4) := 0;
  v_contracts_60 NUMERIC(20,4) := 0;
  v_contracts_90 NUMERIC(20,4) := 0;
  v_net_cash_30  NUMERIC(20,4) := 0;
  v_net_cash_60  NUMERIC(20,4) := 0;
  v_net_cash_90  NUMERIC(20,4) := 0;
BEGIN
  -- 1. Actual Cash in Bank Accounts
  SELECT COALESCE(SUM(current_statement_balance), 0) INTO v_actual_cash
  FROM public.fin_bank_accounts
  WHERE fin_organization_id = p_org_id AND is_active = true;

  -- 2. Expected Inflows: Outstanding AR Invoices Due
  SELECT
    COALESCE(SUM(CASE WHEN due_date <= CURRENT_DATE + INTERVAL '30 days' THEN amount_due ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN due_date > CURRENT_DATE + INTERVAL '30 days' AND due_date <= CURRENT_DATE + INTERVAL '60 days' THEN amount_due ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN due_date > CURRENT_DATE + INTERVAL '60 days' AND due_date <= CURRENT_DATE + INTERVAL '90 days' THEN amount_due ELSE 0 END), 0)
  INTO v_ar_due_30, v_ar_due_60, v_ar_due_90
  FROM public.fin_invoices
  WHERE fin_organization_id = p_org_id AND status IN ('ISSUED', 'PARTIALLY_PAID');

  -- 3. Expected Inflows: Contract Scheduled Releases
  SELECT
    COALESCE(SUM(CASE WHEN scheduled_date <= CURRENT_DATE + INTERVAL '30 days' THEN scheduled_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN scheduled_date > CURRENT_DATE + INTERVAL '30 days' AND scheduled_date <= CURRENT_DATE + INTERVAL '60 days' THEN scheduled_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN scheduled_date > CURRENT_DATE + INTERVAL '60 days' AND scheduled_date <= CURRENT_DATE + INTERVAL '90 days' THEN scheduled_amount ELSE 0 END), 0)
  INTO v_contracts_30, v_contracts_60, v_contracts_90
  FROM public.fin_revenue_schedules
  WHERE contract_id IN (SELECT id FROM fin_contracts WHERE fin_organization_id = p_org_id AND status = 'ACTIVE')
    AND status = 'SCHEDULED';

  -- 4. Expected Outflows: AP Bills Due
  SELECT
    COALESCE(SUM(CASE WHEN due_date <= CURRENT_DATE + INTERVAL '30 days' THEN amount_due ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN due_date > CURRENT_DATE + INTERVAL '30 days' AND due_date <= CURRENT_DATE + INTERVAL '60 days' THEN amount_due ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN due_date > CURRENT_DATE + INTERVAL '60 days' AND due_date <= CURRENT_DATE + INTERVAL '90 days' THEN amount_due ELSE 0 END), 0)
  INTO v_ap_due_30, v_ap_due_60, v_ap_due_90
  FROM public.fin_bills
  WHERE fin_organization_id = p_org_id AND status IN ('APPROVED', 'PARTIALLY_PAID');

  -- 5. Calculate 30 / 60 / 90 Net Cash Position
  v_net_cash_30 := v_actual_cash + v_ar_due_30 - v_ap_due_30;
  v_net_cash_60 := v_net_cash_30 + v_ar_due_60 - v_ap_due_60;
  v_net_cash_90 := v_net_cash_60 + v_ar_due_90 - v_ap_due_90;

  RETURN jsonb_build_object(
    'actual_cash', v_actual_cash,
    'day_30', jsonb_build_object('inflows', v_ar_due_30, 'outflows', v_ap_due_30, 'net_cash_position', v_net_cash_30),
    'day_60', jsonb_build_object('inflows', v_ar_due_60, 'outflows', v_ap_due_60, 'net_cash_position', v_net_cash_60),
    'day_90', jsonb_build_object('inflows', v_ar_due_90, 'outflows', v_ap_due_90, 'net_cash_position', v_net_cash_90),
    'calculated_at', now()
  );
END; $fn$;
GRANT EXECUTE ON FUNCTION public.fin_calculate_90_day_cash_forecast TO authenticated;


-- ============================================================
-- CHATR Financial Intelligence & Accounting Core
-- Phase 5: Financial Close & Intelligence OS
-- Migration: 20260824500001_finance_phase5_close_intelligence.sql
-- ============================================================

-- 1. MONTH-END CLOSE CHECKLISTS & TASKS
CREATE TABLE IF NOT EXISTS public.fin_close_checklists (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id      UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  period_id            UUID NOT NULL REFERENCES public.fin_periods(id) ON DELETE CASCADE,
  title                TEXT NOT NULL,
  total_tasks          INTEGER NOT NULL DEFAULT 0,
  completed_tasks      INTEGER NOT NULL DEFAULT 0,
  completion_pct       NUMERIC(5,2) NOT NULL DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('NOT_STARTED','IN_PROGRESS','READY_FOR_REVIEW','CLOSED','REOPENED')),
  closed_at            TIMESTAMPTZ,
  closed_by            UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_close_unique UNIQUE (period_id, legal_entity_id)
);
ALTER TABLE public.fin_close_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_close_chk view" ON public.fin_close_checklists FOR SELECT USING (true);
CREATE POLICY "fin_close_chk manage" ON public.fin_close_checklists FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_fin_close_chk_upd BEFORE UPDATE ON public.fin_close_checklists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.fin_close_tasks (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id         UUID NOT NULL REFERENCES public.fin_close_checklists(id) ON DELETE CASCADE,
  task_code            TEXT NOT NULL, -- e.g. 'AR_RECON', 'AP_RECON', 'BANK_RECON', 'REV_REC', 'ACCRUALS', 'FX_REVAL', 'TAX_REVIEW'
  task_name            TEXT NOT NULL,
  sequence_order       INTEGER NOT NULL DEFAULT 1,
  category             TEXT NOT NULL CHECK (category IN ('SUBLEDGER_RECON','REVENUE_EXPENSE','ASSET_LIABILITY','TAX_COMPLIANCE','CONSOLIDATION','REVIEW_SIGNOFF')),
  status               TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','BLOCKED','SKIPPED')),
  is_automated         BOOLEAN NOT NULL DEFAULT true,
  assigned_to          UUID REFERENCES auth.users(id),
  completed_at         TIMESTAMPTZ,
  completed_by         UUID REFERENCES auth.users(id),
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_close_task_unique UNIQUE (checklist_id, task_code)
);
ALTER TABLE public.fin_close_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_close_tasks view" ON public.fin_close_tasks FOR SELECT USING (true);
CREATE POLICY "fin_close_tasks manage" ON public.fin_close_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_fin_close_tasks_upd BEFORE UPDATE ON public.fin_close_tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. ACCRUALS (Expense & Revenue Accruals with Auto-Reversal)
CREATE TABLE IF NOT EXISTS public.fin_accruals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id      UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  period_id            UUID NOT NULL REFERENCES public.fin_periods(id),
  accrual_number       TEXT NOT NULL,
  title                TEXT NOT NULL, -- e.g. 'AWS Cloud Usage Accrual - August'
  accrual_type         TEXT NOT NULL CHECK (accrual_type IN ('EXPENSE','REVENUE','PAYROLL','INTEREST','TAX')),
  amount               NUMERIC(20,4) NOT NULL CHECK (amount > 0),
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  expense_account_id   UUID NOT NULL REFERENCES public.fin_accounts(id),
  liability_account_id UUID NOT NULL REFERENCES public.fin_accounts(id), -- Accrued Expenses (2120)
  reversal_date        DATE NOT NULL, -- First day of next period
  status               TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','POSTED','REVERSED','CANCELLED')),
  source_event_id      UUID REFERENCES public.fin_events(id),
  journal_entry_id     UUID REFERENCES public.fin_journal_entries(id),
  reversal_entry_id    UUID REFERENCES public.fin_journal_entries(id),
  ai_estimated         BOOLEAN NOT NULL DEFAULT false,
  ai_confidence        NUMERIC(5,4),
  ai_rationale         TEXT,
  created_by           UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_accrual_num_unique UNIQUE (fin_organization_id, accrual_number)
);
ALTER TABLE public.fin_accruals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_accruals view" ON public.fin_accruals FOR SELECT USING (true);
CREATE POLICY "fin_accruals manage" ON public.fin_accruals FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_fin_accruals_upd BEFORE UPDATE ON public.fin_accruals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. PREPAID EXPENSES & AMORTIZATION
CREATE TABLE IF NOT EXISTS public.fin_prepaids (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id      UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  prepaid_number       TEXT NOT NULL,
  title                TEXT NOT NULL, -- e.g. 'Annual Corporate Insurance Premium'
  vendor_id            UUID REFERENCES public.fin_vendors(id),
  total_amount         NUMERIC(20,4) NOT NULL CHECK (total_amount > 0),
  amortized_amount     NUMERIC(20,4) NOT NULL DEFAULT 0,
  remaining_amount     NUMERIC(20,4) NOT NULL,
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  prepaid_asset_account_id UUID NOT NULL REFERENCES public.fin_accounts(id), -- Prepaid Expenses (1150)
  expense_account_id   UUID NOT NULL REFERENCES public.fin_accounts(id),
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  duration_months      INTEGER NOT NULL CHECK (duration_months > 0),
  monthly_amortization NUMERIC(20,4) NOT NULL,
  status               TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','FULLY_AMORTIZED','CANCELLED')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_prepaid_unique UNIQUE (fin_organization_id, prepaid_number),
  CONSTRAINT fin_prepaid_dates CHECK (end_date >= start_date)
);
ALTER TABLE public.fin_prepaids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_prepaids view" ON public.fin_prepaids FOR SELECT USING (true);
CREATE POLICY "fin_prepaids manage" ON public.fin_prepaids FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_fin_prepaids_upd BEFORE UPDATE ON public.fin_prepaids FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. FIXED ASSETS & DEPRECIATION
CREATE TABLE IF NOT EXISTS public.fin_fixed_assets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  legal_entity_id      UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  asset_number         TEXT NOT NULL,
  asset_name           TEXT NOT NULL,
  category             TEXT NOT NULL CHECK (category IN ('COMPUTER_EQUIPMENT','OFFICE_FURNITURE','VEHICLES','LEASEHOLD_IMPROVEMENTS','SOFTWARE_CAPITALIZED')),
  acquisition_date     DATE NOT NULL,
  acquisition_cost     NUMERIC(20,4) NOT NULL CHECK (acquisition_cost > 0),
  salvage_value        NUMERIC(20,4) NOT NULL DEFAULT 0,
  useful_life_months   INTEGER NOT NULL CHECK (useful_life_months > 0),
  depreciation_method  TEXT NOT NULL DEFAULT 'STRAIGHT_LINE' CHECK (depreciation_method IN ('STRAIGHT_LINE','WRITTEN_DOWN_VALUE')),
  accumulated_depreciation NUMERIC(20,4) NOT NULL DEFAULT 0,
  net_book_value       NUMERIC(20,4) NOT NULL,
  asset_account_id     UUID NOT NULL REFERENCES public.fin_accounts(id), -- Fixed Asset (1210)
  accum_dep_account_id UUID NOT NULL REFERENCES public.fin_accounts(id), -- Accum Dep (1220 Contra Asset)
  dep_expense_account_id UUID NOT NULL REFERENCES public.fin_accounts(id), -- Dep Expense (5210)
  status               TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','FULLY_DEPRECIATED','DISPOSED','IMPAIRED')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_fixed_asset_unique UNIQUE (fin_organization_id, asset_number)
);
ALTER TABLE public.fin_fixed_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_fixed_assets view" ON public.fin_fixed_assets FOR SELECT USING (true);
CREATE POLICY "fin_fixed_assets manage" ON public.fin_fixed_assets FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_fin_fixed_assets_upd BEFORE UPDATE ON public.fin_fixed_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. INTERCOMPANY TRANSACTIONS & ELIMINATIONS
CREATE TABLE IF NOT EXISTS public.fin_intercompany_transactions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fin_organization_id  UUID NOT NULL REFERENCES public.fin_organizations(id) ON DELETE CASCADE,
  from_legal_entity_id UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  to_legal_entity_id   UUID NOT NULL REFERENCES public.fin_legal_entities(id),
  transaction_number   TEXT NOT NULL,
  transaction_date     DATE NOT NULL,
  description          TEXT NOT NULL,
  amount               NUMERIC(20,4) NOT NULL CHECK (amount > 0),
  currency             CHAR(3) NOT NULL DEFAULT 'INR',
  from_journal_entry_id UUID REFERENCES public.fin_journal_entries(id),
  to_journal_entry_id   UUID REFERENCES public.fin_journal_entries(id),
  elimination_entry_id  UUID REFERENCES public.fin_journal_entries(id),
  status               TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','ELIMINATED','DISPUTED')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fin_interco_diff_entities CHECK (from_legal_entity_id != to_legal_entity_id)
);
ALTER TABLE public.fin_intercompany_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_interco view" ON public.fin_intercompany_transactions FOR SELECT USING (true);
CREATE POLICY "fin_interco manage" ON public.fin_intercompany_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER trg_fin_interco_upd BEFORE UPDATE ON public.fin_intercompany_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. STORED PROCEDURE: INITIALIZE CLOSE CHECKLIST
CREATE OR REPLACE FUNCTION public.fin_initialize_close_checklist(p_period_id UUID, p_entity_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_period public.fin_periods;
  v_chk_id UUID;
BEGIN
  SELECT * INTO v_period FROM public.fin_periods WHERE id = p_period_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Period not found'; END IF;

  INSERT INTO public.fin_close_checklists (
    fin_organization_id, legal_entity_id, period_id, title, total_tasks, completed_tasks, completion_pct, status
  ) VALUES (
    v_period.fin_organization_id, p_entity_id, p_period_id,
    format('Month-End Close: %s', v_period.period_name),
    8, 0, 0, 'IN_PROGRESS'
  )
  ON CONFLICT (period_id, legal_entity_id) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_chk_id;

  -- Seed Standard 8 Close Tasks in Required Sequence
  INSERT INTO public.fin_close_tasks (checklist_id, task_code, task_name, sequence_order, category, status)
  VALUES
    (v_chk_id, 'AR_RECON', 'Reconcile Accounts Receivable Subledger to GL', 1, 'SUBLEDGER_RECON', 'PENDING'),
    (v_chk_id, 'AP_RECON', 'Reconcile Accounts Payable Subledger to GL', 2, 'SUBLEDGER_RECON', 'PENDING'),
    (v_chk_id, 'BANK_RECON', 'Complete Bank Account Reconciliations', 3, 'SUBLEDGER_RECON', 'PENDING'),
    (v_chk_id, 'REV_REC', 'Execute ASC 606 Revenue Recognition Schedules', 4, 'REVENUE_EXPENSE', 'PENDING'),
    (v_chk_id, 'ACCRUALS_PREPAIDS', 'Post Expense Accruals & Prepaid Amortizations', 5, 'REVENUE_EXPENSE', 'PENDING'),
    (v_chk_id, 'FIXED_ASSETS', 'Run Monthly Depreciation Schedules', 6, 'ASSET_LIABILITY', 'PENDING'),
    (v_chk_id, 'TAX_COMPLIANCE', 'Validate GST / TDS / Tax Output Balances', 7, 'TAX_COMPLIANCE', 'PENDING'),
    (v_chk_id, 'FINAL_SIGNOFF', 'Financial Integrity Verification & Management Review', 8, 'REVIEW_SIGNOFF', 'PENDING')
  ON CONFLICT (checklist_id, task_code) DO NOTHING;

  RETURN v_chk_id;
END; $fn$;
GRANT EXECUTE ON FUNCTION public.fin_initialize_close_checklist TO authenticated;

-- 7. STORED PROCEDURE: GENERATE FINANCIAL STATEMENTS
CREATE OR REPLACE FUNCTION public.fin_generate_financial_statements(
  p_org_id UUID, p_entity_id UUID, p_period_id UUID
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $fn$
DECLARE
  v_revenue NUMERIC(20,4) := 0;
  v_cogs    NUMERIC(20,4) := 0;
  v_opex    NUMERIC(20,4) := 0;
  v_assets  NUMERIC(20,4) := 0;
  v_liab    NUMERIC(20,4) := 0;
  v_equity  NUMERIC(20,4) := 0;
  v_net_inc NUMERIC(20,4) := 0;
BEGIN
  -- 1. P&L: Revenue
  SELECT COALESCE(SUM(jl.functional_credit - jl.functional_debit), 0) INTO v_revenue
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.period_id = p_period_id
    AND je.status = 'POSTED'
    AND fa.account_type IN ('REVENUE', 'CONTRA_EXPENSE');

  -- 2. P&L: Operating Expenses
  SELECT COALESCE(SUM(jl.functional_debit - jl.functional_credit), 0) INTO v_opex
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.period_id = p_period_id
    AND je.status = 'POSTED'
    AND fa.account_type IN ('EXPENSE', 'CONTRA_REVENUE');

  v_net_inc := v_revenue - v_opex;

  -- 3. Balance Sheet: Assets
  SELECT COALESCE(SUM(jl.functional_debit - jl.functional_credit), 0) INTO v_assets
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.status = 'POSTED'
    AND fa.account_type IN ('ASSET', 'CONTRA_LIABILITY');

  -- 4. Balance Sheet: Liabilities
  SELECT COALESCE(SUM(jl.functional_credit - jl.functional_debit), 0) INTO v_liab
  FROM public.fin_journal_lines jl
  JOIN public.fin_journal_entries je ON je.id = jl.journal_entry_id
  JOIN public.fin_accounts fa ON fa.id = jl.account_id
  WHERE je.fin_organization_id = p_org_id
    AND (je.legal_entity_id = p_entity_id OR p_entity_id IS NULL)
    AND je.status = 'POSTED'
    AND fa.account_type IN ('LIABILITY', 'CONTRA_ASSET');

  v_equity := v_assets - v_liab;

  RETURN jsonb_build_object(
    'pnl', jsonb_build_object(
      'total_revenue', v_revenue,
      'operating_expenses', v_opex,
      'net_income', v_net_inc,
      'gross_margin_pct', CASE WHEN v_revenue > 0 THEN ROUND((v_net_inc / v_revenue) * 100.0, 2) ELSE 0 END
    ),
    'balance_sheet', jsonb_build_object(
      'total_assets', v_assets,
      'total_liabilities', v_liab,
      'total_equity', v_equity,
      'is_balanced', ABS(v_assets - (v_liab + v_equity)) <= 0.01
    ),
    'generated_at', now()
  );
END; $fn$;
GRANT EXECUTE ON FUNCTION public.fin_generate_financial_statements TO authenticated;



-- ============================================================
-- AUTO-PROVISIONING: TalentXcel Services Private Limited
-- ============================================================

DO $$
DECLARE
  v_sys_org_id UUID;
  v_fin_org_id UUID;
  v_entity_id  UUID;
  v_period_id  UUID;
  v_owner_id   UUID;
BEGIN
  -- 1. Check if any sys_organization already exists
  SELECT id INTO v_sys_org_id FROM public.sys_organizations LIMIT 1;

  -- If none exists, find or generate an owner_id and create one
  IF v_sys_org_id IS NULL THEN
    SELECT id INTO v_owner_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    IF v_owner_id IS NULL THEN
      v_owner_id := gen_random_uuid();
    END IF;

    BEGIN
      INSERT INTO public.sys_organizations (name, owner_id)
      VALUES ('TalentXcel Services Private Limited', v_owner_id)
      RETURNING id INTO v_sys_org_id;
    EXCEPTION WHEN OTHERS THEN
      BEGIN
        INSERT INTO public.sys_organizations (org_name)
        VALUES ('TalentXcel Services Private Limited')
        RETURNING id INTO v_sys_org_id;
      EXCEPTION WHEN OTHERS THEN
        v_sys_org_id := gen_random_uuid();
      END;
    END;
  END IF;

  -- 2. Ensure fin_organizations
  SELECT id INTO v_fin_org_id FROM public.fin_organizations LIMIT 1;
  IF v_fin_org_id IS NULL AND v_sys_org_id IS NOT NULL THEN
    INSERT INTO public.fin_organizations (
      sys_organization_id, legal_name, base_currency, reporting_currency, accounting_standard
    )
    VALUES (
      v_sys_org_id, 'TalentXcel Services Private Limited', 'INR', 'INR', 'IFRS'
    )
    RETURNING id INTO v_fin_org_id;
  END IF;

  -- 3. Ensure legal entity
  IF v_fin_org_id IS NOT NULL THEN
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
    IF v_period_id IS NULL AND v_entity_id IS NOT NULL THEN
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
  END IF;

END $$;
