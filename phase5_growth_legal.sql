-- Phase 5 SQL Schema: Kernel v2 Data Foundation, GrowthOS & LegalOS
-- Implements multi-tenancy, auditability, structured governance, and event sourcing.

-- ==========================================
-- KERNEL V2 CORE TABLES (Shared Services)
-- ==========================================

-- Activity Centre
CREATE TABLE activity_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  capability text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  payload jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX idx_activity_events_org ON activity_events(org_id);
CREATE INDEX idx_activity_events_entity ON activity_events(entity_type, entity_id);

-- Event Mesh Outbox
CREATE TABLE event_outbox (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  topic text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Published', 'Failed')),
  retry_count integer DEFAULT 0,
  error_message text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  processed_at timestamp with time zone
);
CREATE INDEX idx_event_outbox_status ON event_outbox(status);


-- ==========================================
-- GROWTH OS
-- ==========================================

CREATE TABLE growth_campaigns (
  -- Identity
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Ownership
  org_id uuid NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Business Fields
  name text NOT NULL,
  objective text NOT NULL,
  strategy_summary text,
  target_audience text,
  channel text,
  budget numeric,
  currency text DEFAULT 'USD',
  roi_predicted numeric,
  priority text DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  
  -- Lifecycle
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Approved', 'Active', 'Paused', 'Completed', 'Archived')),
  version integer NOT NULL DEFAULT 1,
  
  -- AI & Governance
  generated_by_ai boolean DEFAULT false,
  model text,
  prompt_version text,
  approval_state text DEFAULT 'Pending' CHECK (approval_state IN ('Pending', 'Approved', 'Rejected', 'Auto-Approved')),
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamp with time zone,

  -- Search
  search_vector tsvector,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamp with time zone
);

CREATE INDEX idx_growth_campaigns_org ON growth_campaigns(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_growth_campaigns_status ON growth_campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_growth_campaigns_search ON growth_campaigns USING gin(search_vector);


CREATE TABLE growth_assets (
  -- Identity
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Ownership
  org_id uuid NOT NULL,
  campaign_id uuid REFERENCES growth_campaigns(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Business Fields
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL,
  
  -- Lifecycle
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Approved', 'Published', 'Archived')),
  version integer NOT NULL DEFAULT 1,

  -- AI & Governance
  generated_by_ai boolean DEFAULT false,
  model text,
  approval_state text DEFAULT 'Pending' CHECK (approval_state IN ('Pending', 'Approved', 'Rejected', 'Auto-Approved')),
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamp with time zone,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamp with time zone
);
CREATE INDEX idx_growth_assets_org_campaign ON growth_assets(org_id, campaign_id) WHERE deleted_at IS NULL;


CREATE TABLE growth_competitors (
  -- Identity
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Ownership
  org_id uuid NOT NULL,
  
  -- Business Fields
  name text NOT NULL,
  market_share numeric,
  last_seen_at timestamp with time zone,
  source text,
  confidence numeric DEFAULT 1.0,
  notes text,
  
  -- Lifecycle
  version integer NOT NULL DEFAULT 1,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamp with time zone
);
CREATE INDEX idx_growth_competitors_org ON growth_competitors(org_id) WHERE deleted_at IS NULL;


CREATE TABLE growth_memory (
  -- Identity
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Ownership
  org_id uuid NOT NULL,
  
  -- Business Fields (Learned Insights)
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  observation text NOT NULL,
  confidence numeric DEFAULT 1.0,
  source text NOT NULL,
  
  -- Lifecycle
  version integer NOT NULL DEFAULT 1,

  -- AI & Governance
  generated_by_ai boolean DEFAULT true,
  model text,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamp with time zone
);
CREATE INDEX idx_growth_memory_entity ON growth_memory(org_id, entity_type, entity_id) WHERE deleted_at IS NULL;


CREATE TABLE growth_brand_brain (
  -- Identity
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Ownership
  org_id uuid NOT NULL UNIQUE,
  
  -- Business Fields
  mission text,
  vision text,
  tone text,
  positioning text,
  personas jsonb,
  value_proposition text,
  style_guide jsonb,
  approved_terms text[],
  banned_terms text[],
  primary_cta text,
  
  -- Lifecycle
  version integer NOT NULL DEFAULT 1,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamp with time zone
);
CREATE INDEX idx_growth_brand_brain_org ON growth_brand_brain(org_id) WHERE deleted_at IS NULL;


-- ==========================================
-- LEGAL OS
-- ==========================================

CREATE TABLE legal_contracts (
  -- Identity
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Ownership
  org_id uuid NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Business Fields
  contract_number text NOT NULL,
  title text NOT NULL,
  counterparty text NOT NULL,
  value numeric,
  currency text DEFAULT 'USD',
  effective_date timestamp with time zone,
  expiry_date timestamp with time zone,
  document_reference text,
  
  -- Lifecycle
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Internal Review', 'External Review', 'Approved', 'Signed', 'Active', 'Expired', 'Terminated', 'Archived')),
  review_status text DEFAULT 'Pending' CHECK (review_status IN ('Pending', 'In Progress', 'Completed')),
  version integer NOT NULL DEFAULT 1,

  -- AI & Risk
  risk_level text DEFAULT 'Medium' CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
  risk_factors jsonb, -- Array of identified risks
  suggested_review_areas jsonb, -- Array of specific clauses requiring human review
  ai_summary text,
  generated_by_ai boolean DEFAULT false,
  model text,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamp with time zone
);
CREATE INDEX idx_legal_contracts_org ON legal_contracts(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_legal_contracts_status ON legal_contracts(status) WHERE deleted_at IS NULL;


-- ==========================================
-- MULTI-TENANT ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Standardized RLS template applied to all business tables
-- Requires an assumed `organization_members` table linking users to organizations.
-- This ensures users can only read/write data in their active organizations, excluding soft-deleted records.

ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_policy" ON activity_events FOR ALL USING (
  EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = activity_events.org_id AND om.user_id = auth.uid())
);

ALTER TABLE event_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_policy" ON event_outbox FOR ALL USING (
  EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = event_outbox.org_id AND om.user_id = auth.uid())
);

ALTER TABLE growth_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_policy" ON growth_campaigns FOR ALL USING (
  deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = growth_campaigns.org_id AND om.user_id = auth.uid())
);

ALTER TABLE growth_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_policy" ON growth_assets FOR ALL USING (
  deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = growth_assets.org_id AND om.user_id = auth.uid())
);

ALTER TABLE growth_competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_policy" ON growth_competitors FOR ALL USING (
  deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = growth_competitors.org_id AND om.user_id = auth.uid())
);

ALTER TABLE growth_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_policy" ON growth_memory FOR ALL USING (
  deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = growth_memory.org_id AND om.user_id = auth.uid())
);

ALTER TABLE growth_brand_brain ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_policy" ON growth_brand_brain FOR ALL USING (
  deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = growth_brand_brain.org_id AND om.user_id = auth.uid())
);

ALTER TABLE legal_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_policy" ON legal_contracts FOR ALL USING (
  deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = legal_contracts.org_id AND om.user_id = auth.uid())
);
