-- Migration 008: Delete Example.com Seed Candidate Rows
-- Organization: TalentXcel Services Private Limited

DELETE FROM rec_candidates 
WHERE email LIKE '%example.com%' 
   OR email IS NULL 
   OR first_name LIKE '%Ankitkumar%';
