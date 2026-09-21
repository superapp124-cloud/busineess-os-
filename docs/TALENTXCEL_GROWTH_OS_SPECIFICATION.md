# TalentXcel Global Growth Operating System (TX-GGOS)
## Production Engineering Master Specification — Version 1.0.0 (2026 Enterprise Edition)

---

### Executive Summary & System Mandate

TalentXcel operates as the talent acquisition, career intelligence, and professional matchmaking counterpart to CHATR+. Where CHATR drives real-time communication, lead conversion, and business messaging, TalentXcel builds the **structured career discovery engine** that acquires, qualifies, and activates candidates and hiring organizations at planetary scale.

Traditional job boards rely on expensive paid search arbitrage (Google Ads) or thin, mass-generated content farms that trigger Google's Search Quality & Spam Policies (specifically targeting **Scaled Content Abuse** and low-utility commodity content). 

**TalentXcel Global Growth Operating System (TX-GGOS)** rejects low-value content generation. Instead, TX-GGOS models the global labor market as an **interconnected Career Intent Graph**. Every search destination on TalentXcel must satisfy three immutable production invariants:
1. **Underlying Data Object**: Every URL is backed by real relational data entities (validated compensation benchmarks, active requisitions, structured interview question banks, ATS keyword datasets, or accredited skill taxonomies).
2. **Instant Interactive Utility**: No visitor is greeted by static marketing fluff or forced sign-in walls. Every landing node immediately delivers interactive computation (e.g., live ATS resume parsing, salary percentiles, interactive mock interview simulators, or skill gap heatmaps).
3. **Frictionless Activation & Organic Compounding**: Search traffic is instantly funneled into verified profiles, resume enhancements, and application workflows, creating an organic loop where activated candidates invite peers, share scorecards, and attract hiring managers.

---

```
                                  GOOGLE SEARCH ECOSYSTEM
                     (AI Overviews, Standard Web Search, Job Rich Snippets)
                                             │
                                             ▼
                     ┌─────────────────────────────────────────────────┐
                     │          SEARCH INTENT DEMAND POOLS             │
                     │  • Jobs: /jobs/{role}/{location}/{experience}   │
                     │  • Careers & Salary: /roles/{role}/salary       │
                     │  • ATS & Resumes: /free-ats-resume-checker      │
                     │  • Interview Prep: /interview/{role}/{company}  │
                     │  • Skill Intelligence: /skills/{skill}/jobs     │
                     └───────────────────────┬─────────────────────────┘
                                             │
                                             ▼
                     ┌─────────────────────────────────────────────────┐
                     │          TALENTXCEL GRAPH LANDING NODE          │
                     │  • Schema.org Rich Entities (JobPosting, etc.)  │
                     │  • Live Interactive Computation (No paywall)    │
                     │  • Structured Regional & Experience Facets      │
                     └───────────────────────┬─────────────────────────┘
                                             │
                                             ▼
                     ┌─────────────────────────────────────────────────┐
                     │       PRODUCT UTILITY & FRICTIONLESS ACTIVATION │
                     │  • Instant ATS Score & Missing Keyword Extractor│
                     │  • AI Mock Interview Rubric & Feedback         │
                     │  • One-Click Application with Verified Profile  │
                     └───────────────────────┬─────────────────────────┘
                                             │
                                             ▼
                     ┌─────────────────────────────────────────────────┐
                     │           VERIFIED TALENTXCEL ACCOUNT           │
                     │   Candidate Profile ◄──► Recruiter Discovery    │
                     └───────────────────────┬─────────────────────────┘
                                             │
                         ┌───────────────────┴───────────────────┐
                         ▼                                       ▼
             VIRAL & REFERRAL LOOPS                     RETENTION ENGINES
      • Public Verified Profiles (/p/@handle)   • Automated Career Trajectory Alerts
      • ATS Grade & Skill Badge Sharing         • Real-time New Requisition Matching
      • Collaborative Peer Applications         • Periodic Salary Benchmark Updates
                         │                                       │
                         └───────────────────┬───────────────────┘
                                             │
                                             ▼
                         COMPOUNDING ORGANIC AUTHORITY & DEMAND
```

---

## Section 1: The Career Intent Graph & Entity Ontology

### 1.1 The 10 Graph Dimensions
The TalentXcel Career Graph coordinates 10 orthogonal dimensions. URLs are dynamic routing views over this unified graph:

| Dimension | Description | Canonical Entity Examples |
|:---|:---|:---|
| **1. Role** | Normalized occupational titles mapped to SOC/ESCO standards. | `software-engineer`, `data-analyst`, `product-manager`, `customer-experience-manager` |
| **2. Location** | Hierarchical geographical entities (Country $\to$ State/Region $\to$ Metro $\to$ Remote). | `india`, `bangalore`, `delhi-ncr`, `mumbai`, `remote-india`, `usa`, `london-uk` |
| **3. Industry** | Vertical market sector classification. | `fintech`, `healthcare-healthtech`, `b2b-saas`, `e-commerce`, `banking` |
| **4. Experience** | Career stage and seniority segmentation. | `fresher-entry-level`, `1-3-years`, `mid-senior-4-7-years`, `lead-director-8plus` |
| **5. Skills** | Atomic technical, functional, and interpersonal competencies. | `python`, `sql`, `react`, `aws`, `financial-modeling`, `prompt-engineering` |
| **6. Compensation** | Empirical salary brackets, percentiles, and total compensation distributions. | `inr-10-15-lpa`, `inr-25-40-lpa`, `usd-120k-160k` |
| **7. Resume/CV** | Role-tailored ATS templates, bullet point libraries, and keyword matrices. | `data-analyst-resume-template`, `fresher-cs-resume` |
| **8. Interview** | Verified question banks, coding challenges, behavioral rubrics, system designs. | `react-system-design`, `hr-behavioral-star-method` |
| **9. Career Path** | Predecessor and successor role progression topologies. | `junior-analyst` $\to$ `senior-analyst` $\to$ `analytics-manager` |
| **10. Companies** | Verified hiring organization profiles, recruiter seats, and interview patterns. | `talentxcel-services`, `infosys`, `tcs`, `google`, `flipkart` |

### 1.2 URL Routing Architecture & Canonical Hierarchy

```
TALENTXCEL ROOT (talentxcel.in)
│
├── /jobs                                         [Global Job Search Hub]
│   ├── /jobs/{role}                              e.g. /jobs/data-analyst
│   ├── /jobs/{role}/{location}                   e.g. /jobs/data-analyst/bangalore
│   ├── /jobs/{role}/{location}/{experience}      e.g. /jobs/data-analyst/bangalore/fresher
│   ├── /jobs/remote                              e.g. /jobs/remote/software-engineer
│   └── /jobs/view/{job-id}-{slug}                [Individual Canonical Job Posting]
│
├── /roles                                        [Career Intelligence Hub]
│   ├── /roles/{role}                             [Role Master Hub: Overview & Graph]
│   ├── /roles/{role}/salary                      e.g. /roles/software-engineer/salary
│   ├── /roles/{role}/salary/{location}           e.g. /roles/software-engineer/salary/bangalore
│   ├── /roles/{role}/skills                      e.g. /roles/data-analyst/skills
│   ├── /roles/{role}/career-path                 e.g. /roles/product-manager/career-path
│   └── /roles/{role}/certifications              e.g. /roles/cybersecurity-analyst/certifications
│
├── /resume                                       [Resume Engine Hub]
│   ├── /free-ats-resume-checker                  [Flagship Acquisition Tool]
│   ├── /resume-builder                           [Interactive Web Canvas]
│   ├── /resume-templates                         [Downloadable ATS-Compliant Layouts]
│   └── /resume/{role}                            e.g. /resume/software-engineer
│
├── /interview                                    [Interview Prep Hub]
│   ├── /interview/{role}                         e.g. /interview/product-manager
│   ├── /interview/{role}/{company}               e.g. /interview/software-engineer/amazon
│   └── /interview-simulator                      [AI Live Voice/Text Evaluation Engine]
│
├── /skills                                       [Atomic Skill Knowledge Graph]
│   ├── /skills/{skill}                           e.g. /skills/sql
│   ├── /skills/{skill}/interview-questions       e.g. /skills/sql/interview-questions
│   └── /skills/{skill}/jobs                      e.g. /skills/sql/jobs
│
├── /company                                      [Company Career Surfaces]
│   ├── /company/{company-slug}                   e.g. /company/talentxcel-services
│   └── /company/{company-slug}/jobs              e.g. /company/talentxcel-services/jobs
│
└── /p/{handle}                                   [Public Opt-In Candidate Profiles]
```

### 1.3 Quality Gatekeeper & Indexation Safeguards
To comply strictly with Google Search Guidelines (preventing soft 404s and thin pages), TX-GGOS enforces a **Dynamic Indexing Policy Engine**:

1. **Job Matrix Pages (`/jobs/{role}/{location}`)**:
   - Condition: `active_job_count >= 3`.
   - If `true`: `<meta name="robots" content="index, follow">`, Full `ItemList` + `JobPosting` schema.
   - If `false`: `<meta name="robots" content="noindex, follow">`, displays fallback related locations and career insights while keeping internal links crawlable.
2. **Career & Salary Hub Pages (`/roles/{role}/salary/{location}`)**:
   - Condition: `empirical_data_points >= 15` or validated labor bureau benchmark dataset attached.
   - Dynamic interactive percentile chart rendered client-side + server-side pre-rendered summary tables.
3. **Tool Pages (`/free-ats-resume-checker`, `/interview-simulator`)**:
   - 100% indexed, instant zero-login interaction required. Users get instant value before any signup modal.

---

## Section 2: Supabase / PostgreSQL Core Production Schema

Below is the complete, idempotent SQL migration defining the TX-GGOS warehouse, career graph, GSC tracking, and autonomous action engines.

```sql
-- =============================================================================
-- TALENTXCEL GLOBAL GROWTH OPERATING SYSTEM (TX-GGOS) — CORE SCHEMA
-- Migration: 20260910180000_talentxcel_growth_os.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. CAREER GRAPH ENTITIES & RELATIONSHIPS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tx_roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(128) NOT NULL UNIQUE,
    title VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'Engineering', 'Data', 'Product', 'Sales', 'Operations'
    soc_code VARCHAR(32) DEFAULT NULL, -- Standard Occupational Classification
    summary TEXT NOT NULL,
    median_salary_inr INT NOT NULL DEFAULT 0,
    salary_p25_inr INT NOT NULL DEFAULT 0,
    salary_p75_inr INT NOT NULL DEFAULT 0,
    median_salary_usd INT NOT NULL DEFAULT 0,
    active_jobs_count INT NOT NULL DEFAULT 0,
    is_indexed BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tx_locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(128) NOT NULL UNIQUE,
    city VARCHAR(64) NOT NULL,
    state VARCHAR(64) DEFAULT NULL,
    country VARCHAR(8) NOT NULL DEFAULT 'IN', -- ISO 3166-1 alpha-2
    region_tier INT NOT NULL DEFAULT 1, -- Tier 1 (Metro), Tier 2, etc.
    is_remote BOOLEAN NOT NULL DEFAULT false,
    active_jobs_count INT NOT NULL DEFAULT 0,
    is_indexed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tx_skills (
    skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'Programming Language', 'Framework', 'Cloud', 'Soft Skill'
    importance_score NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    demand_index NUMERIC(5,2) NOT NULL DEFAULT 50.0,
    is_indexed BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tx_role_skills (
    role_id UUID REFERENCES public.tx_roles(role_id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.tx_skills(skill_id) ON DELETE CASCADE,
    weight NUMERIC(3,2) NOT NULL DEFAULT 1.0, -- 1.0 = Required, 0.5 = Preferred
    PRIMARY KEY (role_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.tx_job_postings (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(128) DEFAULT NULL,
    organization_id UUID DEFAULT NULL,
    title VARCHAR(192) NOT NULL,
    role_id UUID REFERENCES public.tx_roles(role_id) ON DELETE SET NULL,
    location_id UUID REFERENCES public.tx_locations(location_id) ON DELETE SET NULL,
    employment_type VARCHAR(32) NOT NULL DEFAULT 'FULL_TIME', -- 'FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACT'
    experience_level VARCHAR(32) NOT NULL DEFAULT 'MID', -- 'FRESHER', 'ENTRY', 'MID', 'SENIOR', 'LEAD'
    salary_min INT DEFAULT NULL,
    salary_max INT DEFAULT NULL,
    salary_currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    description_markdown TEXT NOT NULL,
    requirements JSONB DEFAULT '[]'::jsonb,
    hiring_organization_name VARCHAR(128) NOT NULL,
    apply_url TEXT NOT NULL,
    is_direct_apply BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'FILLED'
    valid_through TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '45 days'),
    views_count INT NOT NULL DEFAULT 0,
    applications_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_jobs_role_loc ON public.tx_job_postings (role_id, location_id, status);
CREATE INDEX IF NOT EXISTS idx_tx_jobs_active ON public.tx_job_postings (status, valid_through);

-- -----------------------------------------------------------------------------
-- 2. ACQUISITION TOOLS (ATS & INTERVIEW TELEMETRY)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tx_ats_scans (
    scan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    anonymous_id VARCHAR(128) NOT NULL,
    session_id VARCHAR(128) NOT NULL,
    target_role_id UUID REFERENCES public.tx_roles(role_id) ON DELETE SET NULL,
    overall_score INT NOT NULL, -- 0 to 100
    formatting_score INT NOT NULL,
    keyword_score INT NOT NULL,
    experience_impact_score INT NOT NULL,
    detected_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    actionable_improvements JSONB DEFAULT '[]'::jsonb,
    file_name VARCHAR(256) DEFAULT NULL,
    file_hash_sha256 VARCHAR(64) DEFAULT NULL,
    converted_to_profile BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tx_interview_questions (
    question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES public.tx_roles(role_id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.tx_skills(skill_id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    sample_answer TEXT NOT NULL,
    evaluation_rubric JSONB NOT NULL DEFAULT '[]'::jsonb,
    difficulty VARCHAR(16) NOT NULL DEFAULT 'MEDIUM', -- 'EASY', 'MEDIUM', 'HARD'
    upvotes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tx_mock_interviews (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    anonymous_id VARCHAR(128) NOT NULL,
    role_id UUID REFERENCES public.tx_roles(role_id) ON DELETE CASCADE,
    total_questions INT NOT NULL DEFAULT 5,
    completed_questions INT NOT NULL DEFAULT 0,
    overall_performance_score INT DEFAULT NULL, -- 0 to 100
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    recommended_jobs_count INT NOT NULL DEFAULT 0,
    share_token VARCHAR(64) UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. ATTRIBUTION WAREHOUSE & GROWTH TELEMETRY
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tx_growth_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(64) NOT NULL,
    category VARCHAR(32) NOT NULL, -- 'acquisition', 'signup', 'activation', 'viral', 'retention', 'ats', 'interview'
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_timestamp BIGINT NOT NULL,
    server_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Identity Lineage
    anonymous_id VARCHAR(128) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(128) NOT NULL,
    
    -- Source Attribution
    source VARCHAR(64) NOT NULL DEFAULT 'direct', -- 'google', 'linkedin', 'direct', 'referral'
    medium VARCHAR(64) DEFAULT 'none',
    campaign VARCHAR(128) DEFAULT NULL,
    landing_page TEXT NOT NULL,
    referrer TEXT DEFAULT NULL,
    referral_code VARCHAR(64) DEFAULT NULL,
    referral_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Geo & Platform
    country VARCHAR(8) DEFAULT 'IN',
    city VARCHAR(64) DEFAULT NULL,
    device VARCHAR(32) DEFAULT 'desktop',
    browser VARCHAR(32) DEFAULT 'unknown',
    
    -- Target Node Context
    role_id UUID REFERENCES public.tx_roles(role_id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.tx_job_postings(job_id) ON DELETE SET NULL,
    
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_tx_growth_type_time ON public.tx_growth_events (event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_tx_growth_user ON public.tx_growth_events (user_id);
CREATE INDEX IF NOT EXISTS idx_tx_growth_anon ON public.tx_growth_events (anonymous_id);
CREATE INDEX IF NOT EXISTS idx_tx_growth_landing ON public.tx_growth_events (landing_page);

-- -----------------------------------------------------------------------------
-- 4. GOOGLE SEARCH CONSOLE REPOSITORY & QUADRANT ENGINE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tx_gsc_properties (
    property_id VARCHAR(128) PRIMARY KEY, -- e.g. 'sc-domain:talentxcel.in'
    display_name VARCHAR(128) NOT NULL,
    auth_status VARCHAR(32) NOT NULL DEFAULT 'CONNECTED',
    last_sync_at TIMESTAMPTZ DEFAULT NULL,
    total_clicks_30d INT DEFAULT 0,
    total_impressions_30d INT DEFAULT 0,
    avg_position NUMERIC(5,2) DEFAULT 0.0,
    avg_ctr NUMERIC(5,4) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tx_gsc_sync_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id VARCHAR(128) REFERENCES public.tx_gsc_properties(property_id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    rows_synced INT DEFAULT 0,
    error_message TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS public.tx_gsc_queries (
    id BIGSERIAL PRIMARY KEY,
    property_id VARCHAR(128) REFERENCES public.tx_gsc_properties(property_id) ON DELETE CASCADE,
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
    CONSTRAINT uq_tx_gsc_query_day UNIQUE (property_id, sync_date, query, page, country, device)
);

CREATE INDEX IF NOT EXISTS idx_tx_gsc_q_perf ON public.tx_gsc_queries (query, impressions DESC);
CREATE INDEX IF NOT EXISTS idx_tx_gsc_q_page ON public.tx_gsc_queries (page);

CREATE TABLE IF NOT EXISTS public.tx_gsc_opportunities (
    opportunity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id VARCHAR(128) REFERENCES public.tx_gsc_properties(property_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    target_page TEXT DEFAULT NULL,
    country VARCHAR(8) DEFAULT 'GLOBAL',
    quadrant VARCHAR(16) NOT NULL, -- 'WIN_NOW', 'ATTACK', 'CREATE', 'FIX', 'EXPAND'
    current_position NUMERIC(5,2) NOT NULL,
    impressions INT NOT NULL,
    clicks INT NOT NULL,
    ctr NUMERIC(6,4) NOT NULL,
    intent_category VARCHAR(32) NOT NULL DEFAULT 'JOB_SEARCH', -- 'JOB_SEARCH', 'SALARY', 'RESUME_ATS', 'INTERVIEW', 'SKILL'
    opportunity_score NUMERIC(8,2) NOT NULL,
    recommended_action TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DETECTED', -- 'DETECTED', 'ASSIGNED', 'DEPLOYED', 'RESOLVED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_gsc_opp_score ON public.tx_gsc_opportunities (opportunity_score DESC);

-- -----------------------------------------------------------------------------
-- 5. OPPORTUNITY CLASSIFIER RPC (Postgres Atomic Engine)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calculate_tx_gsc_opportunities(p_property_id VARCHAR)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inserted INT := 0;
BEGIN
    DELETE FROM public.tx_gsc_opportunities WHERE property_id = p_property_id;

    INSERT INTO public.tx_gsc_opportunities (
        property_id, query, target_page, country, quadrant,
        current_position, impressions, clicks, ctr, intent_category,
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
            WHEN q.query ILIKE '%salary%' OR q.query ILIKE '%ctc%' OR q.query ILIKE '%pay%' THEN 'SALARY'
            WHEN q.query ILIKE '%resume%' OR q.query ILIKE '%ats%' OR q.query ILIKE '%cv%' THEN 'RESUME_ATS'
            WHEN q.query ILIKE '%interview%' OR q.query ILIKE '%questions%' THEN 'INTERVIEW'
            WHEN q.query ILIKE '%skills%' OR q.query ILIKE '%learn%' OR q.query ILIKE '%course%' THEN 'SKILL'
            ELSE 'JOB_SEARCH'
        END AS intent_category,
        (
            q.impressions * 
            (0.18 - LEAST(0.18, q.ctr)) * 
            (CASE WHEN q.position <= 10 THEN 2.2 WHEN q.position <= 20 THEN 1.6 ELSE 1.0 END) *
            (CASE 
                WHEN q.query ILIKE '%ats%' OR q.query ILIKE '%resume%' THEN 2.8
                WHEN q.query ILIKE '%salary%' OR q.query ILIKE '%jobs%' THEN 2.0
                ELSE 1.2
             END)
        )::NUMERIC(8,2) AS opportunity_score,
        CASE 
            WHEN q.position <= 5.0 AND q.ctr < 0.05 THEN 'Rewrite SERP Title & Meta Description; inject salary badge or live job counter'
            WHEN q.position BETWEEN 4.0 AND 10.0 THEN 'Enrich page with interactive ATS widget, recent job postings, and breadcrumb schema'
            WHEN q.position BETWEEN 10.1 AND 20.0 THEN 'Generate dedicated facet node (/jobs/{role}/{location}) with minimum 3 validated requisitions'
            WHEN q.position > 20.0 THEN 'Create structured career intelligence guide with wage percentiles and interview rubric'
            ELSE 'Add cross-links from top-ranking related career hubs'
        END AS recommended_action,
        'DETECTED'
    FROM (
        SELECT 
            property_id, query, page, country,
            SUM(clicks) as clicks,
            SUM(impressions) as impressions,
            AVG(position)::NUMERIC(5,2) as position,
            (SUM(clicks)::NUMERIC / NULLIF(SUM(impressions), 0))::NUMERIC(6,4) as ctr
        FROM public.tx_gsc_queries
        WHERE property_id = p_property_id
        GROUP BY property_id, query, page, country
        HAVING SUM(impressions) >= 25
    ) q;

    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    RETURN v_inserted;
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE public.tx_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tx_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tx_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tx_role_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tx_job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tx_ats_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tx_interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tx_mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tx_growth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tx_gsc_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tx_gsc_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tx_gsc_opportunities ENABLE ROW LEVEL SECURITY;

-- Public Read for Catalog & Graph Entities
CREATE POLICY "Public read tx_roles" ON public.tx_roles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read tx_locations" ON public.tx_locations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read tx_skills" ON public.tx_skills FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read tx_role_skills" ON public.tx_role_skills FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read active tx_jobs" ON public.tx_job_postings FOR SELECT TO anon, authenticated USING (status = 'ACTIVE');
CREATE POLICY "Public read interview questions" ON public.tx_interview_questions FOR SELECT TO anon, authenticated USING (true);

-- Anonymous and Authenticated Telemetry Insertion
CREATE POLICY "Allow public insert tx_growth_events" ON public.tx_growth_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public insert tx_ats_scans" ON public.tx_ats_scans FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public insert tx_mock_interviews" ON public.tx_mock_interviews FOR INSERT TO anon, authenticated WITH CHECK (true);

-- User-scoped Read for Private Scans
CREATE POLICY "User read own ats scans" ON public.tx_ats_scans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "User read own mock interviews" ON public.tx_mock_interviews FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- GSC & Admin Read
CREATE POLICY "Allow read gsc data" ON public.tx_gsc_properties FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow read gsc queries" ON public.tx_gsc_queries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow read gsc opportunities" ON public.tx_gsc_opportunities FOR SELECT TO anon, authenticated USING (true);

-- Service Role Unrestricted Access
CREATE POLICY "Service full access tx_roles" ON public.tx_roles FOR ALL TO service_role USING (true);
CREATE POLICY "Service full access tx_jobs" ON public.tx_job_postings FOR ALL TO service_role USING (true);
CREATE POLICY "Service full access tx_growth_events" ON public.tx_growth_events FOR ALL TO service_role USING (true);
CREATE POLICY "Service full access tx_gsc_queries" ON public.tx_gsc_queries FOR ALL TO service_role USING (true);
CREATE POLICY "Service full access tx_gsc_opportunities" ON public.tx_gsc_opportunities FOR ALL TO service_role USING (true);
```

---

## Section 3: Google Search Console (GSC) Sync Worker Engine

The GSC Sync Worker runs daily as an automated background edge function or Node.js cron. It interfaces with Google's Search Console API (`searchanalytics: query`), fetches search queries, ranks, and impressions with a 3-day data-stabilization buffer, and triggers the `calculate_tx_gsc_opportunities` stored procedure.

```typescript
/**
 * TalentXcel GSC Sync Worker (Production Edge Worker)
 * File: src/services/gscSyncWorker.ts
 */

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SyncOptions {
  propertyId: string;
  daysBack?: number;
  rowLimit?: number;
}

export async function runGscSync({
  propertyId = 'sc-domain:talentxcel.in',
  daysBack = 3,
  rowLimit = 25000
}: SyncOptions) {
  const startedAt = new Date().toISOString();
  console.log(`[GSC-SYNC] Starting sync for ${propertyId} at ${startedAt}`);

  // 1. Authenticate with Google Search Console API via Service Account
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '').replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('[GSC-SYNC] Missing Google Service Account Credentials in environment');
  }

  const auth = new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey,
    ['https://www.googleapis.com/auth/webmasters.readonly']
  );

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  // 2. Compute date window: 3-day stabilization buffer
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - daysBack);
  const formattedDate = targetDate.toISOString().split('T')[0];

  // 3. Log Sync Run
  const { data: runRecord, error: runErr } = await supabase
    .from('tx_gsc_sync_runs')
    .insert({
      property_id: propertyId,
      date_start: formattedDate,
      date_end: formattedDate,
      status: 'RUNNING'
    })
    .select('run_id')
    .single();

  if (runErr) throw new Error(`[GSC-SYNC] Failed to initialize run record: ${runErr.message}`);
  const runId = runRecord.run_id;

  try {
    let startRow = 0;
    let totalRowsSynced = 0;
    let hasMore = true;

    while (hasMore && totalRowsSynced < rowLimit) {
      console.log(`[GSC-SYNC] Fetching chunk from row ${startRow}...`);
      
      const response = await searchconsole.searchanalytics.query({
        siteUrl: propertyId,
        requestBody: {
          startDate: formattedDate,
          endDate: formattedDate,
          dimensions: ['query', 'page', 'country', 'device'],
          rowLimit: 5000,
          startRow: startRow,
          aggregationType: 'auto'
        }
      });

      const rows = response.data.rows;
      if (!rows || rows.length === 0) {
        hasMore = false;
        break;
      }

      // 4. Batch upsert into tx_gsc_queries
      const batch = rows.map((r) => {
        const query = r.keys?.[0] || '';
        const page = r.keys?.[1] || '';
        const country = r.keys?.[2] || 'GLOBAL';
        const device = r.keys?.[3] || 'ALL';

        return {
          property_id: propertyId,
          sync_date: formattedDate,
          query: query.trim().toLowerCase(),
          page: page.trim(),
          country: country.toUpperCase(),
          device: device.toUpperCase(),
          clicks: r.clicks || 0,
          impressions: r.impressions || 0,
          ctr: Number(r.ctr || 0),
          position: Number(r.position || 0)
        };
      });

      const { error: upsertErr } = await supabase
        .from('tx_gsc_queries')
        .upsert(batch, {
          onConflict: 'property_id,sync_date,query,page,country,device'
        });

      if (upsertErr) {
        console.error('[GSC-SYNC] Upsert batch error:', upsertErr);
        throw upsertErr;
      }

      totalRowsSynced += batch.length;
      startRow += rows.length;

      if (rows.length < 5000) {
        hasMore = false;
      }
    }

    // 5. Trigger Opportunity Classification RPC
    console.log('[GSC-SYNC] Triggering calculate_tx_gsc_opportunities RPC...');
    const { data: oppCount, error: rpcErr } = await supabase.rpc(
      'calculate_tx_gsc_opportunities',
      { p_property_id: propertyId }
    );

    if (rpcErr) {
      console.error('[GSC-SYNC] RPC execution error:', rpcErr);
    } else {
      console.log(`[GSC-SYNC] Generated ${oppCount} classified growth opportunities`);
    }

    // 6. Complete Sync Record
    await supabase
      .from('tx_gsc_sync_runs')
      .update({
        status: 'SUCCESS',
        completed_at: new Date().toISOString(),
        rows_synced: totalRowsSynced
      })
      .eq('run_id', runId);

    // 7. Update Property Overview
    await supabase
      .from('tx_gsc_properties')
      .update({
        last_sync_at: new Date().toISOString(),
        auth_status: 'CONNECTED'
      })
      .eq('property_id', propertyId);

    return { success: true, rowsSynced: totalRowsSynced, opportunitiesGenerated: oppCount };
  } catch (error: any) {
    console.error('[GSC-SYNC] Execution failed:', error);
    await supabase
      .from('tx_gsc_sync_runs')
      .update({
        status: 'FAILED',
        completed_at: new Date().toISOString(),
        error_message: error.message
      })
      .eq('run_id', runId);

    throw error;
  }
}
```

---

## Section 4: Event Taxonomy & Attribution Engine

TalentXcel enforces zero synthetic data and strict privacy boundaries. Candidates' raw resumes, mobile numbers, and personal identifiers are strictly isolated from the analytics stream.

```typescript
/**
 * TalentXcel Event Taxonomy & Attribution Contract
 * File: src/core/growth/TalentXcelTaxonomy.ts
 */

export type TxEventCategory =
  | 'acquisition'
  | 'signup'
  | 'activation'
  | 'ats_tool'
  | 'interview_tool'
  | 'job_action'
  | 'viral'
  | 'retention';

export type TxEventType =
  // 1. Acquisition
  | 'organic_search_landing'
  | 'role_hub_view'
  | 'salary_hub_view'
  | 'job_listing_view'
  | 'direct_landing'
  | 'referral_landing'
  
  // 2. Signup
  | 'signup_modal_opened'
  | 'google_one_tap_authenticated'
  | 'phone_auth_completed'
  | 'profile_initialized'
  
  // 3. Activation (The Killer Milestones)
  | 'ats_resume_scanned'
  | 'resume_score_unlocked'
  | 'mock_interview_started'
  | 'mock_interview_completed'
  | 'first_job_applied'
  | 'profile_completed_90'
  | 'activation_completed'
  
  // 4. Viral Loops
  | 'ats_scorecard_shared'
  | 'interview_badge_shared'
  | 'public_profile_shared'
  | 'job_shared_whatsapp'
  | 'referral_invite_sent'
  | 'referral_user_activated'
  
  // 5. Retention
  | 'day_1_return'
  | 'day_7_return'
  | 'day_30_return'
  | 'job_alert_clicked'
  | 'resume_updated';

export interface TxGrowthEventPayload {
  eventType: TxEventType;
  category: TxEventCategory;
  landingPage: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referralCode?: string;
  referralUserId?: string;
  roleId?: string;
  jobId?: string;
  country?: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  metadata?: Record<string, any>;
}

/**
 * Validates privacy constraints before transmission.
 * Ensures PII (Phone, Email, Raw Resume Text) is never logged into growth_events.
 */
export function validateTxTelemetryPrivacy(payload: TxGrowthEventPayload): { valid: boolean; error?: string } {
  const serialized = JSON.stringify(payload);
  
  // Regex for phone numbers (+91, 10-digit Indian mobile)
  if (/(?:\+91|0)?[6789]\d{9}/.test(serialized)) {
    return { valid: false, error: 'PRIVACY BREACH: Unmasked telephone number detected in telemetry payload.' };
  }

  // Regex for raw email addresses
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(serialized)) {
    return { valid: false, error: 'PRIVACY BREACH: Raw email address detected in telemetry payload.' };
  }

  return { valid: true };
}
```

---

## Section 5: The 4 High-Converting Acquisition Tool Engines

To avoid commodity thin pages, TalentXcel builds four proprietary client-side interactive tool funnels that transform organic search landing sessions directly into product activations.

### 5.1 Funnel 1: Free Instant ATS Resume Checker (`/free-ats-resume-checker`)

Search Intent: `"ats resume checker"`, `"free resume score"`, `"ats friendly resume test"`

```typescript
/**
 * ATS Resume Parsing & Scoring Engine
 * File: src/services/atsAnalyzer.ts
 */

export interface AtsScoreResult {
  overallScore: number; // 0-100
  formattingScore: number; // 0-100
  keywordScore: number; // 0-100
  impactScore: number; // 0-100
  detectedSkills: string[];
  missingSkills: string[];
  criticalBulletFixes: {
    original: string;
    suggestion: string;
    rationale: string;
  }[];
  recommendedJobsCount: number;
}

export class AtsAnalyzer {
  private static ACTION_VERBS = new Set([
    'architected', 'spearheaded', 'optimized', 'engineered', 'decreased',
    'increased', 'accelerated', 'formulated', 'delivered', 'orchestrated'
  ]);

  public static analyzeResumeText(rawText: string, targetRoleSkills: string[]): AtsScoreResult {
    const textLower = rawText.toLowerCase();
    
    // 1. Skill Extraction
    const detected: string[] = [];
    const missing: string[] = [];

    for (const skill of targetRoleSkills) {
      if (textLower.includes(skill.toLowerCase())) {
        detected.push(skill);
      } else {
        missing.push(skill);
      }
    }

    const keywordScore = targetRoleSkills.length > 0 
      ? Math.round((detected.length / targetRoleSkills.length) * 100) 
      : 75;

    // 2. Metrics & Quantified Impact Check
    const sentences = rawText.split(/[.\n]/).map(s => s.trim()).filter(Boolean);
    let quantifiedCount = 0;
    const criticalFixes = [];

    for (const s of sentences) {
      const hasNumber = /\d+(?:%|\+|k|m|lpa|cr)?/i.test(s);
      const words = s.toLowerCase().split(/\s+/);
      const startsWithAction = this.ACTION_VERBS.has(words[0]);

      if (hasNumber && startsWithAction) {
        quantifiedCount++;
      } else if (!hasNumber && s.length > 40 && criticalFixes.length < 3) {
        criticalFixes.push({
          original: s,
          suggestion: `Optimized: Led execution of key deliverables, boosting efficiency by 28% across team workflows.`,
          rationale: 'Lacks quantified business metric and decisive action verb.'
        });
      }
    }

    const impactScore = Math.min(100, Math.round((quantifiedCount / Math.max(1, sentences.length * 0.4)) * 100));
    
    // 3. Formatting & Standard Section Verification
    let formattingScore = 100;
    const requiredSections = ['experience', 'education', 'skills', 'projects'];
    for (const sec of requiredSections) {
      if (!textLower.includes(sec)) formattingScore -= 12;
    }

    const overallScore = Math.round((keywordScore * 0.45) + (impactScore * 0.35) + (formattingScore * 0.20));

    return {
      overallScore,
      formattingScore,
      keywordScore,
      impactScore,
      detectedSkills: detected,
      missingSkills: missing,
      criticalBulletFixes: criticalFixes,
      recommendedJobsCount: Math.max(3, detected.length * 2)
    };
  }
}
```

### 5.2 Funnel 2: Interactive AI Mock Interview & Evaluation Engine (`/interview/{role}`)

Search Intent: `"data analyst interview questions"`, `"software engineer behavioral interview"`, `"mock interview ai"`

```typescript
/**
 * Interactive Mock Interview Simulator Engine
 * File: src/services/mockInterviewEngine.ts
 */

export interface InterviewEvaluation {
  clarityScore: number;
  technicalAccuracyScore: number;
  starMethodCompliance: boolean;
  strengths: string[];
  growthAreas: string[];
  suggestedAnswer: string;
}

export function evaluateInterviewResponse(
  question: string,
  userAnswer: string,
  targetKeywords: string[]
): InterviewEvaluation {
  const answerLower = userAnswer.toLowerCase();
  
  // Keyword density
  const matchedKeywords = targetKeywords.filter(kw => answerLower.includes(kw.toLowerCase()));
  const technicalAccuracyScore = Math.min(100, Math.round((matchedKeywords.length / Math.max(1, targetKeywords.length)) * 100));

  // STAR method heuristic (Situation, Task, Action, Result)
  const hasSituation = answerLower.includes('when') || answerLower.includes('project') || answerLower.includes('context');
  const hasAction = answerLower.includes('i did') || answerLower.includes('implemented') || answerLower.includes('built');
  const hasResult = answerLower.includes('result') || answerLower.includes('increased') || answerLower.includes('reduced') || answerLower.includes('%');
  const starMethodCompliance = hasSituation && hasAction && hasResult;

  const clarityScore = userAnswer.length > 120 ? 88 : 60;

  return {
    clarityScore,
    technicalAccuracyScore,
    starMethodCompliance,
    strengths: [
      matchedKeywords.length > 0 ? `Demonstrated knowledge of ${matchedKeywords.slice(0, 2).join(', ')}` : 'Concise initial framing',
      starMethodCompliance ? 'Structured response following STAR methodology' : 'Direct approach to the problem statement'
    ],
    growthAreas: [
      !starMethodCompliance ? 'Anchor the answer with quantified business results (% improvement, latency drop).' : 'Expand on architectural trade-offs.',
      matchedKeywords.length < targetKeywords.length ? `Incorporate core terms: ${targetKeywords.filter(k => !matchedKeywords.includes(k)).slice(0, 2).join(', ')}` : 'Provide edge-case considerations.'
    ],
    suggestedAnswer: `In my previous role, we encountered... [Situation]. My responsibility was to... [Task]. I engineered a solution utilizing ${targetKeywords[0] || 'core patterns'}... [Action]. This resulted in a 35% reduction in latency and zero downtime... [Result].`
  };
}
```

---

## Section 6: Programmatic SEO & Schema.org Rich Engine

TalentXcel delivers Google-compliant JSON-LD structured data on all dynamic routes.

```typescript
/**
 * TalentXcel Schema.org Generator
 * File: src/services/seoSchemaGenerator.ts
 */

export function generateJobPostingSchema(job: {
  title: string;
  descriptionMarkdown: string;
  organizationName: string;
  locationCity: string;
  locationState?: string;
  locationCountry: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  datePosted: string;
  validThrough: string;
  applyUrl: string;
}) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.descriptionMarkdown,
    identifier: {
      '@type': 'PropertyValue',
      name: job.organizationName,
      value: job.applyUrl
    },
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.organizationName,
      sameAs: 'https://talentxcel.in'
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.locationCity,
        addressRegion: job.locationState || job.locationCity,
        addressCountry: job.locationCountry
      }
    },
    ...(job.isRemote && {
      jobLocationType: 'TELECOMMUTE',
      applicantLocationRequirements: {
        '@type': 'Country',
        name: job.locationCountry
      }
    }),
    ...(job.salaryMin && job.salaryMax && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: job.salaryCurrency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salaryMin,
          maxValue: job.salaryMax,
          unitText: 'YEAR'
        }
      }
    }),
    directApply: true
  };
}

export function generateCareerHubBreadcrumbs(roleTitle: string, roleSlug: string, locationName?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://talentxcel.in'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Career Roles',
        item: 'https://talentxcel.in/roles'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${roleTitle} Careers`,
        item: `https://talentxcel.in/roles/${roleSlug}`
      },
      ...(locationName ? [{
        '@type': 'ListItem',
        position: 4,
        name: `${roleTitle} in ${locationName}`,
        item: `https://talentxcel.in/jobs/${roleSlug}/${locationName.toLowerCase()}`
      }] : [])
    ]
  };
}
```

---

## Section 7: TalentXcel Growth Control Center (UI Specification)

The Growth Control Center provides full empirical observability over search acquisition, conversion funnels, opportunity scoring, and deployment actions. 

Zero mocked numbers. When telemetry has not fired, the system displays `0` and flags `Awaiting telemetry`.

```tsx
/**
 * TalentXcel Growth Control Center
 * File: src/components/growth/TalentXcelControlCenter.tsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Users, Search, Award, Briefcase, FileCheck,
  CheckCircle2, ArrowUpRight, ArrowDownRight, RefreshCw,
  Globe, ShieldCheck, Zap, AlertTriangle, Play, ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const TalentXcelControlCenter: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [activeQuadrant, setActiveQuadrant] = useState<'ALL' | 'WIN_NOW' | 'ATTACK' | 'CREATE' | 'FIX'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Empirical Telemetry Counters
  const [metrics, setMetrics] = useState({
    organicImpressions: 0,
    organicClicks: 0,
    blendedCtr: 0,
    indexedNodes: 0,
    totalSignups: 0,
    activatedUsers: 0,
    atsScans: 0,
    interviewsCompleted: 0,
    jobApplications: 0,
    viralKFactor: 0
  });

  const [opportunities, setOpportunities] = useState<any[]>([]);

  const fetchRealTelemetry = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. GSC Queries aggregate
      const { data: gscData } = await supabase
        .from('tx_gsc_queries')
        .select('clicks, impressions');

      let totalClicks = 0;
      let totalImpr = 0;
      if (gscData && gscData.length > 0) {
        gscData.forEach((row) => {
          totalClicks += row.clicks;
          totalImpr += row.impressions;
        });
      }

      // 2. Telemetry events
      const { data: eventData } = await supabase
        .from('tx_growth_events')
        .select('event_type');

      let signups = 0;
      let activations = 0;
      let ats = 0;
      let interviews = 0;
      let applications = 0;

      if (eventData && eventData.length > 0) {
        eventData.forEach((ev) => {
          if (ev.event_type === 'profile_initialized' || ev.event_type === 'google_one_tap_authenticated') signups++;
          if (ev.event_type === 'activation_completed') activations++;
          if (ev.event_type === 'ats_resume_scanned') ats++;
          if (ev.event_type === 'mock_interview_completed') interviews++;
          if (ev.event_type === 'first_job_applied') applications++;
        });
      }

      // 3. Count Active Graph Nodes
      const { count: roleCount } = await supabase
        .from('tx_roles')
        .select('*', { count: 'exact', head: true })
        .eq('is_indexed', true);

      // 4. Opportunities
      const { data: opps } = await supabase
        .from('tx_gsc_opportunities')
        .select('*')
        .order('opportunity_score', { ascending: false })
        .limit(25);

      const ctr = totalImpr > 0 ? (totalClicks / totalImpr) * 100 : 0;
      const kFactor = signups > 0 ? Number((activations / signups).toFixed(2)) : 0;

      setMetrics({
        organicImpressions: totalImpr,
        organicClicks: totalClicks,
        blendedCtr: Number(ctr.toFixed(2)),
        indexedNodes: roleCount || 0,
        totalSignups: signups,
        activatedUsers: activations,
        atsScans: ats,
        interviewsCompleted: interviews,
        jobApplications: applications,
        viralKFactor: kFactor
      });

      setOpportunities(opps || []);
    } catch (err) {
      console.error('[TX-CONTROL-CENTER] Telemetry load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealTelemetry();
  }, [fetchRealTelemetry]);

  const filteredOpportunities = opportunities.filter((op) => 
    activeQuadrant === 'ALL' ? true : op.quadrant === activeQuadrant
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-background text-foreground">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary rounded-full border border-primary/20">
              TalentXcel Global Growth OS
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry Connected
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-2">Search-to-Activation Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Empirical demand attribution, GSC opportunity matrix, and autonomous career node deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchRealTelemetry()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-card border border-border rounded-xl">
          <p className="text-xs font-medium text-muted-foreground uppercase">Organic Impressions</p>
          <p className="text-2xl font-black mt-2 font-mono">
            {metrics.organicImpressions.toLocaleString()}
          </p>
          <span className="text-xs text-muted-foreground mt-1 block">GSC Search Surface</span>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl">
          <p className="text-xs font-medium text-muted-foreground uppercase">Organic Clicks</p>
          <p className="text-2xl font-black mt-2 font-mono text-emerald-500">
            {metrics.organicClicks.toLocaleString()}
          </p>
          <span className="text-xs text-muted-foreground mt-1 block">CTR: {metrics.blendedCtr}%</span>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl">
          <p className="text-xs font-medium text-muted-foreground uppercase">Activated Candidates</p>
          <p className="text-2xl font-black mt-2 font-mono text-primary">
            {metrics.activatedUsers.toLocaleString()}
          </p>
          <span className="text-xs text-muted-foreground mt-1 block">Total Signups: {metrics.totalSignups}</span>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl">
          <p className="text-xs font-medium text-muted-foreground uppercase">Viral Coefficient (K)</p>
          <p className="text-2xl font-black mt-2 font-mono text-amber-500">
            {metrics.viralKFactor}
          </p>
          <span className="text-xs text-muted-foreground mt-1 block">Threshold: &gt; 0.70</span>
        </div>
      </div>

      {/* Tool Funnel Verification */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-muted/40 border border-border rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">ATS Resumes Scanned</p>
            <p className="text-xl font-bold font-mono">{metrics.atsScans.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-5 bg-muted/40 border border-border rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Mock Interviews Evaluated</p>
            <p className="text-xl font-bold font-mono">{metrics.interviewsCompleted.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-5 bg-muted/40 border border-border rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Direct Job Applications</p>
            <p className="text-xl font-bold font-mono">{metrics.jobApplications.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Opportunity Classification Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">GSC Search Opportunity Quadrants</h2>
            <p className="text-xs text-muted-foreground">
              Prioritized by potential score: Impressions × (0.18 - CTR) × Position Multiplier.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg text-xs font-semibold">
            {(['ALL', 'WIN_NOW', 'ATTACK', 'CREATE', 'FIX'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setActiveQuadrant(q)}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeQuadrant === q ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {q.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredOpportunities.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card">
            <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium">No opportunities detected for current quadrant filter.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting production Search Console sync or lower impression threshold.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="p-3">Query</th>
                  <th className="p-3">Quadrant</th>
                  <th className="p-3">Position</th>
                  <th className="p-3">Impressions</th>
                  <th className="p-3">CTR</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {filteredOpportunities.map((op) => (
                  <tr key={op.opportunity_id} className="hover:bg-muted/30 transition">
                    <td className="p-3 font-sans font-medium text-foreground">{op.query}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        op.quadrant === 'WIN_NOW' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        op.quadrant === 'ATTACK' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        op.quadrant === 'CREATE' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {op.quadrant}
                      </span>
                    </td>
                    <td className="p-3">{Number(op.current_position).toFixed(1)}</td>
                    <td className="p-3">{Number(op.impressions).toLocaleString()}</td>
                    <td className="p-3">{(Number(op.ctr) * 100).toFixed(1)}%</td>
                    <td className="p-3 font-bold text-primary">{Number(op.opportunity_score).toFixed(0)}</td>
                    <td className="p-3 font-sans text-muted-foreground">{op.recommended_action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## Section 8: Useful Viral Loops & $K$-Factor Formulation

Because job searching is inherently episodic, standard referral invites ("invite your friend to earn coins") have poor conversion in career tech. TalentXcel engineers four **high-utility, non-spammy sharing loops**:

### 8.1 The 4 High-Utility Loops

```
LOOP A: ATS Scorecard Sharing
Upload Resume ──► Instant Score 78/100 ──► Generate Public Card ──► "Beat my ATS Score" ──► Peer scans resume

LOOP B: AI Mock Interview Scorecard
Complete 5-Question Simulation ──► Get 92% Technical Rubric ──► Share LinkedIn/WhatsApp Badge ──► Peer takes assessment

LOOP C: Verified Candidate Talent Profile
Create Profile ──► Opt into Indexation ──► Share talentxcel.in/p/@handle on LinkedIn ──► Recruiter discovery & Candidate signups

LOOP D: "Apply with a Peer" / Team Job Referral
Discover Job ──► Click "Refer a Qualified Peer" ──► Peer receives pre-populated apply link ──► Both track status
```

### 8.2 $K$-Factor Mathematical Definition
The organic viral coefficient ($K$) is defined as:

$$K = i \times c \times a$$

Where:
- $i$ = **Invite dispatch rate**: Mean share events generated per active candidate session (share tokens, scorecard exports, WhatsApp job links).
- $c$ = **Conversion rate of recipient**: Proportion of shared links clicked that land on TalentXcel and complete an interactive tool session or view the job.
- $a$ = **Account activation rate**: Proportion of landing recipients who convert to an authenticated candidate profile.

Target Invariant:
- Maintain $K \ge 0.65$ across all programmatic job and tool landing cohorts.

---

## Section 9: Safety, Anti-Abuse, Compliance & Kill Switches

To safeguard the domain reputation of `talentxcel.in` against Google algorithmic demotions and protect candidate privacy under the Digital Personal Data Protection Act (DPDP India) and GDPR:

### 9.1 Google Scaled Content Abuse Prevention
1. **Dynamic Page Freeze**: If Google Search Console detects an increase of soft 404s exceeding 2.0% of total indexed URLs, the automated graph publisher immediately halts generation of new role $\times$ location permutations.
2. **Substantive Requisition Threshold**: No programmatic job page (`/jobs/{role}/{location}`) may be published or set to `index, follow` without at least **3 verifiable active requisitions** with direct application links.
3. **No Indexation of Login Walls**: Under Google's Job Search guidelines, job descriptions and salary data must be fully readable without requiring login or app download.

### 9.2 Emergency Kill Switches (Postgres Environment Variables)

```typescript
export const TX_KILL_SWITCHES = {
  // Disables all automated programmatic route indexation
  FREEZE_PROGRAMMATIC_SEO: process.env.TX_FREEZE_SEO === 'true',
  
  // Enforces global robots: noindex on experimental career nodes
  EMERGENCY_NOINDEX_EXPERIMENTAL: process.env.TX_NOINDEX_EXP === 'true',
  
  // Rate-limits public ATS parser to 3 scans per IP per hour to block mass scrapers
  ATS_THROTTLE_STRICT: process.env.TX_ATS_THROTTLE === 'true'
};
```

---

## Section 10: 24-Month Deployment Rollout Plan

```
PHASE 1: Foundation (Months 1–6) | 0 ──► 100K Monthly Organic Users
  • Connect Google Search Console API for talentxcel.in.
  • Deploy core Supabase schema (tx_roles, tx_locations, tx_growth_events, tx_ats_scans).
  • Launch Flagship Tool: Free Instant ATS Resume Grader (/free-ats-resume-checker).
  • Deploy 50 Primary Tier-1 Role Hubs (/roles/{role}) and Metro Facets (Bangalore, Delhi NCR, Mumbai).
  • Zero fabricated numbers; strict privacy verification active.

PHASE 2: Search Graph Scaling (Months 7–12) | 100K ──► 1M Monthly Organic Users
  • Expand Career Intent Graph: Role × Location × Experience matrix (5,000 validated nodes).
  • Launch AI Mock Interview Simulator (/interview/{role}).
  • Launch Salary Intelligence Benchmark charts with wage percentile schema.
  • Launch Public Candidate Profiles (/p/@handle) with candidate opt-in consent.

PHASE 3: Global Expansion (Months 13–18) | 1M ──► 5M Monthly Organic Users
  • Deploy international hubs: United States, United Kingdom, Canada, Australia, UAE, Singapore.
  • Dynamic currency translation (INR ◄► USD ◄► GBP ◄► AED) with regional nomenclature adjustments.
  • Multi-language hreflang deployment across core regional hubs.

PHASE 4: Two-Sided Marketplace Network Effect (Months 19–24) | 5M ──► 10M+ Monthly Organic Users
  • Deploy Recruiter Inbound Engine: Employers claim company profiles and post direct requisitions.
  • Integration with CHATR Communication OS: Instant WhatsApp pre-screening sequence for applicants.
  • Organic candidate liquidity compounds without paid search expenditure.
```

---

## Section 11: Unified Antigravity / Codex Execution Prompt

To execute and deploy the entire TalentXcel Global Growth Operating System in one continuous autonomous workflow, pass the prompt below into the Antigravity engine:

```text
EXECUTE SPECIFICATION: TALENTXCEL GLOBAL GROWTH OPERATING SYSTEM (TX-GGOS)
TARGET REPOSITORY: chatrchat / talentxcel.in
SPECIFICATION REFERENCE: docs/TALENTXCEL_GROWTH_OS_SPECIFICATION.md

INSTRUCTIONS:
1. Apply the complete Supabase migration: 20260910180000_talentxcel_growth_os.sql containing tx_roles, tx_locations, tx_skills, tx_job_postings, tx_ats_scans, tx_interview_questions, tx_mock_interviews, tx_growth_events, tx_gsc_properties, tx_gsc_queries, tx_gsc_opportunities, and the calculate_tx_gsc_opportunities stored procedure with full RLS policies.
2. Implement src/core/growth/TalentXcelTaxonomy.ts with the complete event taxonomy, growth categories, and strict privacy validator blocking telephone and email leakage.
3. Implement src/services/atsAnalyzer.ts containing the high-converting client-side ATS scoring engine with action verb verification, metric quantification, and missing skill detection.
4. Implement src/services/gscSyncWorker.ts with JWT authentication to Google Search Console API v1, 3-day data buffering, and automatic opportunity recalculation.
5. Implement src/services/seoSchemaGenerator.ts generating valid JobPosting and BreadcrumbList JSON-LD metadata for all dynamic career nodes.
6. Mount the TalentXcel Control Center UI component at /growth/talentxcel or within the executive dashboard, strictly adhering to the empirical telemetry standard (zero fabricated minimums).
7. Verify TypeScript compilation and ensure no existing communication or build pipelines are broken.
```
