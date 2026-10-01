import React from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface PrivacyExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actionSummary?: string;
}

export const PrivacyExplanationModal: React.FC<PrivacyExplanationModalProps> = ({
  isOpen,
  onClose,
  title = 'How was this processed?',
  actionSummary = 'I handled this privately on your device.'
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] w-[92vw] rounded-[28px] bg-[#0E131F]/95 border border-white/10 p-6 text-white backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Lock className="w-4 h-4" />
            </span>
            <h3 className="text-[17px] font-bold text-white tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[14px] text-slate-400 font-normal mb-5 leading-snug">
          {actionSummary}
        </p>

        {/* Verification Checklist */}
        <div className="space-y-3.5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[13.5px] font-medium text-slate-200">
              Understood your request locally
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[13.5px] font-medium text-slate-200">
              Accessed your data (with local permission)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[13.5px] font-medium text-slate-200">
              Evaluated baseline deterministically
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[13.5px] font-medium text-slate-200">
              Structured action for single-tap review
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[13.5px] font-semibold text-emerald-400">
              No data was sent to the cloud
            </span>
          </div>
        </div>

        {/* Footer Action */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-[13.5px] hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(124,58,237,0.3)] flex items-center justify-center gap-1.5"
        >
          <span>Learn more about privacy</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
};
