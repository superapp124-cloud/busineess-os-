import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, ChevronDown, 
  Layers, Activity, Zap, Cpu, PhoneCall, MessageSquare, Fingerprint, 
  Workflow, Globe, Lock, Check
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getSemanticPageByPath, AUTHORITY_PAGES } from '@/data/chatrSearchUniverseData';

export const AuthorityPage: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const page = getSemanticPageByPath(currentPath) || AUTHORITY_PAGES[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  const getUniverseIcon = (universe: string) => {
    switch (universe) {
      case 'calling': return <PhoneCall className="w-5 h-5 text-emerald-400" />;
      case 'communication': return <MessageSquare className="w-5 h-5 text-indigo-400" />;
      case 'identity': return <Fingerprint className="w-5 h-5 text-cyan-400" />;
      case 'ai': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'intent-os': return <Workflow className="w-5 h-5 text-amber-400" />;
      case 'robotics-os': return <Cpu className="w-5 h-5 text-amber-400" />;
      default: return <Layers className="w-5 h-5 text-indigo-400" />;
    }
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": page.title,
    "headline": page.h1,
    "description": page.description,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Windows, macOS, Android, iOS",
    "url": `https://www.chatrchat.in${page.path}`,
    "provider": {
      "@type": "Organization",
      "name": "CHATR Intent OS",
      "url": "https://www.chatrchat.in"
    }
  };

  return (
    <>
      <SEOHead
        title={page.title}
        description={page.description}
        keywords={page.keywords}
        schemaData={schemaData}
      />
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
        {/* Universal Authority Header */}
        <header className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 font-extrabold text-lg tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                CHATR
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {page.universe.toUpperCase()}
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/pricing" className="text-xs text-slate-300 hover:text-white font-medium transition-colors">
                Pricing
              </Link>
              <Link
                to="/auth"
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-600/20"
              >
                Launch Workspace
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-slate-600">/</span>
            <span className="text-indigo-400 capitalize">{page.universe} Universe</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200">{page.h1}</span>
          </nav>

          {/* Hero Section */}
          <section className="space-y-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              {getUniverseIcon(page.universe)}
              <span>AUTHORITY PILLAR • {page.universe.toUpperCase()}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
              {page.h1}
            </h1>
            <p className="text-slate-300 text-lg md:text-xl font-normal leading-relaxed">
              {page.tagline}
            </p>
          </section>

          {/* Direct-Answer Definition Block (GEO / AI Overviews & SearchGPT Target) */}
          <section id="direct-answer" className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                Direct Search Definition
              </span>
              <span className="text-xs text-slate-400 font-mono">Verified Canonical Answer</span>
            </div>
            <p className="text-slate-100 text-base md:text-lg leading-relaxed font-medium">
              {page.directAnswer}
            </p>
          </section>

          {/* Interactive Digital Twin Simulator Link (For Robotics Pages) */}
          {page.universe === 'robotics-os' && (
            <section className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 text-left">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded">
                  <span>LIVE DIGITAL TWIN</span>
                  <span>•</span>
                  <span>MUJOCO 29-DOF COCKPIT</span>
                </div>
                <h3 className="text-xl font-bold text-white">Experience CHATR RobotOS Simulator</h3>
                <p className="text-sm text-slate-300 max-w-xl">
                  Interact with the live 3D humanoid avatar, real-time joint velocity telemetry, voice command loop, and spatial safety governor.
                </p>
              </div>
              <Link
                to="/robotos"
                className="shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm inline-flex items-center gap-2"
              >
                Launch 3D Cockpit <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          )}

          {/* Performance Metrics Matrix */}
          {page.metrics && page.metrics.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {page.metrics.map((m, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                  <div className="text-3xl md:text-4xl font-black text-indigo-400">{m.value}</div>
                  <p className="text-xs text-slate-400">{m.context}</p>
                </div>
              ))}
            </section>
          )}

          {/* Core Architectural Capabilities */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Platform Capabilities & Core Architecture</h2>
              <p className="text-slate-400 text-sm">Engineered for mission-critical reliability, sub-50ms execution, and multi-channel synchronization.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {page.keyCapabilities.map((cap, idx) => (
                <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex items-start gap-3 hover:border-slate-700 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200 leading-relaxed font-medium">{cap}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Native CHATR Interactive Tools */}
          {page.relatedTools && page.relatedTools.length > 0 && (
            <section className="space-y-6 bg-slate-900/30 border border-slate-800 rounded-2xl p-8">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Zero Setup • Client-Side Execution</span>
                <h2 className="text-2xl font-bold text-white">Related Interactive Tools</h2>
                <p className="text-slate-400 text-sm">Launch native browser tools powered by CHATR Infrastructure with zero registration required.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {page.relatedTools.map((tool, idx) => (
                  <Link
                    key={idx}
                    to={tool.path}
                    className="group bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 space-y-3 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{tool.name}</span>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{tool.description}</p>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-400 font-semibold pt-2 border-t border-slate-900">
                      Open Tool →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Frequently Asked Questions */}
          {page.faqs && page.faqs.length > 0 && (
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-sm">Key architectural and operational questions regarding {page.h1}.</p>
              </div>
              <div className="space-y-3">
                {page.faqs.map((faq, idx) => (
                  <details key={idx} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50 p-5 text-sm group" open={idx === 0}>
                    <summary className="font-semibold text-slate-200 cursor-pointer list-none flex items-center justify-between">
                      <span>{faq.q}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Cross-Universe Authority Navigation */}
          {page.relatedPages && page.relatedPages.length > 0 && (
            <section className="pt-8 border-t border-slate-800 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Explore The CHATR Universe</span>
              <div className="flex flex-wrap gap-3">
                {page.relatedPages.map((rp, idx) => (
                  <Link
                    key={idx}
                    to={rp.path}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-1.5"
                  >
                    <span>{rp.title}</span>
                    <span className="text-indigo-400">→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Conversion Hero CTA */}
          <section className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 md:p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Experience the Future of Business Execution
            </h2>
            <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Eliminate software silos, centralize communication, and empower your team with the CHATR Intent Operating System.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/auth"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-600/30 text-sm inline-flex items-center gap-2"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm"
              >
                View Plans & Pricing
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default AuthorityPage;
