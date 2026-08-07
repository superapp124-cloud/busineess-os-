import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Briefcase, Cloud, Building2, Users, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectionWizard } from './ConnectionWizard';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  connected: number;
  wizardType: 'email' | 'professional' | 'cloud' | 'business' | 'social';
}

const CATEGORIES: Category[] = [
  {
    id: 'communication',
    icon: <Mail className="w-5 h-5" />,
    label: 'Communication',
    description: 'Search every email from one place.',
    connected: 0,
    wizardType: 'email',
  },
  {
    id: 'professional',
    icon: <Briefcase className="w-5 h-5" />,
    label: 'Professional',
    description: 'Manage your career and projects.',
    connected: 0,
    wizardType: 'professional',
  },
  {
    id: 'cloud',
    icon: <Cloud className="w-5 h-5" />,
    label: 'Cloud Storage',
    description: 'Find documents instantly.',
    connected: 0,
    wizardType: 'cloud',
  },
  {
    id: 'business',
    icon: <Building2 className="w-5 h-5" />,
    label: 'Business Apps',
    description: 'Work across CRM and enterprise tools.',
    connected: 0,
    wizardType: 'business',
  },
  {
    id: 'social',
    icon: <Users className="w-5 h-5" />,
    label: 'Social',
    description: 'Keep personal conversations organized.',
    connected: 0,
    wizardType: 'social',
  },
];

interface WorkspaceConnectorScreenProps {
  userId: string;
  onComplete: () => void;
}

export const WorkspaceConnectorScreen: React.FC<WorkspaceConnectorScreenProps> = ({ userId, onComplete }) => {
  const [activeWizard, setActiveWizard] = useState<Category | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [skipping, setSkipping] = useState(false);

  const markSeen = async () => {
    // Best-effort — don't block UX on failure
    try {
      await (supabase as any)
        .from('profiles')
        .update({ workspace_connector_seen: true })
        .eq('id', userId);
    } catch (_) {}
  };

  const handleSkip = async () => {
    setSkipping(true);
    await markSeen();
    onComplete();
  };

  const handleCategoryConnect = (cat: Category) => {
    setActiveWizard(cat);
  };

  const handleWizardSuccess = async (categoryId: string) => {
    setConnectedIds(prev => new Set(prev).add(categoryId));
    setActiveWizard(null);
  };

  const handleFinish = async () => {
    await markSeen();
    onComplete();
  };

  if (activeWizard) {
    return (
      <ConnectionWizard
        type={activeWizard.wizardType}
        categoryLabel={activeWizard.label}
        onSuccess={() => handleWizardSuccess(activeWizard.id)}
        onBack={() => setActiveWizard(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#040510] flex flex-col items-center justify-center p-6 text-white">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/15 via-[#040510] to-[#040510] pointer-events-none" />

      {/* Progress steps */}
      <motion.div
        className="flex items-center gap-2 mb-8 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {[
          { label: 'Verify Phone', done: true },
          { label: 'Create Identity', done: true },
          { label: 'Personalize', done: false, active: true },
          { label: 'Ready', done: false },
        ].map((step, i) => (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                step.done
                  ? 'bg-purple-500 border-purple-500 text-white'
                  : step.active
                  ? 'bg-transparent border-purple-400 text-purple-300'
                  : 'bg-transparent border-white/20 text-white/30'
              }`}>
                {step.done ? <CheckCircle2 className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-[10px] tracking-wide whitespace-nowrap ${
                step.done ? 'text-purple-400' : step.active ? 'text-white/80' : 'text-white/25'
              }`}>{step.label}</span>
            </div>
            {i < 3 && (
              <div className={`w-8 h-px mb-4 ${step.done ? 'bg-purple-500/60' : 'bg-white/10'}`} />
            )}
          </React.Fragment>
        ))}
      </motion.div>

      <motion.div
        className="w-full max-w-sm z-10 space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white">Your workspace is empty.</h1>
          <p className="text-white/40 text-sm mt-1">Let's personalise it.</p>
        </div>

        {/* Category list */}
        <div className="space-y-2">
          {CATEGORIES.map((cat, i) => {
            const isConnected = connectedIds.has(cat.id);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isConnected
                    ? 'bg-purple-900/20 border-purple-500/30'
                    : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isConnected ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-white/50'
                  }`}>
                    {isConnected ? <CheckCircle2 className="w-5 h-5 text-purple-400" /> : cat.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isConnected ? 'text-purple-200' : 'text-white/80'}`}>
                      {cat.label}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">{cat.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => !isConnected && handleCategoryConnect(cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    isConnected
                      ? 'text-purple-400 bg-purple-500/10 cursor-default'
                      : 'text-purple-300 bg-purple-500/15 hover:bg-purple-500/25'
                  }`}
                >
                  {isConnected ? 'Connected' : 'Connect'}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {connectedIds.size > 0 && (
            <Button
              onClick={handleFinish}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl font-semibold"
            >
              Continue to CHATR
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
          <button
            onClick={handleSkip}
            disabled={skipping}
            className="w-full h-10 text-white/30 text-sm hover:text-white/60 transition-colors flex items-center justify-center gap-2"
          >
            {skipping && <Loader2 className="w-3 h-3 animate-spin" />}
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
};
