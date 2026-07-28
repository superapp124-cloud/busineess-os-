CREATE TABLE IF NOT EXISTS public.finance_invoices (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES public.sys_organizations(id) ON DELETE CASCADE, client_name text NOT NULL, amount numeric(12,2) NOT NULL, currency text DEFAULT 'USD', status text NOT NULL DEFAULT 'Draft', due_date date, items jsonb DEFAULT '[]'::jsonb, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
ALTER TABLE public.finance_invoices ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_fin_inv_org ON public.finance_invoices(org_id);
ALTER TABLE public.finance_invoices REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS public.finance_expenses (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES public.sys_organizations(id) ON DELETE CASCADE, submitted_by uuid NOT NULL REFERENCES auth.users(id), merchant text NOT NULL, amount numeric(12,2) NOT NULL, currency text DEFAULT 'USD', category text, status text NOT NULL DEFAULT 'Pending', receipt_url text, incurred_date date, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
ALTER TABLE public.finance_expenses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_fin_exp_org ON public.finance_expenses(org_id);
ALTER TABLE public.finance_expenses REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS public.finance_payroll (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES public.sys_organizations(id) ON DELETE CASCADE, period_start date NOT NULL, period_end date NOT NULL, total_amount numeric(12,2) NOT NULL, status text NOT NULL DEFAULT 'Draft', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
ALTER TABLE public.finance_payroll ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_fin_pay_org ON public.finance_payroll(org_id);
ALTER TABLE public.finance_payroll REPLICA IDENTITY FULL;

DROP POLICY IF EXISTS "fin_inv_org_all" ON public.finance_invoices;
CREATE POLICY "fin_inv_org_all" ON public.finance_invoices FOR ALL USING (org_id IN (SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "fin_exp_org_all" ON public.finance_expenses;
CREATE POLICY "fin_exp_org_all" ON public.finance_expenses FOR ALL USING (org_id IN (SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "fin_pay_org_all" ON public.finance_payroll;
CREATE POLICY "fin_pay_org_all" ON public.finance_payroll FOR ALL USING (org_id IN (SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid()));
