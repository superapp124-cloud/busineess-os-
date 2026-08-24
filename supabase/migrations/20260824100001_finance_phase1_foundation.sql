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
