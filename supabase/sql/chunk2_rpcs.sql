-- ============================================================
-- CHUNK 2 of 3: install_capability + uninstall_capability RPCs
-- Paste this AFTER Chunk 1 succeeds, then click Run
-- ============================================================

CREATE OR REPLACE FUNCTION public.install_capability(
  p_capability_id   text,
  p_capability_name text,
  p_capability_type text,
  p_workspace_path  text,
  p_icon_name       text DEFAULT 'Bot',
  p_color           text DEFAULT 'indigo',
  p_structure       jsonb DEFAULT '[]'::jsonb,
  p_config          jsonb DEFAULT '{}'::jsonb,
  p_version         text DEFAULT '1.0.0'
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    uuid := auth.uid();
  v_install_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.user_capability_installs (
    user_id, capability_id, capability_name, capability_type,
    workspace_path, icon_name, color, structure, config, version, status
  )
  VALUES (
    v_user_id, p_capability_id, p_capability_name, p_capability_type,
    p_workspace_path, p_icon_name, p_color, p_structure, p_config, p_version, 'installed'
  )
  ON CONFLICT (user_id, capability_id)
  DO UPDATE SET
    status          = 'installed',
    capability_name = EXCLUDED.capability_name,
    workspace_path  = EXCLUDED.workspace_path,
    config          = EXCLUDED.config,
    version         = EXCLUDED.version,
    updated_at      = now()
  RETURNING id INTO v_install_id;

  INSERT INTO public.os_events (event_type, level, source_subsystem, payload)
  VALUES (
    'capability.installed', 'info', 'intent-store',
    jsonb_build_object(
      'install_id',      v_install_id,
      'capability_id',   p_capability_id,
      'capability_name', p_capability_name,
      'user_id',         v_user_id,
      'workspace_path',  p_workspace_path
    )
  );

  RETURN jsonb_build_object(
    'install_id',    v_install_id,
    'status',        'installed',
    'capability_id', p_capability_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.install_capability TO authenticated;

-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.uninstall_capability(
  p_capability_id text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  UPDATE public.user_capability_installs
  SET status = 'uninstalled', updated_at = now()
  WHERE user_id = v_user_id AND capability_id = p_capability_id;

  INSERT INTO public.os_events (event_type, level, source_subsystem, payload)
  VALUES (
    'capability.uninstalled', 'info', 'intent-store',
    jsonb_build_object('capability_id', p_capability_id, 'user_id', v_user_id)
  );

  RETURN jsonb_build_object('status', 'uninstalled');
END;
$$;

GRANT EXECUTE ON FUNCTION public.uninstall_capability TO authenticated;
