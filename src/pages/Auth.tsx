import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden bg-[#040510] text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Background Neon Orbs & Glowing Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-[#040510] to-[#040510] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-purple-600/15 via-blue-500/15 to-cyan-400/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-800/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center gap-8 my-auto">
        
        {/* Header Branding - Bright & Visible Logo */}
        <motion.div 
          className="text-center space-y-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo with brightness-0 invert filter for 100% crisp visibility on dark background */}
          <div className="flex justify-center mb-2">
            <img 
              src={chatrBrandLogo} 
              alt="Chatr" 
              className="h-12 sm:h-14 w-auto filter brightness-0 invert drop-shadow-[0_0_25px_rgba(6,182,212,0.9)] opacity-95"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            Chatr <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Intent</span> <span className="inline-block text-cyan-400 animate-pulse">✨</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 font-medium">
            The Intent Operating System for Life, Work & Everything.
          </p>
        </motion.div>

        {/* 3-Column Layout for Desktop */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center mt-2">
          
          {/* Left Feature Column (Desktop) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-5">
            {[
              {
                icon: "🛡️",
                title: "End-to-End Encrypted",
                desc: "Your messages and data are 100% private and secure.",
                color: "from-purple-500/20 to-purple-900/10 border-purple-500/30 text-purple-400"
              },
              {
                icon: "⚡",
                title: "Lightning Fast",
                desc: "Experience real-time messaging built for speed and reliability.",
                color: "from-amber-500/20 to-amber-900/10 border-amber-500/30 text-amber-400"
              },
              {
                icon: "👥",
                title: "All-in-One Platform",
                desc: "Chat, Calls, Communities, Payments, AI Agents and more — in one place.",
                color: "from-blue-500/20 to-blue-900/10 border-blue-500/30 text-blue-400"
              }
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border backdrop-blur-xl hover:border-opacity-60 transition-all duration-300 group`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">{card.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Center Column: Login Card */}
          <div className="col-span-1 lg:col-span-6 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <div className="relative group">
                {/* Glow outline border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                
                {/* Glass Card */}
                <div className="relative bg-[#0A0B1A]/90 border border-purple-500/30 shadow-[0_0_50px_rgba(124,58,237,0.15)] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl space-y-6">
                  
                  {/* Glowing Brain Icon Badge */}
                  <div className="flex justify-center -mt-2 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 border border-purple-400/30 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                      🧠
                    </div>
                  </div>

                  {/* Auth Component */}
                  <FirebasePhoneAuth />
                  <BiometricLogin />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Feature Column (Desktop) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-5">
            {[
              {
                icon: "🛡️",
                title: "Privacy First",
                desc: "We never sell your data. Your privacy is our highest priority.",
                color: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400"
              },
              {
                icon: "🤖",
                title: "AI Powered",
                desc: "Smart AI agents that understand your intent and get things done.",
                color: "from-cyan-500/20 to-cyan-900/10 border-cyan-500/30 text-cyan-400"
              },
              {
                icon: "🎯",
                title: "Intent OS",
                desc: "More than an app. It's an Intent Operating System for your life.",
                color: "from-purple-500/20 to-indigo-900/10 border-purple-500/30 text-purple-400"
              }
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border backdrop-blur-xl hover:border-opacity-60 transition-all duration-300 group`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">{card.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Center Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-purple-500/20 backdrop-blur-md text-xs font-medium text-purple-200 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
        >
          <span className="text-emerald-400">🛡️</span> Secure • Private • AI Powered • Built for You
        </motion.div>

        {/* 5 Bottom Feature Pillars */}
        <motion.div 
          className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { icon: "🔒", title: "Secure", desc: "Bank-grade encryption to keep you safe." },
            { icon: "⚡", title: "Fast", desc: "Optimized for speed and performance." },
            { icon: "🤖", title: "AI Powered", desc: "Intelligent assistance at your fingertips." },
            { icon: "👥", title: "Connected", desc: "Stay connected with people and communities." },
            { icon: "🛡️", title: "Private", desc: "You're in control of your data and privacy." },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/20 transition-all">
              <div className="text-xl mb-1.5">{item.icon}</div>
              <h4 className="font-semibold text-xs text-white">{item.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Linked Footer Component */}
      <motion.div 
        className="relative z-10 w-full mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Footer />
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
