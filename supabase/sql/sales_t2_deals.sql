CREATE TABLE IF NOT EXISTS public.sales_deals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id      uuid REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  name         text NOT NULL,
  amount       numeric(12,2) DEFAULT 0,
  currency     text DEFAULT 'USD',
  stage        text NOT NULL DEFAULT 'Discovery',
  probability  integer DEFAULT 0,
  expected_close_date date,
  notes        text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.sales_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sales_deals_user_all" ON public.sales_deals;
CREATE POLICY "sales_deals_user_all" ON public.sales_deals FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_sales_deals_user ON public.sales_deals(user_id, stage);
ALTER TABLE public.sales_deals REPLICA IDENTITY FULL;
