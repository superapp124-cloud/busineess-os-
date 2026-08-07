import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { WorkspaceConnectorScreen } from '@/components/onboarding/WorkspaceConnectorScreen';

const ConnectWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth', { replace: true }); return; }

      // If connector screen already seen, skip straight to desktop
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('workspace_connector_seen')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.workspace_connector_seen) {
        navigate('/desktop/home', { replace: true });
        return;
      }

      setUserId(user.id);
    };
    init();
  }, [navigate]);

  if (!userId) return null;

  return (
    <WorkspaceConnectorScreen
      userId={userId}
      onComplete={() => navigate('/desktop/home', { replace: true })}
    />
  );
};

export default ConnectWorkspacePage;
