import React, { useState } from 'react';
import { ChevronDown, Menu, X, ArrowRight, Sparkles, Compass, Briefcase, LayoutDashboard, Youtube, ExternalLink, Phone, MessageSquare, Wrench } from 'lucide-react';

interface LandingHeaderProps {
  onOpenAuth: () => void;
  isAuthenticated: boolean;
  onNavigateWorkspace: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onOpenAuth,
  isAuthenticated,
  onNavigateWorkspace,
  onScrollToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleNavClick = (sectionId: string) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F8F8F5]/90 backdrop-blur-md border-b border-[#DDE3DF]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="/" className="flex flex-col group cursor-pointer select-none">
          <img 
            src="/images/chatr-official-logo.png" 
            alt="CHATR" 
            className="h-7 sm:h-8 w-auto object-contain"
          />
          <span className="text-[9px] font-bold tracking-[0.28em] uppercase text-[#53605C] mt-0.5">
            INTENT OS
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#53605C]">
          
          {/* Product */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('product')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button 
              className="flex items-center gap-1 text-[#111817] hover:text-[#164E3F] transition-colors py-2"
            >
              <span>Product</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {activeDropdown === 'product' && (
              <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-xl border border-[#DDE3DF] p-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <a 
                  href="/whatsapp-team-inbox"
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F8F5] flex items-start gap-3 transition-colors block"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-[#111817]">WhatsApp Team Inbox</div>
                    <div className="text-[11px] text-[#53605C]">Shared inbox for team chat & leads</div>
                  </div>
                </a>
                <a 
                  href="/call"
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F8F5] flex items-start gap-3 transition-colors block"
                >
                  <Phone className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-[#111817]">Free Browser Web Calling</div>
                    <div className="text-[11px] text-[#53605C]">Instant HD voice & video, no downloads</div>
                  </div>
                </a>
                <div className="pt-1 border-t border-slate-100 mt-1"></div>
                <button 
                  onClick={() => handleNavClick('features')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F8F5] flex items-start gap-3 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#164E3F] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-[#111817]">Autonomous Intent Engine</div>
                    <div className="text-[11px] text-[#53605C]">Turn intent into coordinated action</div>
                  </div>
                </button>
                <button 
                  onClick={() => handleNavClick('features')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F8F5] flex items-start gap-3 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#164E3F] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-[#111817]">Universal Workspace</div>
                    <div className="text-[11px] text-[#53605C]">Chat, search & tools in one place</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* SI Agents */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('agents')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button 
              onClick={() => handleNavClick('features')}
              className="flex items-center gap-1 text-[#53605C] hover:text-[#111817] transition-colors py-2"
            >
              <span>SI Agents</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {activeDropdown === 'agents' && (
              <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-lg border border-[#DDE3DF] p-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <button 
                  onClick={() => handleNavClick('features')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F8F5] flex items-start gap-3 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-[#164E3F] mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-[#111817]">Career & Talent Agents</div>
                    <div className="text-[11px] text-[#53605C]">Job matching and automated intake</div>
                  </div>
                </button>
                <button 
                  onClick={() => handleNavClick('features')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-[#F8F8F5] flex items-start gap-3 transition-colors"
                >
                  <Compass className="w-4 h-4 text-[#164E3F] mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-[#111817]">Research & Travel Agents</div>
                    <div className="text-[11px] text-[#53605C]">Deep web research and itineraries</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Use Cases */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('usecases')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button 
              onClick={() => handleNavClick('audiences')}
              className="flex items-center gap-1 text-[#53605C] hover:text-[#111817] transition-colors py-2"
            >
              <span>Use Cases</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {activeDropdown === 'usecases' && (
              <div className="absolute top-full left-0 w-60 bg-white rounded-2xl shadow-lg border border-[#DDE3DF] p-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <button onClick={() => handleNavClick('audiences')} className="w-full text-left p-2 rounded-xl hover:bg-[#F8F8F5] text-xs font-medium text-[#111817] block">
                  For Individuals & Growth
                </button>
                <button onClick={() => handleNavClick('audiences')} className="w-full text-left p-2 rounded-xl hover:bg-[#F8F8F5] text-xs font-medium text-[#111817] block">
                  For Professionals & Work
                </button>
                <button onClick={() => handleNavClick('audiences')} className="w-full text-left p-2 rounded-xl hover:bg-[#F8F8F5] text-xs font-medium text-[#111817] block">
                  For Businesses & Operations
                </button>
                <button onClick={() => handleNavClick('audiences')} className="w-full text-left p-2 rounded-xl hover:bg-[#F8F8F5] text-xs font-medium text-[#111817] block">
                  For Students & Education
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleNavClick('pricing')}
            className="text-[#53605C] hover:text-[#111817] transition-colors"
          >
            Pricing
          </button>

          {/* Resources */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('resources')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button 
              className="text-[#53605C] hover:text-[#111817] transition-colors flex items-center gap-1 py-2"
            >
              <span>Resources</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {activeDropdown === 'resources' && (
              <div className="absolute top-full right-0 w-72 bg-white rounded-2xl shadow-xl border border-[#DDE3DF] p-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <a 
                  href="/tools/whatsapp-link-generator"
                  className="w-full text-left p-2 rounded-xl hover:bg-[#F8F8F5] flex items-center justify-between text-xs font-semibold text-[#111817] transition-colors block"
                >
                  <span>WhatsApp Link Generator</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Free</span>
                </a>
                <a 
                  href="/tools/resume-grader"
                  className="w-full text-left p-2 rounded-xl hover:bg-[#F8F8F5] flex items-center justify-between text-xs font-semibold text-[#111817] transition-colors block"
                >
                  <span>AI Resume Grader & Match</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Free</span>
                </a>
                <a 
                  href="/tools/meta-ad-cost-calculator"
                  className="w-full text-left p-2 rounded-xl hover:bg-[#F8F8F5] flex items-center justify-between text-xs font-semibold text-[#111817] transition-colors block"
                >
                  <span>Meta Ad Cost Calculator</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Free</span>
                </a>
                <div className="pt-1 border-t border-slate-100 my-1"></div>
                <a 
                  href="https://www.youtube.com/@chatrindia" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full text-left p-2 rounded-xl hover:bg-[#F8F8F5] flex items-center gap-2 text-xs font-semibold text-red-600 transition-colors block"
                >
                  <Youtube className="w-3.5 h-3.5 fill-current" />
                  <span>YouTube Demos (@chatrindia)</span>
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={onNavigateWorkspace}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-full text-sm font-medium text-[#111817] hover:text-[#164E3F] hover:bg-[#E8F0EB]/60 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {!isAuthenticated && (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-full bg-[#164E3F] text-white text-xs font-semibold"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#111817] hover:bg-[#E8F0EB] transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F8F5] border-b border-[#DDE3DF] px-6 py-5 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 text-base font-medium text-[#111817]">
            <a href="/whatsapp-team-inbox" className="py-1 text-emerald-700 font-semibold flex items-center justify-between">
              <span>WhatsApp Team Inbox</span>
              <span className="text-xs text-slate-500">Solution</span>
            </a>
            <a href="/call" className="py-1 text-emerald-700 font-semibold flex items-center justify-between">
              <span>Free Browser Web Calling</span>
              <span className="text-xs text-slate-500">Free Call</span>
            </a>
            <a href="/tools/whatsapp-link-generator" className="py-1 text-slate-800 flex items-center justify-between">
              <span>WhatsApp Link Generator</span>
              <span className="text-xs text-emerald-600 font-bold">Free</span>
            </a>
            <a href="/tools/resume-grader" className="py-1 text-slate-800 flex items-center justify-between">
              <span>AI Resume Grader</span>
              <span className="text-xs text-emerald-600 font-bold">Free</span>
            </a>
            <button onClick={() => handleNavClick('features')} className="text-left py-1 text-[#53605C]">Features</button>
            <button onClick={() => handleNavClick('audiences')} className="text-left py-1 text-[#53605C]">Use Cases</button>
            <button onClick={() => handleNavClick('pricing')} className="text-left py-1 text-[#53605C]">Pricing</button>
            <a 
              href="https://www.youtube.com/@chatrindia" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="py-1 text-red-600 font-semibold flex items-center gap-2"
            >
              <Youtube className="w-4 h-4 fill-current" />
              <span>YouTube Channel (@chatrindia)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </nav>
          <div className="pt-3 border-t border-[#DDE3DF] flex flex-col gap-2.5">
            {isAuthenticated ? (
              <button
                onClick={onNavigateWorkspace}
                className="w-full py-3 rounded-full bg-[#164E3F] text-white text-center font-semibold text-sm"
              >
                Go to Workspace →
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                  className="w-full py-3 rounded-full bg-white border border-[#DDE3DF] text-[#111817] text-center font-medium text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                  className="w-full py-3 rounded-full bg-[#164E3F] text-white text-center font-semibold text-sm"
                >
                  Get Started →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
