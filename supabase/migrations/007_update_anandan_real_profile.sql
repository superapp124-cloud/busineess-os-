-- Migration 007: Update Anandan Real Candidate Profile
-- Organization: TalentXcel Services Private Limited

UPDATE rec_candidates
SET 
  first_name = 'A. S.',
  last_name = 'Anandan',
  email = 'asanandan@rediff.com',
  phone = '+91 6383112491',
  location = 'Chennai, IN',
  current_company = 'Matrimony.com (Project Lead)',
  experience_years = 18,
  skills = ARRAY['ReactJS', 'Node.js', 'Next.js', 'TypeScript', 'GraphQL', 'PHP', 'Laravel', 'PostgreSQL', 'MySQL', 'AWS', 'Docker'],
  summary = 'Technical Lead & Senior Fullstack Architect with 18+ years of engineering experience across Matrimony.com, Gspann Technologies, MSC Technology, KRDS, Amtex, and Inferscience.',
  education = 'B.E (CSE) — SKP Engineering College',
  stage = 'Applied',
  ai_score = 94
WHERE first_name LIKE '%Anandan%' OR email LIKE '%anandan%';

-- Insert if missing
INSERT INTO rec_candidates (
  first_name, last_name, email, phone, location, current_company, 
  experience_years, skills, summary, stage, ai_score
)
SELECT 
  'A. S.', 'Anandan', 'asanandan@rediff.com', '+91 6383112491', 'Chennai, IN', 
  'Matrimony.com (Project Lead)', 18, 
  ARRAY['ReactJS', 'Node.js', 'Next.js', 'TypeScript', 'GraphQL', 'PHP', 'Laravel', 'PostgreSQL', 'MySQL', 'AWS', 'Docker'],
  'Technical Lead & Senior Fullstack Architect with 18+ years of engineering experience across Matrimony.com, Gspann Technologies, MSC Technology, KRDS, Amtex, and Inferscience.',
  'Applied', 94
WHERE NOT EXISTS (
  SELECT 1 FROM rec_candidates WHERE email = 'asanandan@rediff.com'
);
