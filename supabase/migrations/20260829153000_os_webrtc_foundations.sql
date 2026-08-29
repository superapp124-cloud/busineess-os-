-- ============================================================
-- CHATR OS & WEBRTC SIGNALING FOUNDATION TABLES
-- ============================================================

-- 1. WebRTC Signaling table
CREATE TABLE IF NOT EXISTS public.webrtc_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id TEXT,
  from_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  signal_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webrtc_signals_to_user ON public.webrtc_signals(to_user, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webrtc_signals_call_id ON public.webrtc_signals(call_id);

ALTER TABLE public.webrtc_signals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'webrtc_signals' AND policyname = 'webrtc_signals_insert') THEN
    CREATE POLICY "webrtc_signals_insert" ON public.webrtc_signals FOR INSERT WITH CHECK (auth.uid() = from_user);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'webrtc_signals' AND policyname = 'webrtc_signals_select') THEN
    CREATE POLICY "webrtc_signals_select" ON public.webrtc_signals FOR SELECT USING (auth.uid() = to_user OR auth.uid() = from_user);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'webrtc_signals' AND policyname = 'webrtc_signals_delete') THEN
    CREATE POLICY "webrtc_signals_delete" ON public.webrtc_signals FOR DELETE USING (auth.uid() = to_user OR auth.uid() = from_user);
  END IF;
END $$;

-- 2. OS Events Telemetry Table
CREATE TABLE IF NOT EXISTS public.os_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.os_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'os_events' AND policyname = 'os_events_insert') THEN
    CREATE POLICY "os_events_insert" ON public.os_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'os_events' AND policyname = 'os_events_select') THEN
    CREATE POLICY "os_events_select" ON public.os_events FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Inter-App Messages
CREATE TABLE IF NOT EXISTS public.inter_app_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_app TEXT,
  target_app TEXT,
  action TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.inter_app_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inter_app_messages' AND policyname = 'inter_app_messages_all') THEN
    CREATE POLICY "inter_app_messages_all" ON public.inter_app_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 4. App Permissions
CREATE TABLE IF NOT EXISTS public.app_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  permission TEXT NOT NULL,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_permissions' AND policyname = 'app_permissions_all') THEN
    CREATE POLICY "app_permissions_all" ON public.app_permissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 5. User Roles Compatibility
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'user_roles_select') THEN
    CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
