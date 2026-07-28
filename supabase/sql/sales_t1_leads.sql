CREATE TABLE IF NOT EXISTS public.sales_leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name   text NOT NULL,
  last_name    text NOT NULL,
  email        text,
  phone        text,
  company      text,
  job_title    text,
  status       text NOT NULL DEFAULT 'New',
  source       text,
  ai_score     numeric(4,1),
  notes        text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sales_leads_user_all" ON public.sales_leads;
CREATE POLICY "sales_leads_user_all" ON public.sales_leads FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_sales_leads_user ON public.sales_leads(user_id, status);
ALTER TABLE public.sales_leads REPLICA IDENTITY FULL;
