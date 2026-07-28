CREATE TABLE IF NOT EXISTS public.sales_activities (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id      uuid REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  deal_id      uuid REFERENCES public.sales_deals(id) ON DELETE CASCADE,
  type         text NOT NULL,
  subject      text NOT NULL,
  description  text,
  performed_at timestamptz DEFAULT now(),
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.sales_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sales_activities_user_all" ON public.sales_activities;
CREATE POLICY "sales_activities_user_all" ON public.sales_activities FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_sales_activities_user ON public.sales_activities(user_id);
ALTER TABLE public.sales_activities REPLICA IDENTITY FULL;
