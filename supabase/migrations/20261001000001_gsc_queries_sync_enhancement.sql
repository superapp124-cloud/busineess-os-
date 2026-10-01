-- ============================================================
-- GSC Queries Schema Enhancement
-- Migration: 20261001000001_gsc_queries_sync_enhancement.sql
--
-- Adds:
--   1. synced_at column to gsc_queries for edge-function compatibility
--   2. data_source column for provenance tracking
--   3. Non-conflicting unique index for (property_id, query, country, device)
--      used by the upgraded gsc-sync edge function upsert
--   4. gsc_properties auth_status column if missing
--
-- Safe: all operations are IF NOT EXISTS / DO blocks
-- ============================================================

-- 1. Add synced_at column to gsc_queries if not present
ALTER TABLE public.gsc_queries
  ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Add data_source column for provenance
ALTER TABLE public.gsc_queries
  ADD COLUMN IF NOT EXISTS data_source VARCHAR(32) DEFAULT 'gsc_api';

-- 3. Add unique index for edge-function upsert conflict key
--    (property_id, query, country, device) — date-agnostic for rolling upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'gsc_queries'
      AND indexname = 'uq_gsc_query_property_query_country_device'
  ) THEN
    CREATE UNIQUE INDEX uq_gsc_query_property_query_country_device
      ON public.gsc_queries (property_id, query, country, device);
  END IF;
END;
$$;

-- 4. Ensure gsc_properties has auth_status column
ALTER TABLE public.gsc_properties
  ADD COLUMN IF NOT EXISTS auth_status VARCHAR(32) DEFAULT 'PENDING';

ALTER TABLE public.gsc_properties
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 5. Ensure the chatrchat.in property record exists as a seed
INSERT INTO public.gsc_properties (property_id, display_name, auth_status, updated_at)
VALUES (
  'sc-domain:chatrchat.in',
  'chatrchat.in (Domain Property)',
  'CONNECTED',
  NOW()
)
ON CONFLICT (property_id) DO UPDATE SET
  auth_status = 'CONNECTED',
  updated_at = NOW();

-- 6. Index on gsc_opportunities property_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_gsc_opportunities_property_id
  ON public.gsc_opportunities (property_id);

-- 7. Index on gsc_queries property_id + clicks for fast top-query queries
CREATE INDEX IF NOT EXISTS idx_gsc_queries_property_clicks
  ON public.gsc_queries (property_id, clicks DESC);
