import React from 'react';
import { Smartphone, Monitor, Globe } from 'lucide-react';

export const AppDownloadStrip: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  return (
    <section className="bg-[#164E3F] py-10 px-4">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          CHATR is everywhere you are
        </h2>
        <p className="text-sm text-[#A7D7C5] max-w-xl mx-auto">
          Web, Android, iPhone, Windows desktop — one account, all your devices.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-[#164E3F] font-semibold text-sm hover:bg-[#F0FAF8] transition-colors shadow"
          >
            <Globe className="w-4 h-4" />
            Open in Browser
          </button>
          <a
            href="https://play.google.com/store/apps/details?id=in.chatrchat.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            Android
          </a>
          <a
            href="https://apps.apple.com/app/chatr/id123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            iPhone
          </a>
          <a
            href="/download"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
          >
            <Monitor className="w-4 h-4" />
            Windows Desktop
          </a>
        </div>
        <p className="text-[11px] text-[#A7D7C5]">
          Free forever · No credit card · Works in 100+ countries
        </p>
      </div>
    </section>
  );
};
