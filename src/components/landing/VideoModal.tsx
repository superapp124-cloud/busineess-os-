import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ArrowRight, Sparkles, CheckCircle2, Briefcase, Video, Layers, Youtube, ExternalLink } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

const chapters = [
  {
    id: 'intent',
    title: '1. Express Intent',
    headline: 'You state what you want to accomplish',
    copy: 'Instead of navigating dozen disconnected tools, simply type or speak your intent in plain language. CHATR understands context, goals, and constraints.',
    icon: Sparkles,
    preview: {
      user: 'I need to hire a senior frontend developer in Bangalore and set up interview screening by tomorrow.',
      system: 'Analyzing requirements... 12 vetted candidates found. Drafted assessment scorecard and automated WhatsApp outreach.',
    },
  },
  {
    id: 'agents',
    title: '2. Intelligence in Action',
    headline: 'Autonomous agents coordinate the workflow',
    copy: 'Specialized AI agents for talent, research, business operations, and communication execute tasks concurrently without manual context switching.',
    icon: Briefcase,
    preview: {
      status: 'Recruitment Agent + Screening Agent active',
      actions: [
        'Parsed 45 portfolios with semantic match score > 88%',
        'Scheduled 3 initial screening slots based on calendar sync',
        'Summary report generated in workspace docs',
      ],
    },
  },
  {
    id: 'results',
    title: '3. Real Results',
    headline: 'Outcomes delivered directly to your workspace',
    copy: 'Track decisions, review deliverables, collaborate with your team, and take immediate action. Real intelligence, zero wasted motion.',
    icon: CheckCircle2,
    preview: {
      headline: 'Outcome Completed',
      deliverables: 'Interview shortlist ready • WhatsApp candidate group created • Candidate scorecards linked',
    },
  },
];

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'walkthrough'>('video');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isOpen || !isPlaying || activeTab !== 'walkthrough') return;
    const interval = setInterval(() => {
      setActiveChapterIndex((prev) => (prev + 1) % chapters.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, activeTab]);

  if (!isOpen) return null;

  const currentChapter = chapters[activeChapterIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#DDE3DF] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE3DF] bg-[#F8F8F5]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#164E3F]" />
              <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#111817]">
                CHATR IN ACTION
              </span>
            </div>
            <a
              href="https://www.youtube.com/@chatrindia"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold transition-colors border border-red-200/70"
            >
              <Youtube className="w-3.5 h-3.5 fill-current text-red-600" />
              <span>@chatrindia</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-stone-200/60 p-1 rounded-full text-xs font-semibold">
            <button
              onClick={() => setActiveTab('video')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                activeTab === 'video'
                  ? 'bg-white text-[#164E3F] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Product Demo</span>
            </button>
            <button
              onClick={() => setActiveTab('walkthrough')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                activeTab === 'walkthrough'
                  ? 'bg-white text-[#164E3F] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Tour</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-[#111817] hover:bg-stone-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB 1: Live Demo Video Player */}
        {activeTab === 'video' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="relative aspect-video w-full bg-[#0F0F14] rounded-2xl overflow-hidden shadow-inner border border-stone-800 flex items-center justify-center">
              <video
                src="/videos/chatr-demo.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                Your browser does not support video playback.
              </video>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-xs text-[#111817] font-semibold">
                  CHATR Intent OS: Autonomous communication, AI agents & universal workspace
                </div>
                <div className="text-[11px] text-[#53605C] flex items-center justify-center sm:justify-start gap-1.5">
                  <span>Watch more deep dives on</span>
                  <a
                    href="https://www.youtube.com/@chatrindia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold"
                  >
                    <Youtube className="w-3.5 h-3.5 fill-current" />
                    <span>YouTube @chatrindia</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.youtube.com/@chatrindia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-300 hover:border-red-600 hover:text-red-600 bg-white text-[#111817] text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
                >
                  <Youtube className="w-4 h-4 text-red-600 fill-current" />
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <span>Try CHATR Today</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Interactive Step-By-Step Tour */}
        {activeTab === 'walkthrough' && (
          <div>
            {/* Chapter Steps Indicator */}
            <div className="grid grid-cols-3 border-b border-[#DDE3DF] bg-stone-50/50">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChapterIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`py-3 px-4 text-left border-b-2 text-xs font-semibold transition-all ${
                    activeChapterIndex === idx
                      ? 'border-[#164E3F] text-[#164E3F] bg-white'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <div className="truncate">{ch.title}</div>
                </button>
              ))}
            </div>

            {/* Video Stage Simulation */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2E6B59]">
                    <currentChapter.icon className="w-3.5 h-3.5" />
                    <span>Step {activeChapterIndex + 1} of 3</span>
                  </div>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-stone-500 hover:text-[#111817] text-xs flex items-center gap-1"
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>{isPlaying ? 'Pause Auto-Advance' : 'Resume'}</span>
                  </button>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111817]">
                  {currentChapter.headline}
                </h3>
                <p className="text-sm text-[#53605C] leading-relaxed max-w-2xl">
                  {currentChapter.copy}
                </p>
              </div>

              {/* Interactive Preview Canvas */}
              <div className="bg-[#FAF9F6] rounded-2xl border border-[#DDE3DF] p-4 sm:p-5 space-y-3 font-sans shadow-inner">
                
                {activeChapterIndex === 0 && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-stone-300 text-stone-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                        CU
                      </div>
                      <div className="p-3 rounded-2xl bg-white border border-[#DDE3DF] text-[#111817] shadow-xs max-w-lg">
                        {currentChapter.preview.user}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#164E3F] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                        OS
                      </div>
                      <div className="p-3 rounded-2xl bg-[#E8F0EB]/60 border border-[#164E3F]/20 text-[#164E3F] font-medium shadow-xs max-w-lg">
                        {currentChapter.preview.system}
                      </div>
                    </div>
                  </div>
                )}

                {activeChapterIndex === 1 && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <span className="font-bold text-[#164E3F]">{currentChapter.preview.status}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Executing</span>
                    </div>
                    <div className="space-y-2">
                      {currentChapter.preview.actions?.map((act, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200 text-[#111817]">
                          <CheckCircle2 className="w-4 h-4 text-[#164E3F] shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeChapterIndex === 2 && (
                  <div className="space-y-3 text-xs text-center py-3">
                    <div className="w-10 h-10 rounded-full bg-[#E8F0EB] text-[#164E3F] flex items-center justify-center mx-auto mb-1">
                      <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <h4 className="text-base font-bold text-[#111817]">{currentChapter.preview.headline}</h4>
                    <p className="text-stone-600 max-w-md mx-auto">{currentChapter.preview.deliverables}</p>
                  </div>
                )}

              </div>

              {/* Action Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-[#53605C]">
                  <span>Watch real demonstrations on</span>
                  <a
                    href="https://www.youtube.com/@chatrindia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold"
                  >
                    <Youtube className="w-3.5 h-3.5 fill-current" />
                    <span>YouTube @chatrindia</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <a
                    href="https://www.youtube.com/@chatrindia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-300 hover:border-red-600 hover:text-red-600 bg-white text-[#111817] text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
                  >
                    <Youtube className="w-4 h-4 text-red-600 fill-current" />
                    <span>Channel</span>
                  </a>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <span>Try CHATR Today</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
