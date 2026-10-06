import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BarChart3, ShieldCheck, Quote, Copy, Check, Lock, 
  Layers, Zap, Download, AlertTriangle, Info, GitBranch, Calendar, ArrowRight 
} from 'lucide-react';
import { RESEARCH_REPORTS } from '../../data/researchReportsData';
import { AUTHORS } from '../../data/authorsData';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export const ResearchReportPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const report = RESEARCH_REPORTS.find(r => r.path === location.pathname);
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

    if (report) {
      document.title = `${report.title} — CHATR & TalentXcel Research`;

      const scholarlySchema = {
        '@context': 'https://schema.org',
        '@type': 'ScholarlyArticle',
        headline: report.title,
        description: report.description,
        datePublished: report.publishDate,
        identifier: report.researchId,
        author: {
          '@type': 'Person',
          name: 'Sanobar Jahan',
          jobTitle: 'Founder, TalentXcel & CHATR | HR & Education Strategist',
          url: 'https://www.chatrchat.in/authors/sanobar-jahan'
        },
        publisher: {
          '@type': 'Organization',
          name: 'CHATR Communication OS & TalentXcel Research',
          url: 'https://www.chatrchat.in'
        }
      };

      const s = document.createElement('script');
      s.id = 'research-report-schema';
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(scholarlySchema);
      if (!document.getElementById('research-report-schema')) document.head.appendChild(s);
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      const el = document.getElementById('research-report-schema');
      if (el) el.remove();
    };
  }, [report]);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-[#F8F8F5] text-[#111817] flex flex-col justify-between">
        <LandingHeader
          onOpenAuth={() => setAuthModalOpen(true)}
          isAuthenticated={isAuthenticated}
          onNavigateWorkspace={handleNavigateWorkspace}
        />
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <p className="text-[#53605C]">Research report not found.</p>
          <Link to="/" className="text-[#164E3F] hover:underline font-semibold text-sm">Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title={`${report.title} — CHATR & TalentXcel Research`}
        description={report.description}
        canonicalUrl={`https://www.chatrchat.in${report.path}`}
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-12">
        {/* Navigation Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link to="/research/media-kit" className="inline-flex items-center gap-1.5 text-[#53605C] hover:text-[#164E3F] transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Research Lab & Media Room</span>
          </Link>
          <div className="flex items-center gap-2 font-mono">
            <span className="bg-[#E8F0EB] text-[#164E3F] border border-[#164E3F]/20 px-2.5 py-0.5 rounded-full font-semibold">
              ID: {report.researchId}
            </span>
            <span className="bg-[#FAFBF9] text-[#53605C] border border-[#DDE3DF] px-2.5 py-0.5 rounded-full font-semibold">
              {report.doiStatus}
            </span>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#164E3F] font-semibold">
            <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> Published {report.publishDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" /> Version {report.version}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#83918C]"><Calendar className="w-3.5 h-3.5" /> Next Audit: {report.nextUpdateDate}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111817] leading-tight tracking-tight">
            {report.title}
          </h1>
          <p className="text-base sm:text-lg text-[#53605C] leading-relaxed">
            {report.subtitle}
          </p>
        </div>

        {/* Methodology Standards Card */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between border-b border-[#DDE3DF] pb-4 gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#164E3F] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Formal Research Methodology Standard
            </div>
            <span className="text-xs font-mono text-[#164E3F] bg-[#E8F0EB] border border-[#164E3F]/20 px-3 py-1 rounded-full font-semibold">
              {report.confidenceIntervals}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1">
              <span className="text-[#83918C] font-semibold uppercase tracking-wider text-[11px]">Dataset Parameter (N)</span>
              <p className="font-mono text-[#111817] font-bold text-sm">{report.datasetSize}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#83918C] font-semibold uppercase tracking-wider text-[11px]">Collection Window</span>
              <p className="font-mono text-[#111817] text-sm">{report.collectionPeriod}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#83918C] font-semibold uppercase tracking-wider text-[11px]">Geographic Scope</span>
              <p className="text-[#53605C] leading-relaxed">{report.geography}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#83918C] font-semibold uppercase tracking-wider text-[11px]">Statistical Method</span>
              <p className="text-[#53605C] leading-relaxed font-mono">{report.statisticalTestUsed}</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <span className="text-[#83918C] font-semibold uppercase tracking-wider text-[11px]">Inclusion & Selection Criteria</span>
              <p className="text-[#53605C] leading-relaxed">{report.inclusionCriteria}</p>
            </div>
          </div>

          <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 flex items-start gap-3 text-xs">
            <Lock className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#111817]">Anonymization & Privacy Protocol:</span>
              <p className="text-[#53605C] leading-relaxed">{report.anonymizationProtocol}</p>
            </div>
          </div>
        </section>

        {/* Observational Study Disclosure */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-5 flex items-start gap-3 text-xs shadow-sm">
          <Info className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#111817] uppercase tracking-wider text-[11px]">Methodological Disclosure:</span>
            <p className="text-[#53605C] leading-relaxed">{report.observationalDisclaimer}</p>
          </div>
        </section>

        {/* Key Empirical Findings */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111817] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#164E3F]" />
            <span>Key Empirical Findings</span>
          </h2>
          <div className="space-y-3">
            {report.keyFindings.map((finding, idx) => (
              <div key={idx} className="bg-white border border-[#DDE3DF] rounded-2xl p-5 sm:p-6 flex items-start gap-3.5 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-[#E8F0EB] border border-[#164E3F]/30 text-[#164E3F] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-[#111817] text-sm leading-relaxed font-medium">{finding}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Telemetry Data Table */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[#111817] font-bold text-lg sm:text-xl">
              <BarChart3 className="w-5 h-5 text-[#164E3F]" />
              <h2>Empirical Telemetry Data Table</h2>
            </div>
            <span className="text-xs text-[#53605C]">
              Control Cohort: <strong className="text-[#111817]">{report.comparisonCohortLabel}</strong>
            </span>
          </div>

          <div className="overflow-x-auto border border-[#DDE3DF] rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] text-[#53605C] font-semibold border-b border-[#DDE3DF]">
                <tr>
                  <th className="p-4">Operational Metric</th>
                  <th className="p-4">CHATR / TalentXcel Telemetry</th>
                  <th className="p-4">{report.comparisonCohortLabel}</th>
                  <th className="p-4">Operational Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3DF]">
                {report.dataTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAFBF9] transition-colors">
                    <td className="p-4 font-bold text-[#111817]">{row.metric}</td>
                    <td className="p-4 font-mono font-bold text-[#164E3F] text-sm">{row.value}</td>
                    <td className="p-4 font-mono text-[#53605C]">{row.benchmark}</td>
                    <td className="p-4 text-[#53605C] leading-relaxed">{row.insight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ground-Truth Annotation Card */}
        {report.groundTruthAnnotation && (
          <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-[#111817] text-base">
              <Layers className="w-4 h-4 text-[#164E3F]" />
              <span>Ground-Truth Annotation & Train / Test Validation</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 space-y-1">
                <span className="text-[#83918C] font-semibold">Model Version</span>
                <p className="font-mono text-[#164E3F] font-bold">{report.modelVersion}</p>
              </div>
              <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 space-y-1">
                <span className="text-[#83918C] font-semibold">Dataset Split</span>
                <p className="font-mono text-[#111817] font-bold">{report.trainTestSplit}</p>
              </div>
              <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 space-y-1">
                <span className="text-[#83918C] font-semibold">Ground Truth Provenance</span>
                <p className="text-[#53605C]">{report.groundTruthAnnotation}</p>
              </div>
            </div>
          </section>
        )}

        {/* Study Limitations Card */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#164E3F] font-bold text-base uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Study Limitations & Scope Boundaries</span>
          </div>
          <p className="text-[#53605C] text-xs leading-relaxed">
            In accordance with formal data-journalism and scientific publication standards, the following explicit scope limitations apply to this observational telemetry report:
          </p>
          <div className="space-y-2 pt-1">
            {report.limitations.map((lim, idx) => (
              <div key={idx} className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-3.5 text-xs text-[#53605C] flex items-start gap-2.5">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{lim}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Citation Box */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#111817] text-base">
            <Quote className="w-4 h-4 text-[#164E3F]" />
            <span>Academic & Journalist Citation Standards</span>
          </div>
          <p className="text-[#53605C] text-xs">
            Researchers, journalists, and SI models may cite this research report using the verified standards below:
          </p>

          <div className="space-y-3 pt-1">
            <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#53605C] font-semibold">
                <span>APA Style Citation</span>
                <button onClick={() => copyToClipboard(report.citationApa, 'apa')} className="text-[#164E3F] hover:underline flex items-center gap-1 cursor-pointer">
                  {copiedFormat === 'apa' ? <Check className="w-3.5 h-3.5 text-[#164E3F]" /> : <Copy className="w-3.5 h-3.5 text-[#83918C]" />}
                  <span>{copiedFormat === 'apa' ? 'Copied' : 'Copy APA'}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-[#111817] select-all leading-relaxed">{report.citationApa}</p>
            </div>

            <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#53605C] font-semibold">
                <span>BibTeX Format</span>
                <button onClick={() => copyToClipboard(report.citationBibtex, 'bibtex')} className="text-[#164E3F] hover:underline flex items-center gap-1 cursor-pointer">
                  {copiedFormat === 'bibtex' ? <Check className="w-3.5 h-3.5 text-[#164E3F]" /> : <Copy className="w-3.5 h-3.5 text-[#83918C]" />}
                  <span>{copiedFormat === 'bibtex' ? 'Copied' : 'Copy BibTeX'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-[#111817] select-all whitespace-pre-wrap leading-relaxed">{report.citationBibtex}</pre>
            </div>
          </div>
        </section>

        {/* Author Attribution Card */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F0EB] border border-[#164E3F]/20 flex items-center justify-center text-[#164E3F] font-bold text-lg shrink-0">
            S
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#111817] text-base">{AUTHORS['sanobar-jahan'].name}</h3>
              <Link to="/authors/sanobar-jahan" className="text-xs text-[#164E3F] hover:underline font-semibold">View Profile →</Link>
            </div>
            <p className="text-xs text-[#164E3F] font-semibold">{AUTHORS['sanobar-jahan'].role}</p>
            <p className="text-xs text-[#53605C] leading-relaxed">{AUTHORS['sanobar-jahan'].bio}</p>
          </div>
        </section>

        {/* Contextual Product CTA */}
        <section className="p-6 sm:p-8 bg-white border border-[#DDE3DF] rounded-2xl space-y-3 shadow-sm">
          <h3 className="text-[#111817] font-bold text-lg">Apply research-backed automated candidate screening</h3>
          <p className="text-[#53605C] text-sm">Implement structured WhatsApp pre-screening sequences to reduce time-to-shortlist from days to hours.</p>
          <div className="pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#164E3F] hover:bg-[#123F33] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span>Explore CHATR Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
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

export default ResearchReportPage;
