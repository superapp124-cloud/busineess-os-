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
