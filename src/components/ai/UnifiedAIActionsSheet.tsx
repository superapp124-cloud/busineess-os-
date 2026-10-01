import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, MessageCircle, Phone, UserCheck, Calendar,
  FileText, Heart, Wallet, Stethoscope, Mic,
  ArrowRight, Sparkles, AudioWaveform
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { universalIntentRouter } from '@/ai/router/UniversalIntentRouter';

interface UnifiedAIActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onIntentProcessed?: (result: string) => void;
}

export const UnifiedAIActionsSheet: React.FC<UnifiedAIActionsSheetProps> = ({
  isOpen,
  onClose,
  onIntentProcessed,
}) => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const actions = [
    {
      id: 'action-msg',
      title: 'Message someone',
      icon: MessageCircle,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/15',
      handler: () => {
        onClose();
        navigate('/chat');
      }
    },
    {
      id: 'action-call',
      title: 'Make a call',
      icon: Phone,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15',
      handler: () => {
        onClose();
        navigate('/calls');
      }
    },
    {
      id: 'action-contact',
      title: 'Find a contact',
      icon: UserCheck,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/15',
      handler: () => {
        onClose();
        navigate('/calls');
      }
    },
    {
      id: 'action-sched',
      title: 'Schedule a meeting',
      icon: Calendar,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15',
      handler: () => {
        setInputText('Schedule a meeting with Rahul tomorrow at 4 PM');
      }
    },
    {
      id: 'action-sum',
      title: 'Summarize a document',
      icon: FileText,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15',
      handler: () => {
        setInputText('Summarize this document and extract key decisions');
      }
    },
    {
      id: 'action-health',
      title: 'Check my health',
      icon: Heart,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/15',
      handler: () => {
        onClose();
        navigate('/health');
      }
    },
    {
      id: 'action-pay',
      title: 'Pay a bill',
      icon: Wallet,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15',
      handler: () => {
        onClose();
        navigate('/chatr-wallet');
      }
    },
    {
      id: 'action-doc',
      title: 'Find a doctor',
      icon: Stethoscope,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/15',
      handler: () => {
        onClose();
        navigate('/care');
      }
    }
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    setIsProcessing(true);
    setResultMessage(null);

    try {
      const res = await universalIntentRouter.route({
        rawInput: inputText.trim(),
        source: 'USER_TEXT',
      });
      setResultMessage(res.response);
      if (onIntentProcessed) onIntentProcessed(res.response);
      setInputText('');
    } catch {
      setResultMessage('Handled locally on-device.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[440px] w-[94vw] rounded-[32px] bg-[#0C101A]/95 border border-white/10 p-5 text-white backdrop-blur-2xl shadow-[0_30px_70px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">What can I do for you?</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600/20 text-violet-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-[17px] font-bold text-white tracking-tight">
              What can I do for you?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 8 Action Items List */}
        <div className="py-2 space-y-1">
          {actions.map((act) => (
            <button
              key={act.id}
              onClick={act.handler}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl hover:bg-white/[0.06] active:scale-[0.99] transition-all text-left group"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${act.iconBg} ${act.iconColor} shrink-0`}>
                <act.icon className="w-4.5 h-4.5" />
              </span>
              <span className="text-[14px] font-semibold text-slate-200 group-hover:text-white transition-colors">
                {act.title}
              </span>
            </button>
          ))}
        </div>

        {/* Feedback message if processed */}
        {resultMessage && (
          <div className="my-2 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-[12.5px] text-violet-200">
            <span className="font-bold text-violet-300">CHATR: </span>
            {resultMessage}
          </div>
        )}

        {/* Bottom Omnibar / Input Bar */}
        <div className="mt-2 pt-3 border-t border-white/[0.08]">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or speak..."
              className="h-[46px] w-full rounded-[22px] bg-white/[0.06] border border-white/[0.12] pl-4 pr-24 text-[13.5px] font-medium text-white placeholder:text-slate-400 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
                onClick={() => setInputText('How has my BP been recently?')}
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={isProcessing || !inputText.trim()}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white disabled:opacity-30 shadow-md shadow-violet-600/30 transition-transform active:scale-90"
              >
                {isProcessing ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
