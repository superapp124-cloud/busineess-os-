import React from 'react';
import { ArrowRight, Play, Check, Search, Sparkles, Briefcase, FileText, Compass, BarChart3, MoreHorizontal, Send, Paperclip } from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth: () => void;
  onOpenVideo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth, onOpenVideo }) => {
  return (
    <section className="relative overflow-hidden pt-10 sm:pt-14 pb-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Editorial Typography & Value Proposition */}
          <div className="lg:col-span-6 space-y-7 z-10">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
              <span className="w-6 h-[1.5px] bg-[#164E3F]" />
              <span>THE INTENT OPERATING SYSTEM</span>
            </div>

            {/* Giant Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111817] leading-[1.08]">
              Your Intent.<br />
              Our Intelligence.<br />
              <span className="text-[#164E3F] drop-shadow-sm">Real Results.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#53605C] leading-relaxed max-w-xl">
              CHATR connects you to people, information and AI agents so you can get things done — faster, smarter and in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenVideo}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#F8F8F5] text-[#111817] border border-[#DDE3DF] text-sm sm:text-base font-medium shadow-sm hover:border-[#164E3F]/40 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#E8F0EB] flex items-center justify-center text-[#164E3F]">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span>Watch CHATR in action</span>
              </button>
            </div>

            {/* Trust Checklist */}
            <div className="pt-4 border-t border-[#DDE3DF]/60 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-[#53605C]">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" />
                <span>Private by design</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" />
                <span>AI-native</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" />
                <span>All-in-one</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#164E3F] stroke-[2.5]" />
                <span>Built for real life</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Realistic Editorial Workspace Composition with Laptop & Mobile UI */}
          <div className="lg:col-span-6 relative">
            
            {/* Top Floating Editorial Badge */}
            <div className="absolute -top-6 right-4 sm:right-10 z-20 hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#164E3F] text-white text-xs font-semibold shadow-md border border-[#2E6B59]/40">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-white font-semibold">A More Connected Productive You</span>
            </div>

            {/* Handwritten-Style Script Annotation with Curving Arrow */}
            <div className="absolute -top-12 left-6 sm:left-12 z-20 hidden md:block">
              <div className="font-serif italic text-sm text-[#2E6B59] leading-tight flex flex-col items-center">
                <span>More than chat.</span>
                <span>A smarter way to do life.</span>
                <svg className="w-8 h-8 text-[#2E6B59] -mt-1 stroke-current fill-none" viewBox="0 0 24 24">
                  <path d="M7 3C12 7 14 14 17 21M17 21L12 17M17 21L21 16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Main Stage Card Container with Subtle Shadow */}
            <div className="relative rounded-3xl bg-white p-3 sm:p-5 border border-[#DDE3DF] shadow-xl shadow-stone-300/40 overflow-hidden">
              
              {/* Subtle Natural Background Layer with Workspace Mood */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#F2F4F2] to-[#E9ECE8] p-3 sm:p-4 border border-[#DDE3DF]/60">
                
                {/* 1. Laptop Frame Mockup (Actual CHATR UI Screen) */}
                <div className="relative rounded-xl bg-[#111817] p-2 shadow-2xl border border-stone-800">
                  
                  {/* Laptop Top Bezel / Web Cam */}
                  <div className="flex items-center justify-between px-2 pb-1.5 text-[10px] text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500/80" />
                      <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                      <span className="w-2 h-2 rounded-full bg-green-500/80" />
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-700 mx-auto" />
                    <span className="text-[9px] text-stone-500">chatr.in</span>
                  </div>

                  {/* Inside Laptop Screen: Actual CHATR Interface */}
                  <div className="bg-[#FAF9F6] rounded-lg p-3 sm:p-4 text-[#111817] shadow-inner space-y-3 font-sans">
                    
                    {/* Top App Bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <div className="flex items-center">
                        <img 
                          src="/images/chatr-official-logo.png" 
                          alt="CHATR" 
                          className="h-4 sm:h-5 w-auto object-contain"
                        />
                      </div>
                      
                      {/* Search Bar */}
                      <div className="flex-1 max-w-[220px] mx-3">
                        <div className="relative flex items-center bg-white border border-stone-200 rounded-full px-2.5 py-1 text-[11px] text-stone-500">
                          <Search className="w-3 h-3 text-stone-400 mr-1.5 shrink-0" />
                          <span className="truncate">Ask CHATR anything...</span>
                        </div>
                      </div>

                      {/* Avatar */}
                      <div className="w-6 h-6 rounded-full bg-[#164E3F] text-white text-[10px] font-bold flex items-center justify-center">
                        CU
                      </div>
                    </div>

                    {/* Greeting & Headline */}
                    <div className="pt-1">
                      <h3 className="text-base sm:text-lg font-bold text-[#111817] tracking-tight">
                        Good morning, ChatrUser 👋
                      </h3>
                      <p className="text-xs text-[#53605C]">
                        What would you like to do today?
                      </p>
                    </div>

                    {/* 6 Intent Action Cards */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                      {[
                        { label: 'Find a job', icon: Briefcase, color: 'text-emerald-700 bg-emerald-50' },
                        { label: 'Research', icon: Search, color: 'text-blue-700 bg-blue-50' },
                        { label: 'Plan a trip', icon: Compass, color: 'text-amber-700 bg-amber-50' },
                        { label: 'Create content', icon: FileText, color: 'text-purple-700 bg-purple-50' },
                        { label: 'Analyze data', icon: BarChart3, color: 'text-indigo-700 bg-indigo-50' },
                        { label: 'More', icon: MoreHorizontal, color: 'text-stone-700 bg-stone-100' },
                      ].map((item) => (
                        <div 
                          key={item.label} 
                          className="bg-white hover:bg-stone-50 border border-stone-200/80 rounded-lg p-1.5 transition-all shadow-xs flex flex-col items-center justify-center gap-1 cursor-pointer"
                        >
                          <div className={`w-6 h-6 rounded-md ${item.color} flex items-center justify-center`}>
                            <item.icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] font-medium text-stone-700 truncate w-full">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Main Omnibar Input */}
                    <div className="bg-white border border-[#DDE3DF] rounded-xl p-2 shadow-xs space-y-2">
                      <div className="text-[11px] text-stone-400">
                        Type your intent, ask a question or give a task...
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px] text-stone-500">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 cursor-pointer">+ Action</span>
                          <span className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 cursor-pointer flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-[#164E3F]" /> Agents
                          </span>
                          <span className="flex items-center gap-0.5 text-stone-400">
                            <Paperclip className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-[#164E3F] text-white flex items-center justify-center">
                          <Send className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>

                    {/* Suggested Agent Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                      {[
                        { title: 'AI Career Coach', desc: 'Get personalized guidance', badge: 'Career' },
                        { title: 'Job Match', desc: 'Find the right opportunities', badge: 'Talent' },
                        { title: 'Research Agent', desc: 'Deep research, fast insights', badge: 'Search' },
                      ].map((agent) => (
                        <div key={agent.title} className="bg-white border border-stone-200/90 rounded-lg p-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#111817] truncate">{agent.title}</span>
                            <span className="text-[8px] font-medium px-1 rounded bg-[#E8F0EB] text-[#164E3F]">{agent.badge}</span>
                          </div>
                          <div className="text-[9px] text-[#53605C] truncate mt-0.5">{agent.desc}</div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

                {/* 2. Mobile Phone Frame Mockup Overlapping Beside Laptop */}
                <div className="absolute -bottom-2 -right-1 sm:right-2 w-36 sm:w-44 bg-[#111817] rounded-[24px] p-1.5 shadow-2xl border border-stone-700 hidden sm:block transform rotate-1 hover:rotate-0 transition-transform duration-300 z-10">
                  {/* Phone Notch */}
                  <div className="w-12 h-2.5 bg-stone-900 rounded-full mx-auto mb-1.5" />
                  
                  {/* Phone Screen */}
                  <div className="bg-[#FAF9F6] rounded-[18px] p-2.5 text-[#111817] space-y-2 text-[10px]">
                    <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                      <img 
                        src="/images/chatr-official-logo.png" 
                        alt="CHATR" 
                        className="h-3 sm:h-3.5 w-auto object-contain"
                      />
                    </div>

                    <div className="font-bold text-[11px] leading-tight text-[#164E3F]">
                      Turn Your Intent Into Action
                    </div>

                    <div className="space-y-1 text-stone-600 text-[9px]">
                      <div className="p-1 rounded bg-white border border-stone-100 flex items-center gap-1.5">
                        <span className="text-[10px]">💬</span>
                        <span>Chat</span>
                      </div>
                      <div className="p-1 rounded bg-white border border-stone-100 flex items-center gap-1.5">
                        <span className="text-[10px]">✨</span>
                        <span>AI Agents</span>
                      </div>
                      <div className="p-1 rounded bg-white border border-stone-100 flex items-center gap-1.5">
                        <span className="text-[10px]">🔍</span>
                        <span>Search</span>
                      </div>
                      <div className="p-1 rounded bg-white border border-stone-100 flex items-center gap-1.5">
                        <span className="text-[10px]">💼</span>
                        <span>Opportunities</span>
                      </div>
                    </div>

                    <button 
                      onClick={onOpenAuth}
                      className="w-full py-1.5 rounded-lg bg-[#164E3F] text-white text-[9px] font-semibold text-center mt-1"
                    >
                      Get Started
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
