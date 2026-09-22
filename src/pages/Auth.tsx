import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OnboardingDialog } from '@/components/OnboardingDialog';
import { useOnboarding } from '@/hooks/useOnboarding';
import { logAuthEvent } from '@/utils/authDebug';
import { AuthLoadingSkeleton } from '@/components/ui/PremiumEmptyStates';
import { ChatrLandingPage } from './landing/ChatrLandingPage';

const Auth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState<string | undefined>();
  const onboarding = useOnboarding(userId);
  // Run once only — prevent re-triggering
  const hasChecked = React.useRef(false);

  React.useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkSession = async () => {
      try {
        // Validate session with Supabase — this is the single source of truth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // No valid session — clear any stale tokens from old backend that could cause loops
          try {
            localStorage.removeItem('sb-nuuuqazaoaozgblmvkzn-auth-token');
            localStorage.removeItem('sb-sbayuqgomlflmxgicplz-auth-token');
            localStorage.removeItem('sb-auth-token');
            localStorage.removeItem('sb-cenxckpxaqborfqyexot-auth-token');
          } catch {}
          setLoading(false);
          return;
        }

        // Valid Supabase session confirmed
        setUserId(session.user.id);
        const stateFrom = (location.state as any)?.from?.pathname ||
          (typeof (location.state as any)?.from === 'string' ? (location.state as any)?.from : null);
        const storedRedirect = sessionStorage.getItem('auth_redirect');
        const redirectPath = stateFrom || storedRedirect || '/desktop/home';
        if (storedRedirect) sessionStorage.removeItem('auth_redirect');
        logAuthEvent('Active session confirmed, entering app');
        navigate(redirectPath, { replace: true });
      } catch (error) {
        console.error('Session check error:', error);
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        setUserId(session.user.id);
        const stateFrom = (location.state as any)?.from?.pathname ||
          (typeof (location.state as any)?.from === 'string' ? (location.state as any)?.from : null);
        const storedRedirect = sessionStorage.getItem('auth_redirect');
        const redirectPath = stateFrom || storedRedirect || '/desktop/home';
        if (storedRedirect) sessionStorage.removeItem('auth_redirect');
        navigate(redirectPath, { replace: true });
      }
      if (event === 'SIGNED_OUT') {
        setUserId(undefined);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <AuthLoadingSkeleton />;
  }

  return (
    <>
      {/* Premium Executive SaaS Landing Page with Auth Modal automatically open */}
      <ChatrLandingPage initialAuthOpen={true} />

      {/* Onboarding Dialog for new profiles */}
      {userId && (
        <OnboardingDialog
          isOpen={onboarding.isOpen}
          userId={userId}
          onComplete={async () => {
            await onboarding.completeOnboarding();
            // New user first-run: Welcome → Workspace Connector → Desktop
            navigate('/onboarding/welcome', { replace: true });
          }}
          onSkip={async () => {
            toast({
              title: "Complete Your Profile",
              description: "Please provide your name to continue",
              variant: "destructive",
            });
          }}
        />
      )}
    </>
  );
};

export default Auth;
