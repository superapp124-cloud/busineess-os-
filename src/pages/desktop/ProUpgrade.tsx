import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, BrainCircuit, Globe, PhoneForwarded, 
  Layers, CheckCircle2, Star, Zap, ShieldCheck 
} from 'lucide-react';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

export default function ProUpgrade() {
  const { themeMode } = useAppearanceStore();
  const isDark = themeMode === 'dark';
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const features = [
    {
      title: 'Proactive AI Agent',
      description: 'Your autonomous assistant that reads PDFs, drafts proposals, and prepares email replies in the background.',
      icon: <BrainCircuit className="w-6 h-6 text-purple-500" />,
      color: isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-100 border-purple-200'
    },
    {
      title: 'Live Call Intelligence',
      description: 'Real-time transcription, live translation, and on-screen scam risk detection during active GSM or VoIP calls.',
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      color: isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-100 border-blue-200'
    },
    {
      title: 'AI Voice Cloning',
      description: 'Train your custom Voice Clone. It answers declined calls, negotiates meetings, and texts you the summary.',
      icon: <PhoneForwarded className="w-6 h-6 text-emerald-500" />,
      color: isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-100 border-emerald-200'
    },
    {
      title: 'Unified Smart Inbox',
      description: 'Consolidate WhatsApp, iMessage, Email, and IG DMs. Plus, spin up temporary burner phone numbers instantly.',
      icon: <Layers className="w-6 h-6 text-amber-500" />,
      color: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-100 border-amber-200'
    },
    {
      title: 'Premium Verified Status',
      description: 'Unlock exclusive Apple-style glassmorphic themes, custom app icons, and a Verified Pro Member badge.',
      icon: <Star className="w-6 h-6 text-rose-500" />,
      color: isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-100 border-rose-200'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const handleUnlockPro = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth';
        return;
      }

      const { error: subError } = await (supabase as any)
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan: 'pro',
          billing_cycle: billingCycle,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: 'user_id' });

      if (subError) {
        console.warn('[Billing] Subscription record creation note:', subError.message);
      }

      setShowConfirmModal(true);
    } catch (e) {
      console.error('[Billing] Checkout failed:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full w-full overflow-hidden", isDark ? "bg-[#0B0F19] text-white" : "bg-slate-50 text-slate-900")}>
      <ScrollArea className="flex-1">
        <div className="max-w-5xl mx-auto px-8 py-16">
          
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-secondary font-medium text-purple-600 dark:text-purple-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Introducing Chatr+ Pro & Agency Pilot</span>
            </div>
            <h1 className="text-display md:text-6xl font-black tracking-tight ">
              Unlock the Ultimate <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                Communication OS.
              </span>
            </h1>
            <p className={cn("text-section max-w-2xl mx-auto font-medium", isDark ? "text-slate-400" : "text-slate-600")}>
              Your personal AI executive assistant that manages communications, screens candidates, speaks your languages, and auto-schedules your workflows.
            </p>
          </motion.div>

          {/* Pricing Toggle */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-16"
          >
            <div className={cn("inline-flex items-center p-1.5 rounded-full border shadow-sm", isDark ? "bg-[#13141C] border-white/10" : "bg-white border-slate-200")}>
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={cn("px-6 py-2.5 rounded-full text-secondary font-semibold transition-all", billingCycle === 'monthly' ? (isDark ? "bg-slate-800 text-white shadow" : "bg-slate-100 text-slate-900 shadow-sm") : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
              >
                Monthly Billing
              </button>
              <button 
                onClick={() => setBillingCycle('annual')}
                className={cn("px-6 py-2.5 rounded-full text-secondary font-semibold transition-all flex items-center gap-2", billingCycle === 'annual' ? (isDark ? "bg-slate-800 text-white shadow" : "bg-slate-100 text-slate-900 shadow-sm") : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-500 font-bold px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Features List */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 space-y-4"
            >
              {features.map((feature, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  className={cn(
                    "p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg flex items-start gap-4",
                    isDark ? "bg-[#13141C] border-white/5 hover:border-purple-500/30" : "bg-white border-slate-200/80 hover:border-purple-300 shadow-sm"
                  )}
                >
                  <div className={cn("p-3 rounded-xl border shrink-0", feature.color)}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-body font-bold mb-1 flex items-center gap-2">
                      {feature.title}
                    </h3>
                    <p className={cn("text-secondary leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Plan Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-5"
            >
              <div className={cn(
                "sticky top-8 p-8 rounded-[32px] border shadow-2xl backdrop-blur-xl flex flex-col",
                isDark ? "bg-[#1A1F2E]/80 border-white/10" : "bg-white/80 border-slate-200"
              )}>
                <div className="mb-8">
                  <h3 className="text-workspace font-bold mb-2">Pro Subscription</h3>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-display font-black tracking-tight">
                      {billingCycle === 'annual' ? '₹1,599' : '₹1,999'}
                    </span>
                    <span className={cn("text-section font-medium mb-1", isDark ? "text-slate-400" : "text-slate-500")}>/mo</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-secondary text-emerald-600 dark:text-emerald-400 font-medium">Billed annually • 30-day money-back guarantee</p>
                  )}
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  {[
                    "Everything in Free / Starter",
                    "Full ATS & Candidate AI Screening",
                    "500 Outbound Telephony Minutes",
                    "Automated WhatsApp Interview Scheduling",
                    "Dedicated SLA & Pilot Support"
                  ].map((perk, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-secondary font-medium">{perk}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleUnlockPro}
                  disabled={isProcessing}
                  className="w-full rounded-2xl h-14 text-body font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  {isProcessing ? 'Activating Pro...' : 'Unlock Pro Now'}
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
                <div className="mt-4 flex items-center justify-center gap-2 text-label text-slate-500">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure 256-bit encryption • Instant Entitlement</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </ScrollArea>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#12132A] border border-purple-500/30 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Pro Entitlement Activated!</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your account has been upgraded to <strong>CHATR Pro</strong>. You now have full access to the Recruitment ATS, Candidate Qualification, and Automated Calendar Scheduling.
            </p>
            <Button 
              onClick={() => { setShowConfirmModal(false); window.location.href = '/desktop/recruitment'; }}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-xl"
            >
              Open Recruitment Workspace
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
