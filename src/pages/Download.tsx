import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Smartphone, 
  Monitor, 
  Download as DownloadIcon,
  CheckCircle2,
  Shield,
  Zap,
  Cpu,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import logo from '@/assets/chatr-logo.png';

export default function Download() {
  const navigate = useNavigate();
  const appUrl = window.location.origin;
  const [downloadingOS, setDownloadingOS] = useState<string | null>(null);

  const handleDownloadExecutable = async (filename: string, osLabel: string) => {
    setDownloadingOS(osLabel);

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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
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
            className="border-slate-700 hover:bg-slate-800 text-slate-300"
          >
            Open Web App
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-12 py-12">
        
        {/* Claude Desktop-inspired Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-indigo-400 bg-clip-text text-transparent leading-tight">
            Do more with CHATR, everywhere you work
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Chat, cowork, and automate in one sovereign app. CHATR Desktop works with your local files, private AI models, voice, and browser tabs.
          </p>
        </div>

        {/* Claude Desktop Card Showcase */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Download Info */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> CHATR Desktop
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              The Sovereign Local AI Workspace
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Run offline AI models, parse local documents privately, execute voice commands, and power multi-step agent workflows 100% on your device hardware.
            </p>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={() => handleDownloadExecutable('chatr-desktop-setup.exe', 'Windows')}
                className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3"
              >
                <DownloadIcon className="w-5 h-5" />
                Download for Windows
              </Button>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleDownloadExecutable('chatr-desktop.dmg', 'macOS')}
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs"
                >
                  macOS (.dmg)
                </Button>
                <Button
                  onClick={() => handleDownloadExecutable('chatr-desktop.AppImage', 'Linux')}
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs"
                >
                  Linux (.AppImage)
                </Button>
              </div>

              {downloadingOS && (
                <div className="p-3 bg-cyan-950/70 border border-cyan-700/60 rounded-xl text-cyan-300 text-xs flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  Downloading CHATR Desktop for {downloadingOS}... Please run installer executable.
                </div>
              )}
            </div>

            {/* SmartScreen Helper Notice */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Info className="w-4 h-4" /> Windows SmartScreen Notice
              </div>
              <p className="text-slate-400 leading-relaxed">
                If Windows Defender SmartScreen displays <span className="text-slate-200 font-medium font-mono">"Windows protected your PC"</span>:
              </p>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">1. Click "More info"</span>
                <span>→</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">2. Click "Run anyway"</span>
              </div>
            </div>

          </div>

          {/* Right Column: Claude Desktop Style Floating Prompt Cards */}
          <div className="lg:col-span-6 space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 relative">
            <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-4">
              Local AI Capabilities Preview
            </div>

            {/* Prompt Bubble 1 */}
            <div className="bg-slate-900 border border-slate-700/70 p-4 rounded-2xl shadow-lg flex items-start gap-3 transform hover:-translate-y-1 transition-transform">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">"Parse these Q3 contract PDFs locally"</p>
                <p className="text-[11px] text-slate-400">100% offline RAG vector index over your Documents folder.</p>
              </div>
            </div>

            {/* Prompt Bubble 2 */}
            <div className="bg-slate-900 border border-slate-700/70 p-4 rounded-2xl shadow-lg flex items-start gap-3 transform hover:-translate-y-1 transition-transform ml-4">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">"Turn receipts into an expense report"</p>
                <p className="text-[11px] text-slate-400">Automates file scanning using local vision LLM models.</p>
              </div>
            </div>

            {/* Prompt Bubble 3 */}
            <div className="bg-slate-900 border border-slate-700/70 p-4 rounded-2xl shadow-lg flex items-start gap-3 transform hover:-translate-y-1 transition-transform">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">"Screen candidates privately with local LLM"</p>
                <p className="text-[11px] text-slate-400">Zero cloud API costs. Complete data sovereignty.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile & Web Secondary Section */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-6">
          {/* Mobile */}
          <Card className="bg-slate-900/60 border border-slate-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">CHATR Mobile</h3>
                  <p className="text-xs text-slate-400">Android & iOS</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => window.open('https://play.google.com/store', '_blank')} variant="outline" className="border-slate-700 text-xs">
                  Download for Android
                </Button>
                <Button onClick={() => window.open('https://www.apple.com/app-store/', '_blank')} variant="outline" className="border-slate-700 text-xs">
                  Download for iPhone
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Web */}
          <Card className="bg-slate-900/60 border border-slate-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                  <Monitor className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">CHATR Web</h3>
                  <p className="text-xs text-slate-400">Cloud AI Tier</p>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Access basic cloud chat directly from modern web browsers.
              </p>

              <Button onClick={() => navigate('/auth')} variant="secondary" className="w-full text-xs">
                Open Browser App
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
