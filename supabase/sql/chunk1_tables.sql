-- ============================================================
-- Intent OS: Tables Only (no PL/pgSQL, no $$ functions)
-- Paste this entire block into the SQL editor and click Run
-- ============================================================

-- 1. CAPABILITY INSTALLS
CREATE TABLE IF NOT EXISTS public.user_capability_installs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability_id   text NOT NULL,
  capability_name text NOT NULL,
  capability_type text NOT NULL DEFAULT 'agent',
  workspace_path  text NOT NULL,
  icon_name       text,
  color           text,
  structure       jsonb DEFAULT '[]'::jsonb,
  status          text NOT NULL DEFAULT 'installed',
  config          jsonb DEFAULT '{}'::jsonb,
  version         text NOT NULL DEFAULT '1.0.0',
  installed_at    timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, capability_id)
);

ALTER TABLE public.user_capability_installs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "uci_user_all" ON public.user_capability_installs;
CREATE POLICY "uci_user_all"
  ON public.user_capability_installs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_uci_user
  ON public.user_capability_installs(user_id, status);

-- 2. RECRUITMENT JOBS
CREATE TABLE IF NOT EXISTS public.rec_jobs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  department   text,
  location     text,
  type         text NOT NULL DEFAULT 'Full-time',
  status       text NOT NULL DEFAULT 'Open',
  description  text,
  requirements text,
  salary_min   integer,
  salary_max   integer,
  currency     text DEFAULT 'INR',
  openings     integer DEFAULT 1,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.rec_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rec_jobs_user_all" ON public.rec_jobs;
CREATE POLICY "rec_jobs_user_all"
  ON public.rec_jobs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_rec_jobs_user
  ON public.rec_jobs(user_id, status);

-- 3. CANDIDATES
CREATE TABLE IF NOT EXISTS public.rec_candidates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id       uuid REFERENCES public.rec_jobs(id) ON DELETE SET NULL,
  first_name   text NOT NULL,
  last_name    text NOT NULL,
  email        text,
  phone        text,
  resume_url   text,
  linkedin_url text,
  stage        text NOT NULL DEFAULT 'Applied',
  rating       integer DEFAULT 0,
  ai_score     numeric(4,1),
  ai_summary   text,
  notes        text,
  source       text DEFAULT 'Direct',
  tags         jsonb DEFAULT '[]'::jsonb,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.rec_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rec_candidates_user_all" ON public.rec_candidates;
CREATE POLICY "rec_candidates_user_all"
  ON public.rec_candidates FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_rec_cands_user ON public.rec_candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_cands_job  ON public.rec_candidates(job_id, stage);

-- 4. INTERVIEWS
CREATE TABLE IF NOT EXISTS public.rec_interviews (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id   uuid NOT NULL REFERENCES public.rec_candidates(id) ON DELETE CASCADE,
  job_id         uuid REFERENCES public.rec_jobs(id) ON DELETE SET NULL,
  scheduled_at   timestamptz NOT NULL,
  duration_min   integer DEFAULT 60,
  interview_type text NOT NULL DEFAULT 'video',
  meet_link      text,
  interviewers   jsonb DEFAULT '[]'::jsonb,
  status         text NOT NULL DEFAULT 'scheduled',
  feedback       text,
  outcome        text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

ALTER TABLE public.rec_interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rec_interviews_user_all" ON public.rec_interviews;
CREATE POLICY "rec_interviews_user_all"
  ON public.rec_interviews FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. OFFER LETTERS
CREATE TABLE IF NOT EXISTS public.rec_offer_letters (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id   uuid NOT NULL REFERENCES public.rec_candidates(id) ON DELETE CASCADE,
  job_id         uuid REFERENCES public.rec_jobs(id) ON DELETE SET NULL,
  offer_text     text NOT NULL DEFAULT '',
  salary_offered integer,
  currency       text DEFAULT 'INR',
  start_date     date,
  expiry_date    date,
  status         text NOT NULL DEFAULT 'draft',
  sent_at        timestamptz,
  responded_at   timestamptz,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

ALTER TABLE public.rec_offer_letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rec_offers_user_all" ON public.rec_offer_letters;
CREATE POLICY "rec_offers_user_all"
  ON public.rec_offer_letters FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Enable realtime on key tables
ALTER TABLE public.user_capability_installs REPLICA IDENTITY FULL;
ALTER TABLE public.rec_candidates           REPLICA IDENTITY FULL;
ALTER TABLE public.rec_jobs                 REPLICA IDENTITY FULL;
