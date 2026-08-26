-- ==============================================================================
-- CHATR AUTONOMOUS 200-AGENT 24/7 AI ENTERPRISE ENGINE
-- Migration: 20260826170000_autonomous_200_agents_engine.sql
--
-- Architecture:
-- 1. 1 Human CEO (Supreme Authority & Approval Vault)
-- 2. 200 Specialized Autonomous AI Agents across 7 Squads
-- 3. 24/7 Web Scraping & Lead Discovery Engine
-- 4. High-Throughput Task Execution Queue
-- 5. Human-in-the-Loop (HITL) CEO Approval Vault
-- ==============================================================================

-- 1. AGENT ROSTER TABLE (Stores the 200 Agent Identities)
CREATE TABLE IF NOT EXISTS public.agent_roster (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  squad               TEXT NOT NULL CHECK (squad IN (
    'SQUAD_1_SCRAPING',
    'SQUAD_2_OUTBOUND',
    'SQUAD_3_TALENTXCEL',
    'SQUAD_4_SALES_CLOSERS',
    'SQUAD_5_SUPPORT_SUCCESS',
    'SQUAD_6_FINANCE_LEDGER',
    'SQUAD_7_SEO_INTEL'
  )),
  role                TEXT NOT NULL,
  description         TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'IDLE' CHECK (status IN (
    'IDLE', 'RUNNING', 'SCRAPING', 'OUTREACHING', 'SCREENING', 'SUPPORTING', 'PAUSED', 'BLOCKED'
  )),
  model               TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
  token_budget_daily  INTEGER NOT NULL DEFAULT 500000,
  tokens_used_today   INTEGER NOT NULL DEFAULT 0,
  tasks_completed     INTEGER NOT NULL DEFAULT 0,
  success_rate        NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  last_active_at      TIMESTAMPTZ DEFAULT now(),
  current_task_summary TEXT,
  config              JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_roster_squad ON public.agent_roster(squad, status);

-- 2. SCRAPED LEADS TABLE (24/7 Autonomous Lead Extraction)
CREATE TABLE IF NOT EXISTS public.scraped_leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name        TEXT NOT NULL,
  city                TEXT NOT NULL,
  vertical            TEXT NOT NULL,
  decision_maker_name TEXT,
  decision_maker_role TEXT,
  phone               TEXT,
  email               TEXT,
  website             TEXT,
  source_platform     TEXT NOT NULL,
  whatsapp_verified   BOOLEAN NOT NULL DEFAULT false,
  email_verified      BOOLEAN NOT NULL DEFAULT false,
  status              TEXT NOT NULL DEFAULT 'DISCOVERED' CHECK (status IN (
    'DISCOVERED', 'ENRICHED', 'OUTREACH_PENDING', 'CONTACTED', 'RESPONDED', 'CONVERTED', 'BOUNCED'
  )),
  scraped_by_agent_id TEXT REFERENCES public.agent_roster(id),
  lead_score          INTEGER NOT NULL DEFAULT 50 CHECK (lead_score BETWEEN 0 AND 100),
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scraped_leads_city_vertical ON public.scraped_leads(city, vertical, status);
CREATE INDEX IF NOT EXISTS idx_scraped_leads_status ON public.scraped_leads(status, lead_score DESC);

-- 3. AGENT TASK QUEUE (Autonomous Task Dispatcher)
CREATE TABLE IF NOT EXISTS public.agent_task_queue (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id            TEXT NOT NULL REFERENCES public.agent_roster(id) ON DELETE CASCADE,
  squad               TEXT NOT NULL,
  task_type           TEXT NOT NULL,
  priority            INTEGER NOT NULL DEFAULT 50 CHECK (priority BETWEEN 1 AND 100),
  payload             JSONB NOT NULL DEFAULT '{}'::jsonb,
  status              TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'AWAITING_CEO_APPROVAL'
  )),
  retry_count         INTEGER NOT NULL DEFAULT 0,
  max_retries         INTEGER NOT NULL DEFAULT 3,
  error_detail        TEXT,
  locked_by           TEXT,
  locked_at           TIMESTAMPTZ,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON public.agent_task_queue(status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON public.agent_task_queue(agent_id, status);

-- 4. AGENT EXECUTION LOGS (Real-Time Action Stream)
CREATE TABLE IF NOT EXISTS public.agent_execution_logs (
  id                  BIGSERIAL PRIMARY KEY,
  agent_id            TEXT NOT NULL REFERENCES public.agent_roster(id) ON DELETE CASCADE,
  agent_name          TEXT NOT NULL,
  squad               TEXT NOT NULL,
  action_type         TEXT NOT NULL,
  target_entity       TEXT,
  summary             TEXT NOT NULL,
  details             JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_ms         INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_exec_logs_created ON public.agent_execution_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_exec_logs_squad ON public.agent_execution_logs(squad, created_at DESC);

-- 5. HUMAN-IN-THE-LOOP (HITL) CEO APPROVAL VAULT
CREATE TABLE IF NOT EXISTS public.agent_ceo_approvals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id             UUID REFERENCES public.agent_task_queue(id) ON DELETE CASCADE,
  agent_id            TEXT NOT NULL REFERENCES public.agent_roster(id),
  action_type         TEXT NOT NULL,
  risk_level          TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  payload             JSONB NOT NULL DEFAULT '{}'::jsonb,
  status              TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by_phone   TEXT,
  reviewed_at         TIMESTAMPTZ,
  decision_notes      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ceo_approvals_status ON public.agent_ceo_approvals(status, created_at DESC);

-- Enable RLS
ALTER TABLE public.agent_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_task_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_ceo_approvals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view agent telemetry
CREATE POLICY "agent_roster: viewable by authenticated users"
  ON public.agent_roster FOR SELECT TO authenticated USING (true);

CREATE POLICY "scraped_leads: viewable by authenticated users"
  ON public.scraped_leads FOR SELECT TO authenticated USING (true);

CREATE POLICY "agent_task_queue: viewable by authenticated users"
  ON public.agent_task_queue FOR SELECT TO authenticated USING (true);

CREATE POLICY "agent_execution_logs: viewable by authenticated users"
  ON public.agent_execution_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "agent_ceo_approvals: viewable by authenticated users"
  ON public.agent_ceo_approvals FOR SELECT TO authenticated USING (true);

-- Super admin write policies
CREATE POLICY "agent_roster: super admin manage"
  ON public.agent_roster FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'super_admin' OR profiles.phone_number IN ('9910678611', '9717845477'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'super_admin' OR profiles.phone_number IN ('9910678611', '9717845477'))));

CREATE POLICY "agent_ceo_approvals: super admin manage"
  ON public.agent_ceo_approvals FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'super_admin' OR profiles.phone_number IN ('9910678611', '9717845477'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'super_admin' OR profiles.phone_number IN ('9910678611', '9717845477'))));
