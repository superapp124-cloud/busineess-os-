-- ====================================================================
-- CHATR Intent OS 1.0 — OpenRouter & AI Execution Engine Schema
-- Execute this SQL script in your Supabase SQL Editor to set up & verify
-- ====================================================================

-- 1. Create User BYOK API Keys Table
CREATE TABLE IF NOT EXISTS public.user_ai_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'openrouter',
    encrypted_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, provider)
);

-- Enable RLS on user_ai_keys
ALTER TABLE public.user_ai_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own AI keys"
    ON public.user_ai_keys
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Create Workspace AI Keys Table (Enterprise)
CREATE TABLE IF NOT EXISTS public.workspace_ai_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    provider TEXT NOT NULL DEFAULT 'openrouter',
    encrypted_key TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    priority INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(workspace_id, provider)
);

-- Enable RLS on workspace_ai_keys
ALTER TABLE public.workspace_ai_keys ENABLE ROW LEVEL SECURITY;

-- 3. Create Dynamic AI Models Registry Table
CREATE TABLE IF NOT EXISTS public.ai_models (
    id TEXT PRIMARY KEY, -- e.g. 'google/gemini-2.5-flash'
    provider TEXT NOT NULL DEFAULT 'openrouter',
    model_name TEXT NOT NULL,
    supports_chat BOOLEAN DEFAULT true,
    supports_vision BOOLEAN DEFAULT false,
    supports_tools BOOLEAN DEFAULT true,
    supports_streaming BOOLEAN DEFAULT true,
    cost_rank INT DEFAULT 1, -- 1 = cheapest
    latency_rank INT DEFAULT 1, -- 1 = fastest
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Default OpenRouter Models into Model Registry
INSERT INTO public.ai_models (id, provider, model_name, supports_chat, supports_vision, supports_tools, cost_rank, latency_rank, enabled)
VALUES 
    ('google/gemini-2.5-flash', 'openrouter', 'Gemini 2.5 Flash', true, true, true, 1, 1, true),
    ('deepseek/deepseek-r1', 'openrouter', 'DeepSeek R1', true, false, false, 2, 2, true),
    ('qwen/qwen-2.5-coder-32b', 'openrouter', 'Qwen 2.5 Coder', true, false, true, 2, 1, true),
    ('anthropic/claude-3.5-sonnet', 'openrouter', 'Claude 3.5 Sonnet', true, true, true, 4, 3, true)
ON CONFLICT (id) DO UPDATE 
SET enabled = EXCLUDED.enabled, updated_at = now() IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'updated_at');

-- 4. Create AI Telemetry Execution Log Table
CREATE TABLE IF NOT EXISTS public.ai_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id TEXT NOT NULL,
    trace_id TEXT,
    tenant_id TEXT,
    user_id UUID,
    capability_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    model TEXT NOT NULL,
    duration_ms INT NOT NULL,
    estimated_cost NUMERIC(10, 6) DEFAULT 0,
    status TEXT NOT NULL, -- 'completed', 'failed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on telemetry log
ALTER TABLE public.ai_execution_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI execution logs"
    ON public.ai_execution_log
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- ====================================================================
-- VERIFICATION SQL QUERIES (Run these to test & inspect setup)
-- ====================================================================

-- Query A: Check active AI models in registry
SELECT id, provider, model_name, supports_vision, supports_tools, enabled 
FROM public.ai_models 
WHERE enabled = true 
ORDER BY latency_rank ASC;

-- Query B: Inspect recent AI execution telemetry logs
SELECT execution_id, capability_id, provider_id, model, duration_ms, estimated_cost, status, created_at 
FROM public.ai_execution_log 
ORDER BY created_at DESC 
LIMIT 10;

-- Query C: Verify RLS policies on tables
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('user_ai_keys', 'workspace_ai_keys', 'ai_execution_log');
