-- ============================================================
-- Intent OS: Deployment Bridge + RecruitmentOS Domain Tables
-- Run this in the Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================

-- ------------------------------------------------------------
-- 1. USER-LEVEL CAPABILITY INSTALLS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_capability_installs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability_id   text NOT NULL,
  capability_name text NOT NULL,
  capability_type text NOT NULL DEFAULT 'agent'
    CHECK (capability_type IN ('agent', 'template', 'connector', 'workflow')),
  workspace_path  text NOT NULL,
  icon_name       text,
  color           text,
  structure       jsonb DEFAULT '[]'::jsonb,
  status          text NOT NULL DEFAULT 'installed'
    CHECK (status IN ('installing', 'installed', 'failed', 'disabled', 'uninstalled')),
  config          jsonb DEFAULT '{}'::jsonb,
  version         text NOT NULL DEFAULT '1.0.0',
  installed_at    timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, capability_id)
);

ALTER TABLE public.user_capability_installs ENABLE ROW LEVEL SECURITY;

-- Drop then recreate policy to avoid "already exists" error
DROP POLICY IF EXISTS "Users can manage their own installs" ON public.user_capability_installs;
CREATE POLICY "Users can manage their own installs"
  ON public.user_capability_installs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_user_capability_installs_user
  ON public.user_capability_installs(user_id, status);

-- Realtime
ALTER TABLE public.user_capability_installs REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_capability_installs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_capability_installs;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2. install_capability() RPC
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.install_capability(
  p_capability_id   text,
  p_capability_name text,
  p_capability_type text,
  p_workspace_path  text,
  p_icon_name       text DEFAULT 'Bot',
  p_color           text DEFAULT 'indigo',
  p_structure       jsonb DEFAULT '[]'::jsonb,
  p_config          jsonb DEFAULT '{}'::jsonb,
  p_version         text DEFAULT '1.0.0'
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    uuid := auth.uid();
  v_install_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.user_capability_installs (
    user_id, capability_id, capability_name, capability_type,
    workspace_path, icon_name, color, structure, config, version, status
  )
  VALUES (
    v_user_id, p_capability_id, p_capability_name, p_capability_type,
    p_workspace_path, p_icon_name, p_color, p_structure, p_config, p_version, 'installed'
  )
  ON CONFLICT (user_id, capability_id)
  DO UPDATE SET
    status          = 'installed',
    capability_name = EXCLUDED.capability_name,
    workspace_path  = EXCLUDED.workspace_path,
    config          = EXCLUDED.config,
    version         = EXCLUDED.version,
    updated_at      = now()
  RETURNING id INTO v_install_id;

  -- Fire kernel event (append-only, so this always succeeds)
  INSERT INTO public.os_events (
    event_type, level, source_subsystem, payload
  ) VALUES (
    'capability.installed',
    'info',
    'intent-store',
    jsonb_build_object(
      'install_id',      v_install_id,
      'capability_id',   p_capability_id,
      'capability_name', p_capability_name,
      'capability_type', p_capability_type,
      'user_id',         v_user_id,
      'workspace_path',  p_workspace_path,
      'version',         p_version
    )
  );

  RETURN jsonb_build_object(
    'install_id',    v_install_id,
    'status',        'installed',
    'capability_id', p_capability_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.install_capability TO authenticated;

-- ------------------------------------------------------------
-- 3. uninstall_capability() RPC
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.uninstall_capability(
  p_capability_id text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  UPDATE public.user_capability_installs
  SET status = 'uninstalled', updated_at = now()
  WHERE user_id = v_user_id AND capability_id = p_capability_id;

  INSERT INTO public.os_events (event_type, level, source_subsystem, payload)
  VALUES (
    'capability.uninstalled', 'info', 'intent-store',
    jsonb_build_object('capability_id', p_capability_id, 'user_id', v_user_id)
  );

  RETURN jsonb_build_object('status', 'uninstalled');
END;
$$;

GRANT EXECUTE ON FUNCTION public.uninstall_capability TO authenticated;

-- ------------------------------------------------------------
-- 4. RECRUITMENT OS — Domain Tables
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.rec_jobs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  department   text,
  location     text,
  type         text NOT NULL DEFAULT 'Full-time'
    CHECK (type IN ('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote')),
  status       text NOT NULL DEFAULT 'Open'
    CHECK (status IN ('Open', 'Paused', 'Closed', 'Draft')),
  description  text,
  requirements text,
  salary_min   integer,
  salary_max   integer,
  currency     text DEFAULT 'INR',
  openings     integer DEFAULT 1,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

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
  stage        text NOT NULL DEFAULT 'Applied'
    CHECK (stage IN ('Applied','Screening','Assessment','Interview','Offer','Hired','Rejected')),
  rating       integer DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  ai_score     numeric(4,1),
  ai_summary   text,
  notes        text,
  source       text DEFAULT 'Direct',
  tags         jsonb DEFAULT '[]'::jsonb,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rec_interviews (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id   uuid NOT NULL REFERENCES public.rec_candidates(id) ON DELETE CASCADE,
  job_id         uuid REFERENCES public.rec_jobs(id) ON DELETE SET NULL,
  scheduled_at   timestamptz NOT NULL,
  duration_min   integer DEFAULT 60,
  interview_type text NOT NULL DEFAULT 'video'
    CHECK (interview_type IN ('video','phone','in-person','technical','panel')),
  meet_link      text,
  interviewers   jsonb DEFAULT '[]'::jsonb,
  status         text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','completed','cancelled','no-show')),
  feedback       text,
  outcome        text CHECK (outcome IN ('strong-yes','yes','maybe','no','strong-no')),
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rec_offer_letters (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id   uuid NOT NULL REFERENCES public.rec_candidates(id) ON DELETE CASCADE,
  job_id         uuid REFERENCES public.rec_jobs(id) ON DELETE SET NULL,
  offer_text     text NOT NULL,
  salary_offered integer,
  currency       text DEFAULT 'INR',
  start_date     date,
  expiry_date    date,
  status         text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  sent_at        timestamptz,
  responded_at   timestamptz,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.rec_jobs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rec_candidates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rec_interviews    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rec_offer_letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own rec_jobs"          ON public.rec_jobs;
DROP POLICY IF EXISTS "Users manage own rec_candidates"    ON public.rec_candidates;
DROP POLICY IF EXISTS "Users manage own rec_interviews"    ON public.rec_interviews;
DROP POLICY IF EXISTS "Users manage own rec_offer_letters" ON public.rec_offer_letters;

CREATE POLICY "Users manage own rec_jobs"
  ON public.rec_jobs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own rec_candidates"
  ON public.rec_candidates FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own rec_interviews"
  ON public.rec_interviews FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users manage own rec_offer_letters"
  ON public.rec_offer_letters FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rec_jobs_user_status     ON public.rec_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_rec_candidates_job_stage ON public.rec_candidates(job_id, stage);
CREATE INDEX IF NOT EXISTS idx_rec_candidates_user      ON public.rec_candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_interviews_candidate ON public.rec_interviews(candidate_id);

-- Realtime for rec_candidates and rec_jobs
ALTER TABLE public.rec_candidates REPLICA IDENTITY FULL;
ALTER TABLE public.rec_jobs       REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'rec_candidates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rec_candidates;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'rec_jobs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rec_jobs;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 5. seed_recruitment_demo() — Seeds starter data for new installs
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.seed_recruitment_demo()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_job1_id uuid;
  v_job2_id uuid;
  v_job3_id uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM rec_jobs WHERE user_id = v_user_id LIMIT 1) THEN
    RETURN;
  END IF;

  INSERT INTO rec_jobs (user_id, title, department, location, type, status, description, openings)
  VALUES (v_user_id, 'Senior Product Designer', 'Design', 'Remote', 'Full-time', 'Open',
    'Looking for a senior designer to lead our product design team.', 2)
  RETURNING id INTO v_job1_id;

  INSERT INTO rec_jobs (user_id, title, department, location, type, status, description, openings)
  VALUES (v_user_id, 'Backend Engineer (Node.js)', 'Engineering', 'Bangalore', 'Full-time', 'Open',
    'Build scalable APIs and microservices for our platform.', 3)
  RETURNING id INTO v_job2_id;

  INSERT INTO rec_jobs (user_id, title, department, location, type, status, description, openings)
  VALUES (v_user_id, 'Sales Development Rep', 'Sales', 'Mumbai', 'Full-time', 'Open',
    'Generate leads and qualify prospects for our enterprise sales team.', 5)
  RETURNING id INTO v_job3_id;

  INSERT INTO rec_candidates
    (user_id, job_id, first_name, last_name, email, stage, rating, ai_score, ai_summary, source)
  VALUES
    (v_user_id, v_job2_id, 'Priya',   'Sharma',  'priya.sharma@example.com',  'Screening',  4, 87.5,
     'Strong match. 6 years of Node.js experience. Previously at Razorpay.', 'LinkedIn'),
    (v_user_id, v_job2_id, 'Rahul',   'Mehta',   'rahul.mehta@example.com',   'Interview',  5, 92.0,
     'Excellent candidate. System design skills are exceptional. Recommended.', 'Referral'),
    (v_user_id, v_job2_id, 'Sneha',   'Patil',   'sneha.patil@example.com',   'Applied',    3, 71.0,
     'Decent background. Missing microservices experience. Good communication.', 'Direct'),
    (v_user_id, v_job2_id, 'Arjun',   'Nair',    'arjun.nair@example.com',    'Offer',      5, 95.0,
     'Top performer. Multiple competing offers. Move fast.', 'GitHub'),
    (v_user_id, v_job2_id, 'Kavitha', 'Rajan',   'kavitha.rajan@example.com', 'Assessment', 4, 83.0,
     'Strong fundamentals. Needs a system design round.', 'LinkedIn'),
    (v_user_id, v_job1_id, 'Meera',   'Iyer',    'meera.iyer@example.com',    'Screening',  4, 88.0,
     'Excellent portfolio. Figma skills are strong. Works well with engineers.', 'Behance'),
    (v_user_id, v_job1_id, 'Rohan',   'Kapoor',  'rohan.kapoor@example.com',  'Applied',    3, 74.0,
     'Good visual design but limited product thinking.', 'Direct'),
    (v_user_id, v_job3_id, 'Ananya',  'Singh',   'ananya.singh@example.com',  'Interview',  5, 91.0,
     'High energy, great communicator. Ex-Salesforce. Strong fit for enterprise sales.', 'LinkedIn');
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_recruitment_demo TO authenticated;
