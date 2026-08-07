import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth', { replace: true }); return; }

      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      setUserName(data?.full_name || '');
    };
    loadName();
  }, [navigate]);

  return (
    <WelcomeScreen
      userName={userName}
      onContinue={() => navigate('/onboarding/connect-workspace', { replace: true })}
      onSkip={() => navigate('/desktop/home', { replace: true })}
    />
  );
};

export default WelcomePage;
