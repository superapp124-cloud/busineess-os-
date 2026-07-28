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
CREATE POLICY "rec_jobs_user_all" ON public.rec_jobs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_rec_jobs_user ON public.rec_jobs(user_id, status);
ALTER TABLE public.rec_jobs REPLICA IDENTITY FULL;
