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
import { AppleCard } from '@/components/ui/AppleCard';
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
 
 const { data: profile, error: profileError } = await supabase
 .from('profiles')
 .select('*')
 .eq('id', session.user.id)
 .maybeSingle();

 if (profileError) {
 console.error('[AUTH] Profile fetch error:', profileError);
 }

 if (profile) {
 const { data: roles } = await supabase
 .from("user_roles")
 .select("role")
 .eq("user_id", session.user.id);
 
 const isAdmin = roles?.some(r => r.role === "admin");
 
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
 const { data: deviceSession } = await supabase
 .from('device_sessions')
 .select('*')
 .eq('device_fingerprint', deviceFingerprint)
 .eq('is_active', true)
 .gt('expires_at', new Date().toISOString())
 .maybeSingle();

 if (deviceSession) {
 setUserId(deviceSession.user_id);
 
 const { data: profile } = await supabase
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
 const { data: profile } = await supabase
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 text-slate-900">
      {/* Soft light background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100" />
      
      {/* Floating soft blur elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl" />
      
      <motion.div 
        className="relative w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Brand Section */}
        <div className="text-center mb-8 space-y-3">
          {/* Logo */}
          <motion.div 
            className="flex justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <img 
              src={chatrBrandLogo} 
              alt="Chatr" 
              className="h-16 w-auto"
            />
          </motion.div>
          
          {/* Title - Image 2 Typography */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Chatr<span className="text-[#8B5CF6]">+</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Smart Messaging, Privacy First
            </p>
          </motion.div>
        </div>
        
        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-3xl p-6 sm:p-8 space-y-4">
            <FirebasePhoneAuth />
            <BiometricLogin />
          </div>
        </motion.div>
        
        {/* Features Grid - Image 2 style */}
        <motion.div 
          className="mt-8 grid grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {[
            { icon: '🔒', label: 'Secure' },
            { icon: '⚡', label: 'Fast' },
            { icon: '🤖', label: 'AI Powered' },
          ].map((feature, i) => (
            <motion.div 
              key={feature.label}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-700 text-lg">
                {feature.icon}
              </div>
              <span className="text-xs font-medium text-slate-600">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Footer */}
        <motion.div
          className="mt-8 text-center text-xs text-slate-400 space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Footer />
        </motion.div>
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
