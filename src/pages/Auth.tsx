import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FirebasePhoneAuth } from '@/components/FirebasePhoneAuth';
import { OnboardingDialog } from '@/components/OnboardingDialog';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Footer } from '@/components/Footer';
import chatrBrandLogo from '@/assets/chatr-brand-logo.png';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { logAuthEvent, logAuthError } from '@/utils/authDebug';
import { BiometricLogin } from '@/components/BiometricLogin';
import { AuthLoadingSkeleton } from '@/components/ui/PremiumEmptyStates';
import { motion } from 'framer-motion';

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
        const redirectPath = stateFrom || storedRedirect || '/';
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
        const redirectPath = stateFrom || storedRedirect || '/';
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
    <div className="h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden bg-[#040510] text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Background - Subtle OS Boot Vibe */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0c0e1f] via-[#040510] to-[#040510] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Spacer to push content down slightly */}
      <div className="flex-1 w-full flex flex-col items-center justify-center gap-10 z-10">
        
        {/* Header Branding */}
        <motion.div 
          className="text-center space-y-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex justify-center mb-1">
            <img 
              src={chatrBrandLogo} 
              alt="Chatr" 
              className="h-10 sm:h-12 w-auto filter brightness-0 invert opacity-[0.85]"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white/90">
            Chatr <span className="font-light text-white/70">Intent</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-400/80 font-medium tracking-[0.2em] uppercase">
            Intent Operating System
          </p>
        </motion.div>

        {/* Center Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="w-full max-w-[380px]"
        >
          <div className="relative group">
            {/* Extremely subtle glow edge */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 via-transparent to-transparent rounded-3xl opacity-50 pointer-events-none" />
            
            {/* Glass Card */}
            <div className="relative bg-[#090A15]/80 border border-white/5 shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-2xl flex flex-col items-center">
              
              {/* Minimal Brain Icon */}
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-xl mb-6 shadow-inner">
                🧠
              </div>

              {/* Auth Component */}
              <div className="w-full">
                <FirebasePhoneAuth onSuccess={() => { window.location.href = '/'; }} />
                <BiometricLogin />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Footer Section */}
      <motion.div 
        className="w-full max-w-5xl z-10 pb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
      >
        {/* Compact Badges */}
        <div className="w-full flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
          {[
            { icon: "🔒", title: "Encrypted by Default" },
            { icon: "⚡", title: "Blazing Fast" },
            { icon: "🧠", title: "AI Native" },
            { icon: "🌍", title: "Universal Search" },
            { icon: "🛡️", title: "Private by Design" },
            { icon: "🎯", title: "Intent OS" },
          ].map((badge) => (
            <div key={badge.title} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-slate-300 text-[10px] sm:text-xs tracking-wide">
              <span>{badge.icon}</span>
              <span>{badge.title}</span>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent mb-4" />

        <Footer />
      </motion.div>

      {/* Onboarding Dialog */}
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
    </div>
  );
};

export default Auth;
