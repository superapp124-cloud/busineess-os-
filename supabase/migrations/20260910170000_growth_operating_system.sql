-- =============================================================================
-- CHATR GLOBAL GROWTH OPERATING SYSTEM (GGCS) — CORE SCHEMA
-- Migration: 20260910170000_growth_operating_system.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. GROWTH EVENTS WAREHOUSE (Full Attribution Taxonomy)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.growth_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(64) NOT NULL,
    category VARCHAR(32) NOT NULL, -- 'acquisition', 'signup', 'activation', 'viral', 'retention', 'pwa', 'call'
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_timestamp BIGINT NOT NULL,
    server_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Identity & Session Lineage
    anonymous_id VARCHAR(128) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(128) NOT NULL,
    
    -- Attribution & Campaign Metadata
    source VARCHAR(64) NOT NULL DEFAULT 'direct',
    medium VARCHAR(64) DEFAULT 'none',
    campaign VARCHAR(128) DEFAULT NULL,
    landing_page TEXT NOT NULL,
    referrer TEXT DEFAULT NULL,
    referral_code VARCHAR(64) DEFAULT NULL,
    referral_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Geography & Device Telemetry
    country VARCHAR(8) DEFAULT 'UNKNOWN',
    language VARCHAR(16) DEFAULT 'en',
    device VARCHAR(32) DEFAULT 'desktop', -- 'mobile', 'tablet', 'desktop'
    browser VARCHAR(32) DEFAULT 'unknown',
    
    -- Call & WebRTC Scope
    call_id VARCHAR(128) DEFAULT NULL,
    room_id VARCHAR(128) DEFAULT NULL,
    call_duration_sec INT DEFAULT 0,
    
    -- Dynamic Context (JSONB)
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_growth_events_type_time ON public.growth_events (event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_growth_events_user ON public.growth_events (user_id);
CREATE INDEX IF NOT EXISTS idx_growth_events_anon ON public.growth_events (anonymous_id);
CREATE INDEX IF NOT EXISTS idx_growth_events_referral ON public.growth_events (referral_code);
CREATE INDEX IF NOT EXISTS idx_growth_events_category ON public.growth_events (category);

-- -----------------------------------------------------------------------------
-- 2. GOOGLE SEARCH CONSOLE DATA WAREHOUSE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gsc_properties (
    property_id VARCHAR(128) PRIMARY KEY, -- e.g. 'sc-domain:chatrchat.in'
    display_name VARCHAR(128) NOT NULL,
    auth_status VARCHAR(32) NOT NULL DEFAULT 'CONNECTED', -- 'CONNECTED', 'NEEDS_REAUTH', 'ERROR'
    last_sync_at TIMESTAMPTZ DEFAULT NULL,
    total_clicks_30d INT DEFAULT 0,
    total_impressions_30d INT DEFAULT 0,
    avg_position NUMERIC(5,2) DEFAULT 0.0,
    avg_ctr NUMERIC(5,4) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gsc_sync_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id VARCHAR(128) REFERENCES public.gsc_properties(property_id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'RUNNING', -- 'RUNNING', 'SUCCESS', 'FAILED'
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    rows_synced INT DEFAULT 0,
    error_message TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS public.gsc_queries (
    id BIGSERIAL PRIMARY KEY,
    property_id VARCHAR(128) REFERENCES public.gsc_properties(property_id) ON DELETE CASCADE,
    sync_date DATE NOT NULL,
    query TEXT NOT NULL,
    page TEXT NOT NULL,
    country VARCHAR(8) NOT NULL DEFAULT 'GLOBAL',
    device VARCHAR(16) NOT NULL DEFAULT 'ALL',
    clicks INT NOT NULL DEFAULT 0,
    impressions INT NOT NULL DEFAULT 0,
    ctr NUMERIC(6,4) NOT NULL DEFAULT 0.0,
    position NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_gsc_query_day UNIQUE (property_id, sync_date, query, page, country, device)
);

CREATE INDEX IF NOT EXISTS idx_gsc_queries_perf ON public.gsc_queries (query, impressions DESC, clicks DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_queries_page ON public.gsc_queries (page);
CREATE INDEX IF NOT EXISTS idx_gsc_queries_country ON public.gsc_queries (country);

-- -----------------------------------------------------------------------------
-- 3. GSC SEARCH OPPORTUNITY ENGINE (4-Quadrant Classification)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gsc_opportunities (
    opportunity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id VARCHAR(128) REFERENCES public.gsc_properties(property_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    target_page TEXT DEFAULT NULL,
    country VARCHAR(8) DEFAULT 'GLOBAL',
    quadrant VARCHAR(16) NOT NULL, -- 'WIN_NOW', 'ATTACK', 'CREATE', 'FIX', 'EXPAND'
    current_position NUMERIC(5,2) NOT NULL,
    impressions INT NOT NULL,
    clicks INT NOT NULL,
    ctr NUMERIC(6,4) NOT NULL,
    commercial_intent VARCHAR(16) NOT NULL DEFAULT 'MEDIUM', -- 'HIGH', 'MEDIUM', 'LOW'
    opportunity_score NUMERIC(8,2) NOT NULL,
    recommended_action TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DETECTED', -- 'DETECTED', 'ASSIGNED', 'EXECUTING', 'RESOLVED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gsc_opp_score ON public.gsc_opportunities (opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_opp_quadrant ON public.gsc_opportunities (quadrant);

-- -----------------------------------------------------------------------------
-- 4. AUTONOMOUS GROWTH ACTION QUEUE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.growth_actions (
    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type VARCHAR(64) NOT NULL, -- 'SEO_CREATE_PAGE', 'SEO_IMPROVE_CTR', 'VIRAL_LOOP_TWEAK', 'PWA_FLOW_OPTIMIZE', 'LOCALIZATION'
    priority VARCHAR(16) NOT NULL DEFAULT 'MEDIUM', -- 'URGENT', 'HIGH', 'MEDIUM', 'LOW'
    source VARCHAR(32) NOT NULL, -- 'GSC_OPPORTUNITY_ENGINE', 'VIRAL_DROP_OFF', 'RETENTION_ALERT'
    query TEXT DEFAULT NULL,
    target_page TEXT DEFAULT NULL,
    country VARCHAR(8) DEFAULT NULL,
    expected_impact TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'DEPLOYED', 'DISMISSED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NULL,
    result_telemetry JSONB DEFAULT '{}'::jsonb
);

-- -----------------------------------------------------------------------------
-- 5. OPPORTUNITY EVALUATION FUNCTION (Atomic Postgres RPC)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_gsc_opportunities(p_property_id VARCHAR)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inserted INT := 0;
BEGIN
    DELETE FROM public.gsc_opportunities WHERE property_id = p_property_id;

    INSERT INTO public.gsc_opportunities (
        property_id, query, target_page, country, quadrant,
        current_position, impressions, clicks, ctr, commercial_intent,
        opportunity_score, recommended_action, status
    )
    SELECT 
        q.property_id,
        q.query,
        q.page,
        q.country,
        CASE 
            WHEN q.position BETWEEN 4.0 AND 10.0 AND q.impressions >= 100 THEN 'WIN_NOW'
            WHEN q.position BETWEEN 10.1 AND 20.0 AND q.impressions >= 50 THEN 'ATTACK'
            WHEN q.position > 20.0 AND q.impressions >= 200 THEN 'CREATE'
            WHEN q.position <= 5.0 AND q.ctr < 0.05 AND q.impressions >= 100 THEN 'FIX'
            ELSE 'EXPAND'
        END AS quadrant,
        q.position,
        q.impressions,
        q.clicks,
        q.ctr,
        CASE
            WHEN q.query ILIKE '%call%' OR q.query ILIKE '%free%' OR q.query ILIKE '%alternative%' OR q.query ILIKE '%without phone%' THEN 'HIGH'
            WHEN q.query ILIKE '%business%' OR q.query ILIKE '%inbox%' OR q.query ILIKE '%tool%' THEN 'MEDIUM'
            ELSE 'LOW'
        END AS commercial_intent,
        (
            q.impressions * 
            (0.15 - LEAST(0.15, q.ctr)) * 
            (CASE WHEN q.position <= 10 THEN 2.0 WHEN q.position <= 20 THEN 1.5 ELSE 1.0 END) *
            (CASE 
                WHEN q.query ILIKE '%call%' OR q.query ILIKE '%free%' OR q.query ILIKE '%without phone%' THEN 2.5
                ELSE 1.0 
             END)
        )::NUMERIC(8,2) AS opportunity_score,
        CASE 
            WHEN q.position BETWEEN 4.0 AND 10.0 THEN 'Optimize above-the-fold content and internal links to reach Top 3'
            WHEN q.position BETWEEN 10.1 AND 20.0 THEN 'Publish targeted cohort page with dedicated intent FAQs and schema'
            WHEN q.position > 20.0 THEN 'Create dedicated free tool or comparison landing page'
            WHEN q.position <= 5.0 AND q.ctr < 0.05 THEN 'Rewrite meta title and OpenGraph description to improve SERP click-through'
            ELSE 'Localize into regional hub and add WhatsApp invitation anchor'
        END AS recommended_action,
        'DETECTED'
    FROM (
        SELECT 
            property_id, query, page, country,
            SUM(clicks) as clicks,
            SUM(impressions) as impressions,
            AVG(position)::NUMERIC(5,2) as position,
            (SUM(clicks)::NUMERIC / NULLIF(SUM(impressions), 0))::NUMERIC(6,4) as ctr
        FROM public.gsc_queries
        WHERE property_id = p_property_id
        GROUP BY property_id, query, page, country
        HAVING SUM(impressions) >= 20
    ) q;

    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    RETURN v_inserted;
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.growth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_actions ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated read/insert permissions
CREATE POLICY "Allow public insert to growth_events" ON public.growth_events
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow read growth_events" ON public.growth_events
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow read gsc_properties" ON public.gsc_properties
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow read gsc_queries" ON public.gsc_queries
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow read gsc_opportunities" ON public.gsc_opportunities
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow read growth_actions" ON public.growth_actions
    FOR SELECT TO anon, authenticated
    USING (true);

-- Service role full access
CREATE POLICY "Service full access growth_events" ON public.growth_events FOR ALL TO service_role USING (true);
CREATE POLICY "Service full access gsc_properties" ON public.gsc_properties FOR ALL TO service_role USING (true);
CREATE POLICY "Service full access gsc_sync_runs" ON public.gsc_sync_runs FOR ALL TO service_role USING (true);
CREATE POLICY "Service full access gsc_queries" ON public.gsc_queries FOR ALL TO service_role USING (true);
CREATE POLICY "Service full access gsc_opportunities" ON public.gsc_opportunities FOR ALL TO service_role USING (true);
CREATE POLICY "Service full access growth_actions" ON public.growth_actions FOR ALL TO service_role USING (true);
