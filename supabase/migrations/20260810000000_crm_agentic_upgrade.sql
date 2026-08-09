-- Migration: Agentic CRM Upgrade (inspired by trycompai/crm)

-- 1. Agent Tasks Queue Table
CREATE TABLE IF NOT EXISTS public.crm_agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_log TEXT,
    lease_owner TEXT,
    lease_expires_at TIMESTAMPTZ,
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Lead Intelligence Dossiers Table
CREATE TABLE IF NOT EXISTS public.crm_lead_dossiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    executive_summary TEXT,
    industry TEXT,
    company_size TEXT,
    estimated_revenue TEXT,
    tech_stack TEXT[],
    funding_info JSONB,
    key_decision_makers JSONB[],
    pain_points TEXT[],
    competitors TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_lead_dossier UNIQUE(lead_id)
);

-- 3. Evidence Ledger Table ("Zero-Guessing" Citations)
CREATE TABLE IF NOT EXISTS public.crm_evidence_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    quoted_snippet TEXT NOT NULL,
    confidence_score NUMERIC(3,2) DEFAULT 0.95,
    retrieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Extend crm_activities table with sentiment and AI insights
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_activities' AND column_name = 'sentiment') THEN
        ALTER TABLE public.crm_activities ADD COLUMN sentiment TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_activities' AND column_name = 'intent_detected') THEN
        ALTER TABLE public.crm_activities ADD COLUMN intent_detected TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_activities' AND column_name = 'key_takeaways') THEN
        ALTER TABLE public.crm_activities ADD COLUMN key_takeaways TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_activities' AND column_name = 'action_items') THEN
        ALTER TABLE public.crm_activities ADD COLUMN action_items JSONB[];
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.crm_agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_evidence_ledger ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Team members can access crm_agent_tasks"
ON public.crm_agent_tasks FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM public.business_team_members WHERE user_id = auth.uid()
  ) OR business_id IN (
    SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team members can access crm_lead_dossiers"
ON public.crm_lead_dossiers FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM public.business_team_members WHERE user_id = auth.uid()
  ) OR business_id IN (
    SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team members can access crm_evidence_ledger"
ON public.crm_evidence_ledger FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM public.business_team_members WHERE user_id = auth.uid()
  ) OR business_id IN (
    SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
  )
);
