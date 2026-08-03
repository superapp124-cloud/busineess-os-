-- Migration 006: Clear All Seed/Demo Candidate Records
-- Organization: TalentXcel Services Private Limited
-- Purpose: Prepares Talent Pipeline for fresh production CV imports

DELETE FROM rec_candidates;

-- Reset table sequence if applicable
ALTER SEQUENCE IF EXISTS rec_candidates_id_seq RESTART WITH 1;
