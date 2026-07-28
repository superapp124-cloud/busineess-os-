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
CREATE POLICY "rec_offers_user_all" ON public.rec_offer_letters FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
