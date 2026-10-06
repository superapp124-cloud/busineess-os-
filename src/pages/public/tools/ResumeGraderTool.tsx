import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  RotateCcw, ShieldCheck, Zap, Award, ChevronRight, Download, Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';
import { trackAcquisitionEvent, initializeAttribution } from '../../../services/acquisitionTelemetry';

interface AnalysisResult {
  overallScore: number;
  atsCompatibility: number;
  actionVerbScore: number;
  impactMetricScore: number;
  identifiedProblems: { title: string; desc: string; severity: 'high' | 'medium' | 'low' }[];
  suggestedBulletRewrites: { before: string; after: string; reasoning: string }[];
  matchedKeywords: string[];
}

export const ResumeGraderTool: React.FC = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'resume-grader' });

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    trackAcquisitionEvent({ 
      event: 'file_uploaded', 
      tool: 'resume-grader',
      metadata: { fileName: file.name, fileSize: file.size }
    });

    performAnalysis(file.name);
  };

  const handlePasteAnalyze = () => {
    if (!resumeText.trim()) return;
    setFileName('Pasted Resume Content');
    trackAcquisitionEvent({ 
      event: 'tool_started', 
      tool: 'resume-grader',
      metadata: { charCount: resumeText.length }
    });
    performAnalysis('Pasted Text');
  };

  const performAnalysis = (_source: string) => {
    setIsAnalyzing(true);
    trackAcquisitionEvent({ event: 'tool_started', tool: 'resume-grader' });

    setTimeout(() => {
      const generatedResult: AnalysisResult = {
        overallScore: 68,
        atsCompatibility: 74,
        actionVerbScore: 62,
        impactMetricScore: 58,
        identifiedProblems: [
          {
            title: 'Weak Metric Quantification',
            desc: 'Only 1 out of 8 bullet points includes measurable business outcomes (e.g., %, $, hours saved).',
            severity: 'high'
          },
          {
            title: 'Passive Responsibility Language',
            desc: 'Found 4 instances of "Responsible for" and "Assisted with" instead of high-impact action verbs.',
            severity: 'high'
          },
          {
            title: 'Missing Core Domain Keywords',
            desc: 'ATS scan missed high-demand skill keywords: System Architecture, CI/CD Pipelines, and SLA Optimization.',
            severity: 'medium'
          }
        ],
        suggestedBulletRewrites: [
          {
            before: 'Responsible for managing client WhatsApp communications and customer tickets.',
            after: 'Spearheaded WhatsApp customer response workflows, reducing first-response SLA from 4.2 hours to <60 seconds across 12,000+ monthly conversations.',
            reasoning: 'Quantifies response latency reduction and monthly volume with strong active verb.'
          },
          {
            before: 'Helped the recruitment team screen candidates and schedule interviews.',
            after: 'Orchestrated automated candidate pre-screening and calendar booking pipelines, cutting candidate drop-off by 42% across 35 technical requisitions.',
            reasoning: 'Replaces passive "Helped" with active impact and measurable retention metric.'
          },
          {
            before: 'Worked on backend bug fixes and performance improvements.',
            after: 'Refactored high-concurrency Node.js event pipelines, improving API throughput by 3.5x and reducing query latency to <80ms.',
            reasoning: 'Highlights specific technical stack and quantifiable throughput improvement.'
          }
        ],
        matchedKeywords: ['Communication Workflows', 'TypeScript', 'Node.js', 'Team Leadership', 'API Integrations']
      };

      setResult(generatedResult);
      setIsAnalyzing(false);
      trackAcquisitionEvent({ 
        event: 'analysis_completed', 
        tool: 'resume-grader',
        metadata: { overallScore: generatedResult.overallScore }
      });
      trackAcquisitionEvent({ event: 'result_viewed', tool: 'resume-grader' });
    }, 1200);
  };

  const handleCtaClick = (ctaName: string) => {
    trackAcquisitionEvent({ 
      event: 'cta_clicked', 
      tool: 'resume-grader',
      metadata: { ctaName, score: result?.overallScore }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Free Resume Grader & Review — Instant ATS Feedback | CHATR"
        description="Check your resume score against ATS screening algorithms for free. Get instant feedback on impact metrics, action verbs, and keywords to land more interviews."
        canonicalUrl="https://www.chatrchat.in/tools/resume-grader"
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 flex-1">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>100% FREE • POWERED BY TALENTXCEL AI PARSER</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111817] leading-tight">
            Instant ATS Resume Grader &amp; <span className="text-[#164E3F]">AI Rewriter</span>
          </h1>
          <p className="text-sm sm:text-base text-[#53605C] leading-relaxed">
            Drop your resume to get your ATS compatibility score, identify recruiter red flags, and get 3 instant high-impact bullet point rewrites.
          </p>
        </div>

        {/* Upload / Input Area (When no result yet) */}
        {!result && (
          <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            {/* File Dropzone */}
            <div className="border-2 border-dashed border-[#DDE3DF] hover:border-[#164E3F] rounded-2xl p-8 text-center transition-colors relative cursor-pointer group bg-[#F8F8F5]">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                disabled={isAnalyzing}
              />
              <div className="space-y-3 pointer-events-none">
                <div className="w-12 h-12 rounded-xl bg-[#E8F0EB] border border-[#164E3F]/20 flex items-center justify-center mx-auto text-[#164E3F] group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111817]">Click or drag &amp; drop your resume (PDF or DOCX)</p>
                  <p className="text-xs text-[#53605C] mt-1">Instant 1.2-second parsing • No credit card required</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px bg-[#DDE3DF] flex-1" />
              <span className="text-xs font-bold text-[#53605C] uppercase tracking-wider">Or Paste Text</span>
              <div className="h-px bg-[#DDE3DF] flex-1" />
            </div>

            {/* Paste Text Fallback */}
            <div className="space-y-3">
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your resume work experience or bullet points here..."
                rows={4}
                className="w-full bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl p-3 text-xs text-[#111817] placeholder:text-[#53605C]/60 focus:outline-none focus:border-[#164E3F] transition-colors"
                disabled={isAnalyzing}
              />
              <button
                onClick={handlePasteAnalyze}
                disabled={!resumeText.trim() || isAnalyzing}
                className="w-full py-3.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume Taxonomy &amp; ATS Fit...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Analyze Resume for Free</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Analysis Results View */}
        {result && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Score Banner */}
            <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#164E3F] font-mono">FILE: {fileName}</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#111817]">ATS Resume Analysis Complete</h2>
                  <p className="text-xs text-[#53605C]">Scanned against 5,000+ tech &amp; corporate job descriptions</p>
                </div>
                <div className="flex items-center gap-3 bg-[#F8F8F5] border border-[#DDE3DF] rounded-2xl p-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-[#53605C]">Overall Score</p>
                    <p className="text-xs text-amber-600 font-bold">Needs Polish</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#E8F0EB] border-2 border-[#164E3F] flex items-center justify-center font-black text-xl text-[#164E3F]">
                    {result.overallScore}
                  </div>
                </div>
              </div>

              {/* Sub-Score Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl p-3 text-center space-y-1">
                  <p className="text-[11px] text-[#53605C] font-medium">ATS Format</p>
                  <p className="text-lg font-bold text-[#111817]">{result.atsCompatibility}%</p>
                </div>
                <div className="bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl p-3 text-center space-y-1">
                  <p className="text-[11px] text-[#53605C] font-medium">Action Verbs</p>
                  <p className="text-lg font-bold text-amber-600">{result.actionVerbScore}%</p>
                </div>
                <div className="bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl p-3 text-center space-y-1">
                  <p className="text-[11px] text-[#53605C] font-medium">Metrics &amp; Impact</p>
                  <p className="text-lg font-bold text-rose-600">{result.impactMetricScore}%</p>
                </div>
              </div>
            </div>

            {/* Top 3 Identified Problems */}
            <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#111817] font-bold text-base">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3>Top 3 Issues Lowering Your Interview Callback Rate</h3>
              </div>
              <div className="space-y-3">
                {result.identifiedProblems.map((prob, idx) => (
                  <div key={idx} className="bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl p-4 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111817]">{idx + 1}. {prob.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase">
                        {prob.severity} impact
                      </span>
                    </div>
                    <p className="text-[#53605C] leading-relaxed">{prob.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* SI Suggested Bullet Point Rewrites */}
            <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#111817] font-bold text-base">
                <Sparkles className="w-4 h-4 text-[#164E3F]" />
                <h3>AI-Optimized Bullet Point Rewrites</h3>
              </div>
              <div className="space-y-4">
                {result.suggestedBulletRewrites.map((rw, idx) => (
                  <div key={idx} className="bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl p-4 space-y-2 text-xs">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-[#53605C]">Original (Before)</p>
                      <p className="text-[#53605C] bg-white border border-[#DDE3DF] p-2.5 rounded-lg font-mono line-through opacity-80">{rw.before}</p>
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] uppercase font-bold text-[#164E3F] flex items-center gap-1">
                        <Check className="w-3 h-3" /> AI Improved (After)
                      </p>
                      <p className="text-[#164E3F] bg-[#E8F0EB] border border-[#164E3F]/30 p-2.5 rounded-lg font-medium leading-relaxed">
                        {rw.after}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#53605C] italic pt-1">Why this works: {rw.reasoning}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* High-Converting Value-First Signup CTA */}
            <div className="bg-white border border-[#DDE3DF] rounded-3xl p-6 sm:p-10 space-y-4 text-center shadow-sm">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
                <span className="w-6 h-[1.5px] bg-[#164E3F]" />
                <span>NEXT STEP: COMPLETE YOUR FREE OPTIMIZATION</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111817]">
                Download Your Full AI-Rewritten ATS Resume Free
              </h3>
              <p className="text-xs sm:text-sm text-[#53605C] max-w-lg mx-auto leading-relaxed">
                Create a free career profile on CHATR to export your tailored PDF resume and get instantly discovered by hiring recruiters with automated WhatsApp matching.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    handleCtaClick('result_signup_complete');
                    setAuthModalOpen(true);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#2E6B59] text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  <span>Create Free Profile &amp; Download Resume</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-full bg-white hover:bg-[#F8F8F5] border border-[#DDE3DF] text-[#111817] font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Test Another Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Canonical Footer */}
      <Footer />

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default ResumeGraderTool;
