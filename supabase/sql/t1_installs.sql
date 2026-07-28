CREATE TABLE IF NOT EXISTS public.user_capability_installs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability_id   text NOT NULL,
  capability_name text NOT NULL,
  capability_type text NOT NULL DEFAULT 'agent',
  workspace_path  text NOT NULL,
  icon_name       text,
  color           text,
  structure       jsonb DEFAULT '[]'::jsonb,
  status          text NOT NULL DEFAULT 'installed',
  config          jsonb DEFAULT '{}'::jsonb,
  version         text NOT NULL DEFAULT '1.0.0',
  installed_at    timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, capability_id)
);
ALTER TABLE public.user_capability_installs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "uci_user_all" ON public.user_capability_installs;
CREATE POLICY "uci_user_all" ON public.user_capability_installs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_uci_user ON public.user_capability_installs(user_id, status);
ALTER TABLE public.user_capability_installs REPLICA IDENTITY FULL;
