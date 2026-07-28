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
CREATE POLICY "rec_interviews_user_all" ON public.rec_interviews FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
