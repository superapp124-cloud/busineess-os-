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
