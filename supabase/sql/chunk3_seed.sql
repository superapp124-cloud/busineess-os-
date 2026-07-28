-- ============================================================
-- CHUNK 3 of 3: seed_recruitment_demo function
-- Paste this AFTER Chunk 2 succeeds, then click Run
-- ============================================================

CREATE OR REPLACE FUNCTION public.seed_recruitment_demo()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_job1_id uuid := gen_random_uuid();
  v_job2_id uuid := gen_random_uuid();
  v_job3_id uuid := gen_random_uuid();
BEGIN
  IF EXISTS (SELECT 1 FROM rec_jobs WHERE user_id = v_user_id LIMIT 1) THEN
    RETURN;
  END IF;

  INSERT INTO rec_jobs (id, user_id, title, department, location, type, status, description, openings)
  VALUES
    (v_job1_id, v_user_id, 'Senior Product Designer', 'Design', 'Remote', 'Full-time', 'Open',
     'Lead product design and ship beautiful experiences.', 2),
    (v_job2_id, v_user_id, 'Backend Engineer (Node.js)', 'Engineering', 'Bangalore', 'Full-time', 'Open',
     'Build scalable APIs and microservices.', 3),
    (v_job3_id, v_user_id, 'Sales Development Rep', 'Sales', 'Mumbai', 'Full-time', 'Open',
     'Generate leads and qualify enterprise prospects.', 5);

  INSERT INTO rec_candidates
    (user_id, job_id, first_name, last_name, email, stage, rating, ai_score, ai_summary, source)
  VALUES
    (v_user_id, v_job2_id, 'Priya',   'Sharma',  'priya.sharma@example.com',
     'Screening',  4, 87.5, 'Strong match. 6 years Node.js. Ex-Razorpay.', 'LinkedIn'),
    (v_user_id, v_job2_id, 'Rahul',   'Mehta',   'rahul.mehta@example.com',
     'Interview',  5, 92.0, 'Excellent. System design exceptional. Recommended.', 'Referral'),
    (v_user_id, v_job2_id, 'Sneha',   'Patil',   'sneha.patil@example.com',
     'Applied',    3, 71.0, 'Decent. Missing microservices experience.', 'Direct'),
    (v_user_id, v_job2_id, 'Arjun',   'Nair',    'arjun.nair@example.com',
     'Offer',      5, 95.0, 'Top performer. Competing offers. Move fast.', 'GitHub'),
    (v_user_id, v_job2_id, 'Kavitha', 'Rajan',   'kavitha.rajan@example.com',
     'Assessment', 4, 83.0, 'Strong fundamentals. Needs system design round.', 'LinkedIn'),
    (v_user_id, v_job1_id, 'Meera',   'Iyer',    'meera.iyer@example.com',
     'Screening',  4, 88.0, 'Excellent portfolio. Figma skills strong.', 'Behance'),
    (v_user_id, v_job1_id, 'Rohan',   'Kapoor',  'rohan.kapoor@example.com',
     'Applied',    3, 74.0, 'Good visuals, limited product thinking.', 'Direct'),
    (v_user_id, v_job3_id, 'Ananya',  'Singh',   'ananya.singh@example.com',
     'Interview',  5, 91.0, 'High energy, great communicator. Ex-Salesforce.', 'LinkedIn');
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_recruitment_demo TO authenticated;
