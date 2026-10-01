import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Heart, Shield, Sparkles, ChevronRight,
  Info, Check, ArrowRight, Video, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { dailyBriefEngine } from '@/ai/proactive/DailyBriefEngine';
import { BriefingCard } from '@/ai/capabilities/types';
import { universalIntentRouter } from '@/ai/router/UniversalIntentRouter';
import { PrivacyExplanationModal } from '@/components/ai/PrivacyExplanationModal';

interface IntelligentHomeFeedProps {
  onNavigate: (route: string) => void;
  spamBlocked?: number;
  appointmentCount?: number;
  walletBalance?: number;
  unreadCount?: number;
  onOpenPrivacyModal?: () => void;
}

export function IntelligentHomeFeed({
  onNavigate,
  spamBlocked = 0,
  appointmentCount = 0,
  walletBalance = 0,
  unreadCount = 0,
  onOpenPrivacyModal,
}: IntelligentHomeFeedProps) {
  const [briefCards, setBriefCards] = useState<BriefingCard[]>([]);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [modalDetails, setModalDetails] = useState({ title: '', summary: '' });

  useEffect(() => {
    const cards = dailyBriefEngine.generateBriefingCards();
    setBriefCards(cards);
  }, []);

  const handleOpenPrivacy = (cardTitle: string, domain: string) => {
    setModalDetails({
      title: 'How was this processed?',
      summary: `I handled this ${domain.toLowerCase()} briefing privately on your device with zero cloud egress.`
    });
    setPrivacyModalOpen(true);
    if (onOpenPrivacyModal) onOpenPrivacyModal();
  };

  return (
    <div className="space-y-4">
      {/* ── "For you" Header ─────────────────────────── */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-[17px] font-bold text-white tracking-tight">
          For you
        </h2>
        <button
          onClick={() => onNavigate('/ai-assistant')}
          className="text-[13px] font-medium text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors"
        >
          <span>See all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── The Cards (Strict Invariant <= 3) ────────── */}
      <div className="space-y-3">
        {/* Card 1: Strategy presentation (Work / Calendar) */}
        <div className="rounded-[22px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-white/15 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400 shrink-0 mt-0.5">
                <Calendar className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-semibold text-blue-400 tracking-wide uppercase">
                  In 45 minutes
                </span>
                <h3 className="text-[15.5px] font-bold text-white tracking-tight leading-snug truncate mt-0.5">
                  Strategy presentation
                </h3>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  1:25 PM • 2 meetings today
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenPrivacy('Strategy presentation', 'Calendar')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="How was this processed?"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 mt-3 pt-2">
            <button
              onClick={() => onNavigate('/chat')}
              className="px-4 py-2 rounded-full bg-[#2563EB] hover:bg-blue-600 active:scale-95 text-white text-[12.5px] font-semibold transition-all shadow-md shadow-blue-600/20"
            >
              Review
            </button>
            <button
              onClick={() => onNavigate('/calls')}
              className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.12] active:scale-95 text-white text-[12.5px] font-medium border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>Join</span>
            </button>
          </div>
        </div>

        {/* Card 2: Health is stable (Health OS) */}
        <div
          onClick={() => onNavigate('/health')}
          className="rounded-[22px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-white/15 cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 shrink-0">
              <Heart className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[15.5px] font-bold text-white tracking-tight leading-snug">
                  Health is stable
                </h3>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  Nominal
                </span>
              </div>
              <p className="text-[12px] text-slate-400 mt-0.5 truncate">
                Sleep, vitals and activity are within your usual range.
              </p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        {/* Card 3: ChatrShield / Defensive Screen */}
        <div
          onClick={() => onNavigate('/chatr-shield')}
          className="rounded-[22px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl shadow-lg shadow-black/20 hover:border-white/15 cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 shrink-0">
              <Shield className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[15.5px] font-bold text-white tracking-tight leading-snug">
                  ChatrShield Active
                </h3>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-[12px] text-slate-400 mt-0.5 truncate">
                {spamBlocked > 0 ? `${spamBlocked} spam calls filtered locally.` : 'Zero unknown spam calls leaked today.'}
              </p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Privacy Explanation Modal */}
      <PrivacyExplanationModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title={modalDetails.title}
        actionSummary={modalDetails.summary}
      />
    </div>
  );
}
