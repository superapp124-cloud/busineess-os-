import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Monitor, 
  Download as DownloadIcon,
  CheckCircle2,
  Sparkles,
  Info,
  ExternalLink,
  Bot,
  Layers,
  FileSpreadsheet,
  Presentation,
  FileText,
  Mail,
  MessageSquare
} from 'lucide-react';
import logo from '@/assets/chatr-logo.png';
import { ClaudeInstallerModal } from '@/components/desktop/ClaudeInstallerModal';

export default function Download() {
  const navigate = useNavigate();
  const [downloadingOS, setDownloadingOS] = useState<string | null>(null);
  const [showInstallerModal, setShowInstallerModal] = useState<boolean>(false);

  const handleDownloadExecutable = async (filename: string, osLabel: string) => {
    setDownloadingOS(osLabel);
    setShowInstallerModal(true);

    const downloadUrl = `/download/${filename}`;

    try {
      const res = await fetch(downloadUrl);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
    } catch (e) {
      console.warn('[Download] Blob download fallback:', e);
    }

    // Direct trigger fallback
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500 selection:text-black font-sans">
      
      {/* Navigation Header */}
      <div className="p-4 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logo} alt="CHATR Logo" className="h-8 object-contain" />
          </div>
          <Button 
            onClick={() => navigate('/auth')} 
            variant="outline"
            className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs"
          >
            Sign In / Sign Up
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-12 py-12">
        
        {/* Main Title Section (Claude Desktop Style) */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Do more with CHATR, everywhere you work
          </h1>
          <p className="text-base text-slate-400">
            Sovereign local AI, autonomous coworkers, and local file intelligence built for desktop.
          </p>
        </div>

        {/* Hero Card: Desktop Showcase */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Title, Subtitle, Download CTAs & SmartScreen helper */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                Desktop
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Chat, cowork, and code in one app. CHATR Desktop works with your files, local AI models, apps, and browser tabs.
              </p>
            </div>

            {/* Primary Download CTAs */}
            <div className="space-y-3">
              <Button
                onClick={() => handleDownloadExecutable('chatr-desktop-setup.cmd', 'Windows')}
                className="w-full sm:w-auto px-8 py-6 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all"
              >
                <DownloadIcon className="w-5 h-5 text-slate-900" />
                Download for Windows
              </Button>

              <div className="flex flex-wrap gap-2 text-xs">
                <Button
                  onClick={() => handleDownloadExecutable('chatr-desktop.dmg', 'macOS')}
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  macOS (.dmg)
                </Button>
                <Button
                  onClick={() => handleDownloadExecutable('chatr-desktop.AppImage', 'Linux')}
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  Linux (.AppImage)
                </Button>
              </div>

              {downloadingOS && (
                <div className="p-3 bg-cyan-950/70 border border-cyan-700/60 rounded-xl text-cyan-300 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  Downloading CHATR Desktop for {downloadingOS}... Run setup executable to finish.
                </div>
              )}
            </div>

            {/* SmartScreen Helper Notice */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <span>ℹ️</span> Windows SmartScreen Prompt?
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                If Windows Defender SmartScreen displays <span className="text-slate-200 font-mono">"Windows protected your PC"</span>:
              </p>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <span className="bg-slate-800 px-2 py-0.5 rounded font-mono">1. Click "More info"</span>
                <span>→</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded font-mono">2. Click "Run anyway"</span>
              </div>
            </div>

          </div>

          {/* Right Column: Floating Speech Bubble Preview (Matching Claude Desktop screenshot) */}
          <div className="lg:col-span-6 bg-slate-950/80 p-8 rounded-2xl border border-slate-800/80 relative min-h-[300px] flex flex-col justify-center gap-4">
            
            {/* Grid pattern background effect */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none rounded-2xl"></div>

            {/* Bubble 1 */}
            <div className="bg-slate-900 border border-slate-700/80 p-4 rounded-2xl shadow-xl max-w-xs self-start text-xs text-slate-200 font-medium relative z-10 hover:scale-105 transition-transform">
              💬 "My downloads folder is a mess! Can you clean it up?"
            </div>

            {/* Bubble 2 */}
            <div className="bg-slate-900 border border-slate-700/80 p-4 rounded-2xl shadow-xl max-w-xs self-end text-xs text-slate-200 font-medium relative z-10 hover:scale-105 transition-transform">
              📄 "Turn these receipts into an expense report"
            </div>

            {/* Bubble 3 */}
            <div className="bg-slate-900 border border-slate-700/80 p-4 rounded-2xl shadow-xl max-w-xs self-start text-xs text-slate-200 font-medium relative z-10 hover:scale-105 transition-transform">
              🔍 "Screen candidate resumes privately with local AI"
            </div>

          </div>

        </div>

        {/* 2-Card Grid Below (Matching Claude Desktop Screenshot) */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Card 1: Microsoft 365 & Workspace Integrations */}
          <Card className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
            <CardContent className="p-0 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Microsoft 365 & Workspace</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Analyze data, build presentations, draft documents, and triage your inbox with CHATR alongside you.
                </p>
              </div>

              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
                Connect Integrations
              </Button>

              <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-white">Excel</p>
                      <p className="text-[11px] text-slate-400">Financial formulas & automated spreadsheets</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Presentation className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="font-semibold text-white">PowerPoint</p>
                      <p className="text-[11px] text-slate-400">Slide generation & executive decks</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-semibold text-white">Word</p>
                      <p className="text-[11px] text-slate-400">Contracts, proposals, and offline document parsing</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="font-semibold text-white">Outlook & Gmail</p>
                      <p className="text-[11px] text-slate-400">Inbox triage, meeting scheduling, and smart reply</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: CHATR Design & Workflow Studio (Beta) */}
          <Card className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
            <CardContent className="p-0 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white">CHATR Studio</h3>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/40">Beta</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Build something you can click, share, or execute locally:
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✦</span>
                  <span><strong>Prototypes you can click</strong> — Interactive UI generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✦</span>
                  <span><strong>Wireframes from a sketch</strong> — Automatic layout conversion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✦</span>
                  <span><strong>Slides from your documents</strong> — PDF/Word to deck translation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✦</span>
                  <span><strong>Autonomous Workflows</strong> — Tool calls and sub-agent automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✦</span>
                  <span><strong>Zero-Cloud Sovereignty</strong> — 100% private data execution</span>
                </li>
              </ul>

              <div className="pt-6 border-t border-slate-800">
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs border border-slate-700"
                >
                  Explore Studio
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
