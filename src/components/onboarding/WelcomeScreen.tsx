import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  userName: string;
  onContinue: () => void;
  onSkip: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, onContinue, onSkip }) => {
  return (
    <div className="min-h-screen bg-[#040510] flex flex-col items-center justify-center p-6 text-white">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#040510] to-[#040510] pointer-events-none" />

      {/* Progress steps */}
      <motion.div
        className="flex items-center gap-2 mb-12 z-10"
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
              }`}>
                {step.label}
              </span>
            </div>
            {i < 3 && (
              <div className={`w-8 h-px mb-4 ${step.done ? 'bg-purple-500/60' : 'bg-white/10'}`} />
            )}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Main card */}
      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="relative bg-[#090A15]/90 border border-white/8 shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-6 backdrop-blur-2xl">

          {/* Success badge */}
          <motion.div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/30 to-purple-900/30 border border-purple-500/30 flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 className="w-8 h-8 text-purple-400" />
          </motion.div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">
              Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}.
            </h1>
            <p className="text-white/50 text-sm leading-relaxed">
              Your CHATR Identity is ready.
            </p>
          </div>

          {/* Value prop */}
          <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <p className="text-white/70 text-sm leading-relaxed">
                CHATR becomes more powerful when it knows the tools you use. Connect your email, calendar, and apps to get the most out of your workspace.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-purple-400/70 mt-0.5 shrink-0" />
              <p className="text-white/40 text-xs leading-relaxed">
                You can always connect or disconnect services later from Settings.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <Button
              onClick={onContinue}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all"
            >
              Set up my workspace
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <button
              onClick={onSkip}
              className="w-full h-10 text-white/30 text-sm hover:text-white/60 transition-colors"
            >
              Skip for now — take me to CHATR
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
