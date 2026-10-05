import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OnboardingDialog } from '@/components/OnboardingDialog';
import { useOnboarding } from '@/hooks/useOnboarding';
import { logAuthEvent } from '@/utils/authDebug';
import { AuthLoadingSkeleton } from '@/components/ui/PremiumEmptyStates';
import { ChatrLandingPage } from './landing/ChatrLandingPage';
import { FirebasePhoneAuth } from '@/components/FirebasePhoneAuth';
import { BiometricLogin } from '@/components/BiometricLogin';
import chatrIconLogo from '@/assets/chatr-icon-logo.png';
import chatrOfficialLogo from '@/assets/chatr-official-logo.png';
import { Capacitor } from '@capacitor/core';
import { usePlatform } from '@/App';
import { trackAcquisitionEvent } from '@/services/acquisitionTelemetry';

const Auth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const platform = usePlatform();
  const isNative = platform === 'mobile' || Capacitor.isNativePlatform();

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
          // Clear only obsolete project tokens from old backend migrations
          try {
            localStorage.removeItem('sb-sbayuqgomlflmxgicplz-auth-token');
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
        const defaultTarget = (isNative || platform === 'mobile') ? '/calls' : '/desktop/home';
        const redirectPath = stateFrom || storedRedirect || defaultTarget;
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
        if (event === 'SIGNED_IN') {
          trackAcquisitionEvent({ event: 'signup_completed', metadata: { authEvent: event } });
        }
        const stateFrom = (location.state as any)?.from?.pathname ||
          (typeof (location.state as any)?.from === 'string' ? (location.state as any)?.from : null);
        const storedRedirect = sessionStorage.getItem('auth_redirect');
        const defaultTarget = isNative ? '/calls' : '/desktop/home';
        const redirectPath = stateFrom || storedRedirect || defaultTarget;
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
  }, [isNative, navigate, location]);

  if (loading) {
    return <AuthLoadingSkeleton />;
  }

  // ── 1. NATIVE MOBILE APP LOGIN SCREEN (MATCHING IMAGE TWO EXACTLY) ──
  // Pixel-perfect light aesthetic matching Image Two reference
  if (isNative || platform === 'mobile') {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F8FAFC] relative overflow-hidden font-sans">
        {/* Dreamy pastel radial gradients matching Image Two */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 15% 15%, rgba(218, 224, 255, 0.75) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(210, 240, 255, 0.65) 0%, transparent 45%), radial-gradient(circle at 80% 85%, rgba(200, 245, 245, 0.55) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(235, 220, 255, 0.65) 0%, transparent 45%), #F8FAFC'
          }}
        />
        {/* Soft decorative pastel floating circles */}
        <div className="absolute top-[7%] left-[33%] w-4 h-4 rounded-full bg-purple-300/40 blur-[1px] pointer-events-none" />
        <div className="absolute bottom-[9%] left-[28%] w-3 h-3 rounded-full bg-purple-400/40 blur-[1px] pointer-events-none" />
        <div className="absolute top-[-5%] right-[-5%] w-[320px] h-[320px] bg-cyan-200/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[320px] h-[320px] bg-purple-200/30 rounded-full blur-[80px] pointer-events-none" />

        {/* Elevated Floating White Card */}
        <div className="w-full max-w-[390px] bg-white rounded-[38px] shadow-[0_20px_60px_-15px_rgba(99,102,241,0.10),_0_1px_3px_rgba(0,0,0,0.03)] border border-white/80 p-7 pt-9 pb-8 relative z-10">
          {/* Logo: chatr with cyan speech bubble */}
          <div className="flex justify-center mb-5">
            <img 
              src={chatrOfficialLogo} 
              alt="Chatr" 
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Welcome Header */}
          <div className="text-center mb-6">
            <h1 className="text-[32px] font-extrabold text-[#111827] tracking-tight mb-1.5 leading-tight">
              Welcome
            </h1>
            <p className="text-[14px] text-[#6B7280] leading-normal">
              Enter your phone number to continue
            </p>
          </div>

          {/* Form */}
          <FirebasePhoneAuth variant="light" hideHeader={true} />

          
        </div>

        {/* Onboarding Dialog for new profiles */}
        {userId && (
          <OnboardingDialog
            isOpen={onboarding.isOpen}
            userId={userId}
            onComplete={async () => {
              await onboarding.completeOnboarding();
              navigate('/calls', { replace: true });
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
      </div>
    );
  }

  // ── 2. WEB APP / DESKTOP (chatrchat.in / chatr.chat) ──
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
