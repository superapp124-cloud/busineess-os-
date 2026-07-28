import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FirebasePhoneAuth } from '@/components/FirebasePhoneAuth';
import { OnboardingDialog } from '@/components/OnboardingDialog';
import { useOnboarding } from '@/hooks/useOnboarding';
import chatrBrandLogo from '@/assets/chatr-brand-logo.png';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { logAuthEvent, logAuthError } from '@/utils/authDebug';
import { BiometricLogin } from '@/components/BiometricLogin';
import { AuthLoadingSkeleton } from '@/components/ui/PremiumEmptyStates';
import { motion } from 'framer-motion';

const Auth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState<string | undefined>();
  const onboarding = useOnboarding(userId);

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        logAuthEvent('Auth page: Checking session');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logAuthError('Session check', sessionError);
          setLoading(false);
          return;
        }

        if (session) {
          logAuthEvent('Active session found', {
            userId: session.user.id,
            email: session.user.email,
            provider: session.user.app_metadata?.provider,
          });
          
          setUserId(session.user.id);
          
          const { data: profile, error: profileError } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('[AUTH] Profile fetch error:', profileError);
          }

          if (profile) {
            const { data: roles } = await (supabase as any)
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id);
            
            const isAdmin = roles?.some((r: any) => r.role === "admin");
            
            if (profile.onboarding_completed) {
              const redirectPath = sessionStorage.getItem('auth_redirect');
              sessionStorage.removeItem('auth_redirect');
              
              console.log('[AUTH] User signed in:', profile.username || profile.email);
              
              if (isAdmin) {
                navigate('/admin', { replace: true });
              } else {
                navigate(redirectPath || '/', { replace: true });
              }
              return;
            }
          }
          
          setLoading(false);
          return;
        }

        // Skip device session re-hydration if user explicitly logged out
        const explicitSignout = sessionStorage.getItem('chatr_explicit_signout');
        if (!explicitSignout) {
          const deviceFingerprint = await getDeviceFingerprint();
          const { data: deviceSession } = await (supabase as any)
            .from('device_sessions')
            .select('*')
            .eq('device_fingerprint', deviceFingerprint)
            .eq('is_active', true)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

          if (deviceSession) {
            setUserId(deviceSession.user_id);
            
            const { data: profile } = await (supabase as any)
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', deviceSession.user_id)
              .single();
            
            if (profile?.onboarding_completed) {
              navigate('/', { replace: true });
              return;
            }
          }
        } else {
          sessionStorage.removeItem('chatr_explicit_signout');
        }

        setLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUserId(session.user.id);
        
        setTimeout(async () => {
          const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('onboarding_completed, username, phone_number')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profile?.onboarding_completed) {
            const redirectPath = sessionStorage.getItem('auth_redirect');
            sessionStorage.removeItem('auth_redirect');
            console.log('[AUTH] Welcome back');
            navigate(redirectPath || '/', { replace: true });
          } else {
            console.log('[AUTH] New user - complete profile');
          }
        }, 0);
      }
      
      if (event === 'SIGNED_OUT') {
        setUserId(undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, [toast, navigate]);

  if (loading) {
    return <AuthLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-os-mesh animate-os-boot text-white font-sans selection:bg-purple-500/30 selection:text-white">
      
      {/* Top Spacer */}
      <div className="flex-1" />

      {/* Main OS Boot Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-10">
        
        {/* Header - OS Boot Style */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src={chatrBrandLogo} 
              alt="Chatr" 
              className="h-10 sm:h-12 w-auto filter brightness-0 invert opacity-90"
            />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white/90">
              Chatr Intent
            </h1>
            <p className="text-sm text-white/50 tracking-wide uppercase font-medium">
              Intent Operating System
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-white/40 font-mono mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
            Initializing...
          </div>
        </motion.div>

        {/* Center Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <FirebasePhoneAuth />
            <BiometricLogin />
          </div>
        </motion.div>
        
      </div>

      {/* Bottom Spacer */}
      <div className="flex-1" />

      {/* Capability Badges (Compact, OS level) */}
      <motion.div 
        className="w-full max-w-4xl mx-auto flex flex-wrap justify-center gap-x-6 gap-y-3 pb-6 border-t border-white/5 pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        {[
          { icon: "🔒", label: "Encrypted by Default" },
          { icon: "🤖", label: "AI Native" },
          { icon: "🔍", label: "Universal Search" },
          { icon: "🧠", label: "Memory Enabled" },
          { icon: "⚡", label: "Works Across Apps" },
          { icon: "🛡️", label: "Private by Design" },
        ].map((badge) => (
          <div key={badge.label} className="flex items-center gap-2 text-[11px] font-medium text-white/50 tracking-wide uppercase">
            <span className="text-white/40 text-xs">{badge.icon}</span>
            {badge.label}
          </div>
        ))}
      </motion.div>

      {/* Onboarding Dialog */}
      {userId && (
        <OnboardingDialog
          isOpen={onboarding.isOpen}
          userId={userId}
          onComplete={async () => {
            await onboarding.completeOnboarding();
            const redirectPath = sessionStorage.getItem('auth_redirect');
            sessionStorage.removeItem('auth_redirect');
            navigate(redirectPath || '/', { replace: true });
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
