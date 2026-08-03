-- Migration 004: Clean Candidate Names & Production Email Addresses
-- Removes test suffixes (Renewal Specialist, Copy, New) and updates example.com to @talentxcel.com

UPDATE rec_candidates
SET 
  last_name = TRIM(REGEXP_REPLACE(last_name, '(Renewal|Specialist|Copy|New)', '', 'gi')),
  email = LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(email, '(renewalspecialistcopycopy|new|copy)', '', 'gi'),
      '@example\.com$',
      '@talentxcel.com'
    )
  );

-- Specific Candidate Name & Email Cleans
UPDATE rec_candidates SET last_name = 'Nag', email = 'biprajit.nag@talentxcel.com' WHERE first_name = 'Biprajit';
UPDATE rec_candidates SET last_name = 'Syed', email = 'aasim.syed@talentxcel.com' WHERE first_name = 'Aasim';
UPDATE rec_candidates SET last_name = 'Candidate', email = 'aditya@talentxcel.com' WHERE first_name = 'Aditya';
UPDATE rec_candidates SET email = LOWER(CONCAT(first_name, '.', last_name, '@talentxcel.com')) WHERE email LIKE '%@example.com';
