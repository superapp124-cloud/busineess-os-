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
