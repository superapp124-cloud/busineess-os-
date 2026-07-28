-- ============================================================
-- SalesOS Tables
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. SALES LEADS
CREATE TABLE IF NOT EXISTS public.sales_leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name   text NOT NULL,
  last_name    text NOT NULL,
  email        text,
  phone        text,
  company      text,
  job_title    text,
  status       text NOT NULL DEFAULT 'New', -- New, Contacted, Qualified, Unqualified
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

-- 2. SALES DEALS
CREATE TABLE IF NOT EXISTS public.sales_deals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id      uuid REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  name         text NOT NULL,
  amount       numeric(12,2) DEFAULT 0,
  currency     text DEFAULT 'USD',
  stage        text NOT NULL DEFAULT 'Discovery', -- Discovery, Proposal, Negotiation, Won, Lost
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

-- 3. SALES ACTIVITIES
CREATE TABLE IF NOT EXISTS public.sales_activities (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id      uuid REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  deal_id      uuid REFERENCES public.sales_deals(id) ON DELETE CASCADE,
  type         text NOT NULL, -- Email, Call, Meeting, Note
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
