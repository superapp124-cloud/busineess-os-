-- Migration 005: Insert & Update Real Candidate Profile — Aasim Syed
-- Organization: TalentXcel Services Private Limited

UPDATE rec_candidates
SET 
  first_name = 'Aasim',
  last_name = 'Syed',
  email = 'syedben80@gmail.com',
  phone = '+91 8408858300',
  location = 'Madhapur, Hyderabad, IN',
  current_company = 'Infosys (Microsoft)',
  experience_years = 3,
  skills = ARRAY['Mac/Windows Support', 'MDM Administration', 'Workspace Management', 'JAMF', 'Okta', 'Confluence', 'Salesforce', 'Technical Support'],
  summary = 'Results-driven engineering professional with 2.5+ years of experience in technical support, troubleshooting, workflow automation, and cross-functional IT operations at Infosys (Microsoft), Tech Mahindra (Salesforce), and Amazon.',
  education = 'B.Tech — Sandip University (2017–2021)',
  stage = 'Applied',
  ai_score = 92
WHERE first_name = 'Aasim' OR email LIKE '%aasim%';

-- Insert if not present
INSERT INTO rec_candidates (
  first_name, last_name, email, phone, location, current_company, 
  experience_years, skills, summary, stage, ai_score
)
SELECT 
  'Aasim', 'Syed', 'syedben80@gmail.com', '+91 8408858300', 'Madhapur, Hyderabad, IN', 
  'Infosys (Microsoft)', 3, 
  ARRAY['Mac/Windows Support', 'MDM Administration', 'Workspace Management', 'JAMF', 'Okta', 'Confluence', 'Salesforce', 'Technical Support'],
  'Results-driven engineering professional with 2.5+ years of experience in technical support, troubleshooting, workflow automation, and cross-functional IT operations at Infosys (Microsoft), Tech Mahindra (Salesforce), and Amazon.',
  'Applied', 92
WHERE NOT EXISTS (
  SELECT 1 FROM rec_candidates WHERE email = 'syedben80@gmail.com'
);
