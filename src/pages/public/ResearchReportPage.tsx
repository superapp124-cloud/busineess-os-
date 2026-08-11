import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BarChart3, Database, FileSpreadsheet, ShieldCheck, Quote, Copy, Check } from 'lucide-react';
import { RESEARCH_REPORTS } from '@/data/researchReportsData';
import { AUTHORS } from '@/data/authorsData';

export const ResearchReportPage: React.FC = () => {
  const location = useLocation();
  const report = RESEARCH_REPORTS.find(r => r.path === location.pathname);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  useEffect(() => {
    if (!report) return;
    document.title = ${report.title} — CHATR & TalentXcel Research;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', report.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', https://chatrchat.in);

    const scholarlySchema = {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      headline: report.title,
      description: report.description,
      datePublished: report.publishDate,
      author: {
        '@type': 'Person',
        name: 'Sanobar Jahan',
        jobTitle: 'Founder, TalentXcel & CHATR | HR & Education Strategist',
        url: 'https://chatrchat.in/authors/sanobar-jahan'
      },
      publisher: {
        '@type': 'Organization',
        name: 'CHATR Communication OS & TalentXcel Research',
        url: 'https://chatrchat.in'
      }
    };

    const s = document.createElement('script');
    s.id = 'research-report-schema';
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(scholarlySchema);
    if (!document.getElementById('research-report-schema')) document.head.appendChild(s);

    return () => {
      const el = document.getElementById('research-report-schema');
      if (el) el.remove();
    };
  }, [report]);

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-400">Research report not found.</p>
          <Link to="/" className="text-indigo-400 hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-sm text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> CHATR & TalentXcel Research Lab
          </Link>
          <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-semibold">
            First-Party Telemetry Report
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Title & Metadata */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" /> Published {report.publishDate} • {report.author}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">{report.title}</h1>
          <p className="text-lg text-slate-300 leading-relaxed font-light">{report.subtitle}</p>
        </div>

        {/* Dataset Parameters Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Database className="w-4 h-4" /> Dataset Parameters
            </div>
            <p className="text-sm font-semibold text-white">{report.datasetSize}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Verification Methodology
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{report.methodology}</p>
          </div>
        </div>

        {/* Key Research Findings */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Key Empirical Findings
          </h2>
          <div className="space-y-3">
            {report.keyFindings.map((finding, idx) => (
              <div key={idx} className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-5 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-slate-200 text-sm leading-relaxed">{finding}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benchmark Data Table */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Empirical Telemetry Benchmark Table
          </div>
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Operational Metric</th>
                  <th className="p-4">CHATR / TalentXcel Telemetry</th>
                  <th className="p-4">Industry Baseline Benchmark</th>
                  <th className="p-4">Operational Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                {report.dataTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-white">{row.metric}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">{row.value}</td>
                    <td className="p-4 font-mono text-slate-400">{row.benchmark}</td>
                    <td className="p-4 text-slate-300 leading-relaxed">{row.insight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Citation Box for Academic & Journalist Attribution */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Quote className="w-4 h-4 text-indigo-400" /> Academic & Journalist Citation Standards
          </div>
          <p className="text-slate-400 text-xs">
            Researchers, journalists, and industry analysts may cite this report using the verified academic citation formats below:
          </p>

          <div className="space-y-3 pt-2">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>APA Style Citation</span>
                <button onClick={() => copyToClipboard(report.citationApa, 'apa')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  {copiedFormat === 'apa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormat === 'apa' ? 'Copied' : 'Copy APA'}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-slate-300 select-all leading-relaxed">{report.citationApa}</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>BibTeX Format</span>
                <button onClick={() => copyToClipboard(report.citationBibtex, 'bibtex')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  {copiedFormat === 'bibtex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormat === 'bibtex' ? 'Copied' : 'Copy BibTeX'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-300 select-all whitespace-pre-wrap leading-relaxed">{report.citationBibtex}</pre>
            </div>
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
      </main>
    </div>
  );
};

export default ResearchReportPage;
