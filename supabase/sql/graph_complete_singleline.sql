CREATE TABLE IF NOT EXISTS public.sys_knowledge_nodes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES public.sys_organizations(id) ON DELETE CASCADE, node_type text NOT NULL, entity_id uuid, label text NOT NULL, properties jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), UNIQUE(org_id, node_type, entity_id));
ALTER TABLE public.sys_knowledge_nodes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sys_nodes_org ON public.sys_knowledge_nodes(org_id);
ALTER TABLE public.sys_knowledge_nodes REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS public.sys_knowledge_edges (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES public.sys_organizations(id) ON DELETE CASCADE, source_node_id uuid NOT NULL REFERENCES public.sys_knowledge_nodes(id) ON DELETE CASCADE, target_node_id uuid NOT NULL REFERENCES public.sys_knowledge_nodes(id) ON DELETE CASCADE, edge_type text NOT NULL, properties jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now(), UNIQUE(source_node_id, target_node_id, edge_type));
ALTER TABLE public.sys_knowledge_edges ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sys_edges_org ON public.sys_knowledge_edges(org_id);
CREATE INDEX IF NOT EXISTS idx_sys_edges_source ON public.sys_knowledge_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_sys_edges_target ON public.sys_knowledge_edges(target_node_id);
ALTER TABLE public.sys_knowledge_edges REPLICA IDENTITY FULL;

DROP POLICY IF EXISTS "nodes_org_all" ON public.sys_knowledge_nodes;
CREATE POLICY "nodes_org_all" ON public.sys_knowledge_nodes FOR ALL USING (org_id IN (SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "edges_org_all" ON public.sys_knowledge_edges;
CREATE POLICY "edges_org_all" ON public.sys_knowledge_edges FOR ALL USING (org_id IN (SELECT org_id FROM public.sys_org_members WHERE user_id = auth.uid()));
