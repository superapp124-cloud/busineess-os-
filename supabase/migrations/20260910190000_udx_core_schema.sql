-- Migration: 20260910190000_udx_core_schema.sql
-- Idempotent setup for UDX Core Schema

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. udx_tenants
CREATE TABLE IF NOT EXISTS udx_tenants (
    tenant_id VARCHAR(64) PRIMARY KEY,
    tenant_name TEXT,
    domain TEXT,
    gsc_property_id VARCHAR(128),
    ga4_measurement_id VARCHAR(64),
    status VARCHAR(32) CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TRIAL')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. udx_demand_entities
CREATE TABLE IF NOT EXISTS udx_demand_entities (
    entity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) REFERENCES udx_tenants(tenant_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    normalized_query TEXT NOT NULL,
    query_cluster VARCHAR(128),
    intent VARCHAR(32),
    audience VARCHAR(32),
    business_segment VARCHAR(32),
    product_destination TEXT,
    country VARCHAR(8),
    language VARCHAR(8) DEFAULT 'en',
    device VARCHAR(16) DEFAULT 'ALL',
    impressions INT NOT NULL DEFAULT 0,
    clicks INT NOT NULL DEFAULT 0,
    ctr NUMERIC(6,4) NOT NULL DEFAULT 0,
    avg_position NUMERIC(5,2) NOT NULL DEFAULT 0,
    impressions_7d INT DEFAULT 0,
    impressions_30d INT DEFAULT 0,
    youtube_search_volume INT DEFAULT NULL,
    reddit_mentions INT DEFAULT NULL,
    social_velocity NUMERIC(5,2) DEFAULT NULL,
    ai_visibility_score NUMERIC(4,2) DEFAULT NULL,
    commercial_intent VARCHAR(16) DEFAULT 'MEDIUM',
    conversion_potential NUMERIC(4,2) DEFAULT NULL,
    revenue_correlation NUMERIC(4,2) DEFAULT NULL,
    opportunity_score NUMERIC(8,2) DEFAULT 0,
    supply_exists BOOLEAN DEFAULT false,
    supply_page TEXT DEFAULT NULL,
    supply_quality_score INT DEFAULT NULL,
    supply_cqi_components JSONB DEFAULT NULL,
    data_source VARCHAR(32) NOT NULL DEFAULT 'gsc_api',
    first_observed_at TIMESTAMPTZ DEFAULT NOW(),
    last_gsc_sync_at TIMESTAMPTZ DEFAULT NULL,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, normalized_query, country)
);

-- 3. udx_demand_clusters
CREATE TABLE IF NOT EXISTS udx_demand_clusters (
    cluster_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) REFERENCES udx_tenants(tenant_id) ON DELETE CASCADE,
    cluster_name VARCHAR(128),
    cluster_slug VARCHAR(128),
    cluster_type VARCHAR(64),
    total_impressions INT DEFAULT 0,
    total_clicks INT DEFAULT 0,
    entity_count INT DEFAULT 0,
    top_intent VARCHAR(32),
    top_audience VARCHAR(32),
    business_value_score NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, cluster_slug)
);

-- 4. udx_opportunities
CREATE TABLE IF NOT EXISTS udx_opportunities (
    opportunity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) REFERENCES udx_tenants(tenant_id) ON DELETE CASCADE,
    entity_id UUID REFERENCES udx_demand_entities(entity_id) ON DELETE CASCADE,
    cluster_id UUID REFERENCES udx_demand_clusters(cluster_id) ON DELETE SET NULL,
    opportunity_type VARCHAR(32),
    priority VARCHAR(4) DEFAULT 'P1',
    quadrant VARCHAR(16),
    score_demand NUMERIC(5,2),
    score_commercial_value NUMERIC(5,2),
    score_competitive_gap NUMERIC(5,2),
    score_conversion_potential NUMERIC(5,2),
    score_product_fit NUMERIC(5,2),
    score_confidence NUMERIC(5,2),
    score_execution_cost NUMERIC(5,2),
    opportunity_score NUMERIC(8,2),
    evidence_chain JSONB DEFAULT '{}',
    recommended_action TEXT,
    agent_recommendation JSONB DEFAULT NULL,
    status VARCHAR(32) DEFAULT 'DETECTED',
    policy_decision VARCHAR(16) DEFAULT NULL,
    approved_by UUID, -- typically REFERENCES auth.users(id) ON DELETE SET NULL
    approved_at TIMESTAMPTZ NULL,
    deployed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, entity_id)
);

-- 5. udx_experiments
CREATE TABLE IF NOT EXISTS udx_experiments (
    experiment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) REFERENCES udx_tenants(tenant_id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES udx_opportunities(opportunity_id) ON DELETE SET NULL,
    hypothesis TEXT NOT NULL,
    category VARCHAR(32),
    control_page TEXT NOT NULL,
    control_description TEXT,
    treatment_description TEXT NOT NULL,
    treatment_changes JSONB DEFAULT '[]',
    primary_metric VARCHAR(64) NOT NULL,
    secondary_metrics TEXT[] DEFAULT '{}',
    min_sample_size INT DEFAULT 100,
    target_confidence NUMERIC(4,2) DEFAULT 0.95,
    started_at TIMESTAMPTZ DEFAULT NULL,
    ended_at TIMESTAMPTZ DEFAULT NULL,
    status VARCHAR(32) DEFAULT 'PLANNED',
    control_conversion_rate NUMERIC(6,4) DEFAULT NULL,
    treatment_conversion_rate NUMERIC(6,4) DEFAULT NULL,
    lift_primary_metric NUMERIC(6,4) DEFAULT NULL,
    statistical_confidence NUMERIC(4,2) DEFAULT NULL,
    p_value NUMERIC(8,6) DEFAULT NULL,
    revenue_impact_inr NUMERIC(12,2) DEFAULT NULL,
    lesson_learned TEXT DEFAULT NULL,
    control_snapshot JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_agent VARCHAR(64) DEFAULT 'EXPERIMENT_AGENT'
);

-- 6. udx_ai_visibility_events
CREATE TABLE IF NOT EXISTS udx_ai_visibility_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) REFERENCES udx_tenants(tenant_id) ON DELETE CASCADE,
    ai_engine VARCHAR(32) NOT NULL,
    benchmark_prompt TEXT NOT NULL,
    prompt_category VARCHAR(64),
    brand_mentioned BOOLEAN DEFAULT false,
    brand_position INT DEFAULT NULL,
    competitor_mentioned TEXT[] DEFAULT '{}',
    sources_cited TEXT[] DEFAULT '{}',
    sentiment VARCHAR(16) DEFAULT 'NOT_PRESENT',
    response_hash VARCHAR(64),
    observed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. udx_search_memory
CREATE TABLE IF NOT EXISTS udx_search_memory (
    memory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) REFERENCES udx_tenants(tenant_id) ON DELETE CASCADE,
    experiment_id UUID REFERENCES udx_experiments(experiment_id) ON DELETE SET NULL,
    memory_type VARCHAR(32),
    query_cluster VARCHAR(128),
    country VARCHAR(8),
    intent VARCHAR(32),
    audience VARCHAR(32),
    content_pattern TEXT,
    outcome VARCHAR(32),
    effect_size NUMERIC(6,4),
    confidence NUMERIC(4,2),
    observations INT DEFAULT 1,
    applicable_to TEXT[],
    first_observed_at TIMESTAMPTZ DEFAULT NOW(),
    last_confirmed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. udx_revenue_attributions
CREATE TABLE IF NOT EXISTS udx_revenue_attributions (
    attribution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) REFERENCES udx_tenants(tenant_id) ON DELETE CASCADE,
    user_id UUID, -- typically REFERENCES auth.users(id) ON DELETE SET NULL
    anonymous_id VARCHAR(128) NOT NULL,
    session_id VARCHAR(128) NOT NULL,
    source_query TEXT,
    source_page TEXT,
    source_country VARCHAR(8),
    demand_entity_id UUID REFERENCES udx_demand_entities(entity_id) ON DELETE SET NULL,
    experiment_id UUID REFERENCES udx_experiments(experiment_id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES udx_opportunities(opportunity_id) ON DELETE SET NULL,
    attribution_type VARCHAR(32),
    conversion_event VARCHAR(64),
    revenue_value_inr NUMERIC(12,2) DEFAULT 0,
    is_incremental BOOLEAN DEFAULT NULL,
    attributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. udx_audit_log
CREATE TABLE IF NOT EXISTS udx_audit_log (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(64) REFERENCES udx_tenants(tenant_id) ON DELETE CASCADE,
    log_type VARCHAR(32),
    actor VARCHAR(64),
    action_taken TEXT NOT NULL,
    policy_class VARCHAR(16),
    opportunity_id UUID,
    experiment_id UUID,
    evidence_summary TEXT,
    outcome VARCHAR(32),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_demand_entities_tenant_id ON udx_demand_entities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_demand_entities_normalized_query ON udx_demand_entities(normalized_query);
CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_id ON udx_opportunities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_experiments_tenant_id ON udx_experiments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_search_memory_tenant_id ON udx_search_memory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON udx_audit_log(tenant_id);

-- Constraints / Triggers for immutability
CREATE OR REPLACE FUNCTION prevent_delete() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'DELETE operation not allowed on %', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_update() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'UPDATE operation not allowed on %', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_udx_search_memory_no_delete ON udx_search_memory;
CREATE TRIGGER trg_udx_search_memory_no_delete
    BEFORE DELETE ON udx_search_memory
    FOR EACH ROW EXECUTE FUNCTION prevent_delete();

DROP TRIGGER IF EXISTS trg_udx_audit_log_no_delete ON udx_audit_log;
CREATE TRIGGER trg_udx_audit_log_no_delete
    BEFORE DELETE ON udx_audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_delete();

DROP TRIGGER IF EXISTS trg_udx_audit_log_no_update ON udx_audit_log;
CREATE TRIGGER trg_udx_audit_log_no_update
    BEFORE UPDATE ON udx_audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_update();

-- Enable RLS
ALTER TABLE udx_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE udx_demand_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE udx_demand_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE udx_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE udx_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE udx_ai_visibility_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE udx_search_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE udx_revenue_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE udx_audit_log ENABLE ROW LEVEL SECURITY;

-- Helper to safely get tenant ID (assuming custom claim or straightforward match)
-- We will assume authenticated users map to their tenant ID via standard JWT claims.
-- For a complete system, these RLS policies rely on the JWT setting.

-- udx_tenants RLS
DROP POLICY IF EXISTS "service_role_all_udx_tenants" ON udx_tenants;
CREATE POLICY "service_role_all_udx_tenants" ON udx_tenants FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_read_udx_tenants" ON udx_tenants;
CREATE POLICY "authenticated_read_udx_tenants" ON udx_tenants FOR SELECT TO authenticated USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

-- udx_demand_entities RLS
DROP POLICY IF EXISTS "service_role_all_udx_demand_entities" ON udx_demand_entities;
CREATE POLICY "service_role_all_udx_demand_entities" ON udx_demand_entities FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_read_udx_demand_entities" ON udx_demand_entities;
CREATE POLICY "authenticated_read_udx_demand_entities" ON udx_demand_entities FOR SELECT TO authenticated USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

-- udx_demand_clusters RLS
DROP POLICY IF EXISTS "service_role_all_udx_demand_clusters" ON udx_demand_clusters;
CREATE POLICY "service_role_all_udx_demand_clusters" ON udx_demand_clusters FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_read_udx_demand_clusters" ON udx_demand_clusters;
CREATE POLICY "authenticated_read_udx_demand_clusters" ON udx_demand_clusters FOR SELECT TO authenticated USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

-- udx_opportunities RLS
DROP POLICY IF EXISTS "service_role_all_udx_opportunities" ON udx_opportunities;
CREATE POLICY "service_role_all_udx_opportunities" ON udx_opportunities FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_read_udx_opportunities" ON udx_opportunities;
CREATE POLICY "authenticated_read_udx_opportunities" ON udx_opportunities FOR SELECT TO authenticated USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

-- udx_experiments RLS
DROP POLICY IF EXISTS "service_role_all_udx_experiments" ON udx_experiments;
CREATE POLICY "service_role_all_udx_experiments" ON udx_experiments FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_read_udx_experiments" ON udx_experiments;
CREATE POLICY "authenticated_read_udx_experiments" ON udx_experiments FOR SELECT TO authenticated USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

-- udx_ai_visibility_events RLS
DROP POLICY IF EXISTS "service_role_all_udx_ai_visibility_events" ON udx_ai_visibility_events;
CREATE POLICY "service_role_all_udx_ai_visibility_events" ON udx_ai_visibility_events FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_read_udx_ai_visibility_events" ON udx_ai_visibility_events;
CREATE POLICY "authenticated_read_udx_ai_visibility_events" ON udx_ai_visibility_events FOR SELECT TO authenticated USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

-- udx_search_memory RLS
DROP POLICY IF EXISTS "service_role_all_udx_search_memory" ON udx_search_memory;
CREATE POLICY "service_role_all_udx_search_memory" ON udx_search_memory FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_read_udx_search_memory" ON udx_search_memory;
CREATE POLICY "authenticated_read_udx_search_memory" ON udx_search_memory FOR SELECT TO authenticated USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

-- udx_revenue_attributions RLS
DROP POLICY IF EXISTS "service_role_all_udx_revenue_attributions" ON udx_revenue_attributions;
CREATE POLICY "service_role_all_udx_revenue_attributions" ON udx_revenue_attributions FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_read_udx_revenue_attributions" ON udx_revenue_attributions;
CREATE POLICY "authenticated_read_udx_revenue_attributions" ON udx_revenue_attributions FOR SELECT TO authenticated USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

-- udx_audit_log RLS
DROP POLICY IF EXISTS "service_role_insert_udx_audit_log" ON udx_audit_log;
CREATE POLICY "service_role_insert_udx_audit_log" ON udx_audit_log FOR INSERT TO service_role WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_read_udx_audit_log" ON udx_audit_log;
CREATE POLICY "service_role_read_udx_audit_log" ON udx_audit_log FOR SELECT TO service_role USING (true);
DROP POLICY IF EXISTS "authenticated_read_udx_audit_log" ON udx_audit_log;
CREATE POLICY "authenticated_read_udx_audit_log" ON udx_audit_log FOR SELECT TO authenticated USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

-- Stored Procedure: calculate_udx_opportunities
CREATE OR REPLACE FUNCTION calculate_udx_opportunities(p_tenant_id VARCHAR)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    WITH scored_entities AS (
        SELECT
            e.entity_id,
            e.tenant_id,
            e.query,
            e.avg_position,
            e.impressions,
            e.ctr,
            (LEAST(e.impressions / 10000.0, 1.0) * 100) AS score_demand,
            CASE WHEN e.commercial_intent = 'HIGH' THEN 90.0 WHEN e.commercial_intent = 'MEDIUM' THEN 60.0 ELSE 30.0 END AS score_commercial_value,
            CASE WHEN e.avg_position > 10 THEN 80.0 WHEN e.avg_position > 5 THEN 50.0 ELSE 20.0 END AS score_competitive_gap,
            COALESCE(e.conversion_potential, 0) * 100 AS score_conversion_potential, 
            CASE WHEN e.supply_exists = false THEN 90.0 ELSE 40.0 END AS score_product_fit,
            CASE WHEN e.data_source = 'gsc_api' THEN 90.0 ELSE 60.0 END AS score_confidence,
            CASE 
                WHEN e.avg_position <= 5.0 AND e.ctr < 0.05 THEN 'FIX_CTR'
                WHEN e.supply_exists = false THEN 'CREATE_PAGE'
                ELSE 'IMPROVE_PAGE'
            END AS opportunity_type,
            CASE
                WHEN e.avg_position BETWEEN 4.0 AND 10.0 AND e.impressions >= 100 THEN 'WIN_NOW'
                WHEN e.avg_position BETWEEN 10.1 AND 20.0 AND e.impressions >= 50 THEN 'ATTACK'
                WHEN e.avg_position > 20.0 AND e.impressions >= 200 THEN 'CREATE'
                WHEN e.avg_position <= 5.0 AND e.ctr < 0.05 AND e.impressions >= 100 THEN 'FIX'
                ELSE 'EXPAND'
            END AS quadrant
        FROM udx_demand_entities e
        WHERE e.tenant_id = p_tenant_id
    ),
    calculated AS (
        SELECT
            s.*,
            CASE WHEN s.opportunity_type = 'FIX_CTR' THEN 0.5 ELSE 1.0 END AS score_execution_cost,
            (
                (s.score_demand * 0.25) +
                (s.score_commercial_value * 0.25) +
                (s.score_conversion_potential * 0.20) +
                (s.score_competitive_gap * 0.15) +
                (s.score_product_fit * 0.10) +
                (s.score_confidence * 0.05)
            ) / CASE WHEN s.opportunity_type = 'FIX_CTR' THEN 0.5 ELSE 1.0 END AS composite_score
        FROM scored_entities s
    ),
    upserted AS (
        INSERT INTO udx_opportunities (
            tenant_id,
            entity_id,
            opportunity_type,
            quadrant,
            score_demand,
            score_commercial_value,
            score_competitive_gap,
            score_conversion_potential,
            score_product_fit,
            score_confidence,
            score_execution_cost,
            opportunity_score
        )
        SELECT
            c.tenant_id,
            c.entity_id,
            c.opportunity_type,
            c.quadrant,
            c.score_demand,
            c.score_commercial_value,
            c.score_competitive_gap,
            c.score_conversion_potential,
            c.score_product_fit,
            c.score_confidence,
            c.score_execution_cost,
            c.composite_score
        FROM calculated c
        ON CONFLICT (tenant_id, entity_id) DO UPDATE SET
            opportunity_type = EXCLUDED.opportunity_type,
            quadrant = EXCLUDED.quadrant,
            score_demand = EXCLUDED.score_demand,
            score_commercial_value = EXCLUDED.score_commercial_value,
            score_competitive_gap = EXCLUDED.score_competitive_gap,
            score_conversion_potential = EXCLUDED.score_conversion_potential,
            score_product_fit = EXCLUDED.score_product_fit,
            score_confidence = EXCLUDED.score_confidence,
            score_execution_cost = EXCLUDED.score_execution_cost,
            opportunity_score = EXCLUDED.opportunity_score,
            updated_at = NOW()
        RETURNING opportunity_id
    )
    SELECT COUNT(*) INTO v_count FROM upserted;

    RETURN v_count;
END;
$$;

-- Seed Data
INSERT INTO udx_tenants (tenant_id, domain, gsc_property_id, status)
VALUES
  ('talentxcel', 'talentxcel.in', 'sc-domain:talentxcel.in', 'ACTIVE'),
  ('chatr', 'chatrchat.in', 'sc-domain:chatrchat.in', 'ACTIVE')
ON CONFLICT (tenant_id) DO NOTHING;
