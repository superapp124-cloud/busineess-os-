import React from 'react';
import { ArrowRight, Youtube } from 'lucide-react';

interface LandingCTAProps {
  onOpenAuth: () => void;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ onOpenAuth }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 border-t border-[#DDE3DF] bg-[#F8F8F5]">
      
      {/* Decorative Subtle Corner Botanical Leaves (as in the reference image) */}
      <div className="absolute -bottom-10 -left-10 w-44 h-44 opacity-20 pointer-events-none select-none text-[#164E3F]">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M45,150 C70,90 120,40 180,20 C160,80 120,130 50,150 Z" />
          <path d="M20,170 C40,110 90,70 150,50 C130,100 90,140 25,170 Z" opacity="0.6" />
        </svg>
      </div>
      <div className="absolute -bottom-10 -right-10 w-44 h-44 opacity-20 pointer-events-none select-none text-[#164E3F] transform scale-x-[-1]">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M45,150 C70,90 120,40 180,20 C160,80 120,130 50,150 Z" />
          <path d="M20,170 C40,110 90,70 150,50 C130,100 90,140 25,170 Z" opacity="0.6" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Banner Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 px-6 sm:px-10 rounded-3xl bg-white border border-[#DDE3DF] shadow-sm">
          
          {/* Left Text */}
          <div className="text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111817]">
              Ready to turn your intent into action?
            </h3>
            <p className="text-xs sm:text-sm text-[#53605C] mt-1">
              Start in seconds with your phone number. No credit card required.
            </p>
          </div>

          {/* Center/Action Button */}
          <div>
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white text-sm sm:text-base font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <span>Get Started Today</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Tagline */}
          <div className="text-right hidden lg:flex flex-col items-end gap-2">
            <div className="text-xs font-semibold tracking-[0.25em] text-[#53605C] uppercase">
              — A SMARTER WAY TO DO LIFE
            </div>
            <a
              href="https://www.youtube.com/@chatrindia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#53605C] hover:text-red-600 transition-colors font-medium"
            >
              <Youtube className="w-3.5 h-3.5 text-red-600 fill-current" />
              <span>Watch demos on YouTube @chatrindia</span>
            </a>
          </div>

        </div>

        {/* Footer Sub-bar */}
        <div className="mt-12 pt-8 border-t border-[#DDE3DF]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#53605C]">
          <div className="flex items-center gap-2.5">
            <img 
              src="/images/chatr-official-logo.png" 
              alt="CHATR" 
              className="h-5 w-auto object-contain"
            />
            <span className="text-[10px] font-bold text-[#164E3F] tracking-wider uppercase">INTENT OS</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} TalentXcel Services Pvt Ltd</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a 
              href="https://www.youtube.com/@chatrindia" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-stone-700 hover:text-red-600 font-semibold transition-colors"
            >
              <Youtube className="w-4 h-4 text-red-600 fill-current" />
              <span>YouTube @chatrindia</span>
            </a>
            <a href="/privacy" className="hover:text-[#111817] transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-[#111817] transition-colors">Terms of Service</a>
            <a href="/contact" className="hover:text-[#111817] transition-colors">Contact</a>
            <a href="/help" className="hover:text-[#111817] transition-colors">Help</a>
          </div>
        </div>

      </div>
    </section>
  );
};
