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
CREATE POLICY "rec_candidates_user_all" ON public.rec_candidates FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_rec_cands_user ON public.rec_candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_cands_job  ON public.rec_candidates(job_id, stage);
ALTER TABLE public.rec_candidates REPLICA IDENTITY FULL;
