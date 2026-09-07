import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Workflow, BookOpen, CheckCircle2, ArrowRight, HelpCircle, 
  ChevronDown, Cpu, Sparkles, Layers, ShieldCheck, Zap
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getSemanticPageByPath, TERMINOLOGY_PAGES } from '@/data/chatrSearchUniverseData';

export const TerminologyPage: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const page = getSemanticPageByPath(currentPath) || TERMINOLOGY_PAGES[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": page.h1,
    "description": page.directAnswer,
    "inDefinedTermSet": "https://www.chatrchat.in/terminology",
    "url": `https://www.chatrchat.in${page.path}`
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
        {/* Header */}
        <header className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 font-extrabold text-lg tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                CHATR
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                TERMINOLOGY & CONCEPTS
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

        <main className="max-w-4xl mx-auto px-4 py-12 space-y-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-slate-600">/</span>
            <span className="text-indigo-400">Core Terminology</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200">{page.h1}</span>
          </nav>

          {/* Title & Tagline */}
          <section className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>OFFICIAL DEFINITION & ARCHITECTURE GUIDE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {page.h1}
            </h1>
            <p className="text-slate-300 text-lg md:text-xl font-normal leading-relaxed">
              {page.tagline}
            </p>
          </section>

          {/* The Definitive Answer Block (Citable for AI Overviews & SearchGPT) */}
          <section id="canonical-definition" className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                Official Definition
              </span>
              <span className="text-xs text-slate-400 font-mono">Published by CHATR Architecture</span>
            </div>
            <p className="text-white text-lg md:text-xl leading-relaxed font-semibold">
              {page.directAnswer}
            </p>
          </section>

          {/* Core Architectural Pillars */}
          <section className="space-y-6">
            <h2 className="text-2xl font-extrabold text-white">Key Architectural Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {page.keyCapabilities.map((cap, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200 leading-relaxed font-medium">{cap}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Tool Funnel */}
          {page.relatedTools && page.relatedTools.length > 0 && (
            <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Interactive Demonstration</span>
                <h3 className="text-xl font-bold text-white">Experience {page.h1} in Action</h3>
                <p className="text-slate-400 text-sm">Test the runtime capabilities directly in your browser with our free interactive tool.</p>
              </div>
              <div className="pt-2">
                {page.relatedTools.map((t, idx) => (
                  <Link
                    key={idx}
                    to={t.path}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all"
                  >
                    <span>Launch {t.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Frequently Asked Questions */}
          {page.faqs && page.faqs.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
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

          {/* Cross-Link Hubs */}
          <section className="pt-8 border-t border-slate-800 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Related Pillars & Products</span>
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
        </main>
      </div>
    </>
  );
};

export default TerminologyPage;
