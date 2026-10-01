-- CHUNK 2: RLS + trigger for health_os_state
ALTER TABLE public.health_os_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their health OS state"
  ON public.health_os_state
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_health_os_state_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER health_os_state_updated_at
  BEFORE UPDATE ON public.health_os_state
  FOR EACH ROW
  EXECUTE FUNCTION public.set_health_os_state_updated_at()
