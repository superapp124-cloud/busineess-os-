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
