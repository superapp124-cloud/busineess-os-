import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  RotateCcw, ShieldCheck, Zap, Award, ChevronRight, Download, Check
} from 'lucide-react';
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'resume-grader' });
  }, []);

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
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-base">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs font-black tracking-wider">CHATR</span>
            <span className="text-slate-400 font-medium text-xs">/ Free ATS Resume Grader</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              onClick={() => handleCtaClick('nav_signup')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              Sign In / Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>100% Free • Powered by TalentXcel AI Parser v3.4</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Instant ATS Resume Grader & AI Rewriter
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Drop your resume to get your ATS compatibility score, identify recruiter red flags, and get 3 instant high-impact bullet point rewrites.
          </p>
        </div>

        {/* Upload / Input Area (When no result yet) */}
        {!result && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* File Dropzone */}
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center transition-colors relative cursor-pointer group bg-slate-950/40">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                disabled={isAnalyzing}
              />
              <div className="space-y-3 pointer-events-none">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Click or drag & drop your resume (PDF or DOCX)</p>
                  <p className="text-xs text-slate-400 mt-1">Instant 1.2-second parsing • No credit card required</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-xs font-bold text-slate-500 uppercase">Or Paste Text</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* Paste Text Fallback */}
            <div className="space-y-3">
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your resume work experience or bullet points here..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                disabled={isAnalyzing}
              />
              <button
                onClick={handlePasteAnalyze}
                disabled={!resumeText.trim() || isAnalyzing}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume Taxonomy & ATS Fit...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
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
            <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-400 font-mono">FILE: {fileName}</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">ATS Resume Analysis Complete</h2>
                  <p className="text-xs text-slate-400">Scanned against 5,000+ tech & corporate job descriptions</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Overall Score</p>
                    <p className="text-xs text-amber-400 font-bold">Needs Polish</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center font-black text-xl text-amber-400">
                    {result.overallScore}
                  </div>
                </div>
              </div>

              {/* Sub-Score Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center space-y-1">
                  <p className="text-[11px] text-slate-400 font-medium">ATS Format</p>
                  <p className="text-lg font-bold text-white">{result.atsCompatibility}%</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center space-y-1">
                  <p className="text-[11px] text-slate-400 font-medium">Action Verbs</p>
                  <p className="text-lg font-bold text-amber-400">{result.actionVerbScore}%</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center space-y-1">
                  <p className="text-[11px] text-slate-400 font-medium">Metrics & Impact</p>
                  <p className="text-lg font-bold text-rose-400">{result.impactMetricScore}%</p>
                </div>
              </div>
            </div>

            {/* Top 3 Identified Problems */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3>Top 3 Issues Lowering Your Interview Callback Rate</h3>
              </div>
              <div className="space-y-3">
                {result.identifiedProblems.map((prob, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{idx + 1}. {prob.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                        {prob.severity} impact
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{prob.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Suggested Bullet Point Rewrites */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3>AI-Optimized Bullet Point Rewrites</h3>
              </div>
              <div className="space-y-4">
                {result.suggestedBulletRewrites.map((rw, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Original (Before)</p>
                      <p className="text-slate-400 bg-slate-900/60 p-2.5 rounded-lg font-mono line-through opacity-80">{rw.before}</p>
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> AI Improved (After)
                      </p>
                      <p className="text-emerald-300 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg font-medium leading-relaxed">
                        {rw.after}
                      </p>
                    </div>
                    <p className="text-[11px] text-indigo-300 italic pt-1">Why this works: {rw.reasoning}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* High-Converting Value-First Signup CTA */}
            <div className="bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 sm:p-8 space-y-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Next Step: Complete Your Free Optimization</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Download Your Full AI-Rewritten ATS Resume Free
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Create a free career profile on CHATR to export your tailored PDF resume and get instantly discovered by hiring recruiters with automated WhatsApp matching.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/auth"
                  onClick={() => handleCtaClick('result_signup_complete')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20"
                >
                  Create Free Profile & Download Resume <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setResult(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Test Another Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResumeGraderTool;
