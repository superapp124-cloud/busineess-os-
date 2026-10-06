import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileSpreadsheet, Quote, ShieldCheck, Download, 
  ExternalLink, Mail, Copy, Check, Info 
} from 'lucide-react';
import { RESEARCH_REPORTS } from '../../data/researchReportsData';
import { EVIDENCE_GRAPH } from '../../services/evidenceGraphEngine';
import { AUTHORS } from '../../data/authorsData';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export const ResearchMediaKitPage: React.FC = () => {
  const navigate = useNavigate();
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session?.user) setIsAuthenticated(true);
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setIsAuthenticated(true);
        setAuthModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

  const copyToClipboard = (text: string, formatId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatId);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Media & Journalist Data Room — CHATR & TalentXcel Research"
        description="Media & Journalist Data Room providing verified recruitment communication benchmarks, lead response latency data, and SI parser accuracy datasets for press coverage."
        canonicalUrl="https://chatrchat.in/research/media-kit"
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-12">
        {/* Title & Introduction */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-[#164E3F] text-xs font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Journalist & Analyst Resource Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111817] tracking-tight">
            Media & Journalist Data Room
          </h1>
          <p className="text-base sm:text-lg text-[#53605C] leading-relaxed">
            Verified first-party telemetry benchmarks, one-page data sheets, approved quotes, and statistical citations for journalists, HR analysts, and tech researchers.
          </p>
        </div>

        {/* Executive Summary Metrics Box */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 grid sm:grid-cols-3 gap-6 text-xs shadow-sm">
          <div className="space-y-1">
            <span className="text-[#83918C] font-semibold uppercase tracking-wider text-[11px]">Active Telemetry Reports</span>
            <p className="font-mono text-[#111817] font-bold text-lg">3 Published Benchmarks</p>
          </div>
          <div className="space-y-1">
            <span className="text-[#83918C] font-semibold uppercase tracking-wider text-[11px]">Total Evaluated Dataset</span>
            <p className="font-mono text-[#164E3F] font-bold text-lg">257,500 Observations</p>
          </div>
          <div className="space-y-1">
            <span className="text-[#83918C] font-semibold uppercase tracking-wider text-[11px]">Citation Licensing</span>
            <p className="text-[#53605C] font-medium text-sm">Creative Commons CC-BY 4.0</p>
          </div>
        </section>

        {/* Quotable Findings Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-[#111817] text-xl">
              <Quote className="w-5 h-5 text-[#164E3F]" />
              <h2>Quotable Research Findings Namespace</h2>
            </div>
            <span className="text-xs text-[#83918C] font-mono hidden sm:inline">Traceable Evidence</span>
          </div>

          <div className="space-y-4">
            {EVIDENCE_GRAPH.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#164E3F] font-bold">{item.findingId}</span>
                  <span className="text-[#164E3F] bg-[#E8F0EB] border border-[#164E3F]/20 px-2.5 py-0.5 rounded-full font-semibold">
                    {item.sampleSize}
                  </span>
                </div>
                <p className="text-base text-[#111817] leading-relaxed font-medium">"{item.claimText}"</p>
                <div className="flex flex-wrap items-center justify-between text-xs text-[#53605C] pt-3 border-t border-[#DDE3DF] gap-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#164E3F]" />
                    <span>Claim Type: <strong className="text-[#111817]">{item.claimType}</strong> ({item.confidenceInterval || 'Verified Test'})</span>
                  </span>
                  <Link to={item.reportPath} className="text-[#164E3F] hover:underline flex items-center gap-1 font-semibold">
                    View Methodology & Limitations <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Frictionless Citation Cards */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 text-[#111817] font-bold text-xl">
            <Quote className="w-5 h-5 text-[#164E3F]" />
            <h2>Frictionless Citation Cards for Journalists</h2>
          </div>

          <div className="space-y-6">
            {RESEARCH_REPORTS.map((rep, idx) => (
              <div key={idx} className="bg-white border border-[#DDE3DF] rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between border-b border-[#DDE3DF] pb-4 gap-2">
                  <div>
                    <span className="text-xs font-mono text-[#164E3F] font-bold uppercase">{rep.researchId}</span>
                    <h3 className="text-lg font-bold text-[#111817]">{rep.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-[#164E3F] bg-[#E8F0EB] border border-[#164E3F]/20 px-3 py-1 rounded-full font-semibold">
                    {rep.doiStatus}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4">
                  <div><span className="text-[#83918C]">Author:</span> <span className="text-[#111817] font-semibold">Sanobar Jahan; TalentXcel & CHATR Research Team</span></div>
                  <div><span className="text-[#83918C]">Published:</span> <span className="text-[#111817]">August 2026</span></div>
                  <div><span className="text-[#83918C]">Version:</span> <span className="text-[#164E3F] font-bold">{rep.version}</span></div>
                  <div><span className="text-[#83918C]">Canonical URL:</span> <a href={`https://chatrchat.in${rep.path}`} target="_blank" rel="noreferrer" className="text-[#164E3F] hover:underline truncate inline-block max-w-[200px]">https://chatrchat.in{rep.path}</a></div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => copyToClipboard(rep.citationApa, `apa-${idx}`)}
                    className="bg-[#FAFBF9] hover:bg-white border border-[#DDE3DF] text-[#111817] p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Copy APA Citation</span>
                    {copiedFormat === `apa-${idx}` ? <Check className="w-4 h-4 text-[#164E3F]" /> : <Copy className="w-4 h-4 text-[#83918C]" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(rep.citationBibtex, `bib-${idx}`)}
                    className="bg-[#FAFBF9] hover:bg-white border border-[#DDE3DF] text-[#111817] p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Copy BibTeX Citation</span>
                    {copiedFormat === `bib-${idx}` ? <Check className="w-4 h-4 text-[#164E3F]" /> : <Copy className="w-4 h-4 text-[#83918C]" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Media Downloads & Data Sheets */}
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-[#111817] flex items-center gap-2">
            <Download className="w-5 h-5 text-[#164E3F]" />
            <span>Journalist Data Sheets & Reports</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            {RESEARCH_REPORTS.map((rep, idx) => (
              <div key={idx} className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-3 flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  <span className="text-[#164E3F] font-mono font-bold text-[11px]">{rep.researchId}</span>
                  <h3 className="font-bold text-[#111817] text-sm leading-snug">{rep.title}</h3>
                  <p className="text-[#53605C] text-xs leading-relaxed line-clamp-3">{rep.description}</p>
                </div>
                <Link to={rep.path} className="text-[#164E3F] hover:underline font-semibold flex items-center gap-1 pt-2">
                  Read Data Sheet →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Press Desk Inquiries */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#111817] text-base">
            <Mail className="w-4 h-4 text-[#164E3F]" />
            <span>Media Desk & Research Inquiries</span>
          </div>
          <p className="text-[#53605C] text-xs sm:text-sm leading-relaxed">
            Journalists requiring custom data breakdowns, expert commentary on Indian hiring trends, or raw methodology access can contact our primary research desk:
          </p>
          <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2">
            <span className="text-[#111817] font-medium">Sanobar Jahan (Founder & Chief Strategist)</span>
            <span className="text-[#164E3F] font-bold">press@chatrchat.in</span>
          </div>
        </section>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default ResearchMediaKitPage;
