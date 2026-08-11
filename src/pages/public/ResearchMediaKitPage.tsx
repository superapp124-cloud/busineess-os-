import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, Quote, ShieldCheck, Download, ExternalLink, Mail, Copy, Check, Info } from 'lucide-react';
import { RESEARCH_REPORTS } from '../../data/researchReportsData';
import { EVIDENCE_GRAPH } from '../../services/evidenceGraphEngine';
import { AUTHORS } from '../../data/authorsData';

export const ResearchMediaKitPage: React.FC = () => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Media & Journalist Data Room — CHATR & TalentXcel Research';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', 'Media & Journalist Data Room providing verified recruitment communication benchmarks, lead response latency data, and AI parser accuracy datasets for press coverage.');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://chatrchat.in/research/media-kit');
  }, []);

  const copyToClipboard = (text: string, formatId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatId);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-sm text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> CHATR & TalentXcel Research Lab
          </Link>
          <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-semibold">
            Press & Media Data Room
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Title & Introduction */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" /> Journalist & Analyst Resource Hub
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">Media & Journalist Data Room</h1>
          <p className="text-lg text-slate-300 leading-relaxed font-light">
            Verified first-party telemetry benchmarks, one-page data sheets, approved quotes, and statistical citations for journalists, HR analysts, and tech researchers.
          </p>
        </div>

        {/* Executive Data Room Features Box */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Active Telemetry Reports</span>
            <p className="font-mono text-white font-bold text-base">3 Published Benchmarks</p>
          </div>
          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Total Evaluated Dataset</span>
            <p className="font-mono text-emerald-400 font-bold text-base">257,500 Observations</p>
          </div>
          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Citation Licensing</span>
            <p className="text-slate-300 font-medium">Creative Commons CC-BY 4.0</p>
          </div>
        </section>

        {/* Quotable Findings Table for Media */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-xl">
              <Quote className="w-5 h-5 text-indigo-400" /> Quotable Research Findings Namespace
            </div>
            <span className="text-xs text-slate-400 font-mono">Traceable Evidence Namespace</span>
          </div>

          <div className="space-y-3">
            {EVIDENCE_GRAPH.map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-indigo-400 font-bold">{item.findingId}</span>
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">{item.sampleSize}</span>
                </div>
                <p className="text-sm text-slate-100 leading-relaxed font-medium">"{item.claimText}"</p>
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Claim Type: <strong className="text-white">{item.claimType}</strong> ({item.confidenceInterval || 'Verified Test'})
                  </span>
                  <Link to={item.reportPath} className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                    View Methodology & Limitations <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Frictionless "Cite This Research" Block for Journalists */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Quote className="w-5 h-5 text-emerald-400" /> Frictionless Citation Cards for Journalists
          </div>

          <div className="space-y-6">
            {RESEARCH_REPORTS.map((rep, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <span className="text-xs font-mono text-indigo-400 font-bold uppercase">{rep.researchId}</span>
                    <h3 className="text-lg font-bold text-white">{rep.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                    {rep.doiStatus}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div><span className="text-slate-400">Author:</span> <span className="text-white font-semibold">Sanobar Jahan; TalentXcel & CHATR Research Team</span></div>
                  <div><span className="text-slate-400">Published:</span> <span className="text-slate-200">August 2026</span></div>
                  <div><span className="text-slate-400">Version:</span> <span className="text-emerald-400">{rep.version}</span></div>
                  <div><span className="text-slate-400">Canonical URL:</span> <a href={`https://chatrchat.in${rep.path}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline truncate inline-block max-w-[200px]">https://chatrchat.in{rep.path}</a></div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => copyToClipboard(rep.citationApa, `apa-${idx}`)}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
                  >
                    <span>Copy APA Citation</span>
                    {copiedFormat === `apa-${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(rep.citationBibtex, `bib-${idx}`)}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
                  >
                    <span>Copy BibTeX Citation</span>
                    {copiedFormat === `bib-${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Media Downloads & Data Sheets */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" /> Journalist Data Sheets & Reports
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-xs">
            {RESEARCH_REPORTS.map((rep, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-indigo-400 font-mono font-bold text-xxs">{rep.researchId}</span>
                  <h3 className="font-bold text-white text-sm leading-snug">{rep.title}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2">{rep.description}</p>
                </div>
                <Link to={rep.path} className="text-indigo-400 hover:underline font-semibold flex items-center gap-1 pt-2">
                  Read Data Sheet →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Editorial & Media Contacts */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Mail className="w-4 h-4 text-indigo-400" /> Media Desk & Research Inquiries
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            Journalists requiring custom data breakdowns, expert commentary on Indian hiring trends, or raw methodology access can contact our primary research desk:
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Sanobar Jahan (Founder & Chief Strategist)</span>
            <span className="text-indigo-400 font-bold">press@chatrchat.in</span>
          </div>
        </section>

        {/* Author Attribution Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-lg shrink-0">
            S
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">{AUTHORS['sanobar-jahan'].name}</h3>
              <Link to="/authors/sanobar-jahan" className="text-xs text-indigo-400 hover:underline font-semibold">View Profile →</Link>
            </div>
            <p className="text-xs text-indigo-400 font-semibold">{AUTHORS['sanobar-jahan'].role}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{AUTHORS['sanobar-jahan'].bio}</p>
          </div>
        </section>
        {/* Contextual Product Section */}
        <section className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-5 space-y-3 text-xs text-slate-300">
          <p className="font-semibold text-white text-sm">About the platform behind this research</p>
          <p>This benchmark data is derived from first-party telemetry collected across <Link to="/chatr/ai" className="text-indigo-400 font-semibold hover:underline">CHATR AI</Link> deployments in Indian SME and recruitment agency environments. The AI systems measured include Message Triage, Candidate Screening, and Auto-Responder capabilities.</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link to="/chatr/ai" className="text-indigo-400 font-semibold hover:underline">Explore CHATR AI Platform →</Link>
            <Link to="/pricing" className="text-slate-400 hover:text-slate-200 font-semibold hover:underline">View Commercial Plans →</Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResearchMediaKitPage;
