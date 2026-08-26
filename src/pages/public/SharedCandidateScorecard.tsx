import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Share2, Copy, Check, 
  Briefcase, Award, TrendingUp, Clock, Bot, Building2, UserCheck, Zap
} from 'lucide-react';

export const SharedCandidateScorecard: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [copied, setCopied] = useState(false);

  // Mock / Sample Data fallback for demonstration & viral sharing
  const candidateData = {
    id: candidateId || 'TX-8924',
    name: 'Candidate Profile (Redacted for Privacy)',
    targetRole: 'Senior Full Stack Engineer',
    overallScore: 94,
    skillsScore: 96,
    experienceScore: 92,
    screeningScore: 95,
    matchedSkills: ['React.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'System Design', 'WhatsApp API'],
    screeningHighlights: [
      { question: 'Hands-on experience with high-concurrency Node.js microservices?', answer: 'Yes, architected message queue processing 50k+ events/min.', verified: true },
      { question: 'Notice period & immediate availability status?', answer: '15 days notice period with immediate buy-out option.', verified: true },
      { question: 'Comfortable with remote collaboration & agile sprints?', answer: '5+ years experience in distributed engineering teams.', verified: true }
    ],
    verifiedAt: 'August 2026',
    verifiedBy: 'TalentXcel AI Screening Engine v3.4'
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-base">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs font-black tracking-wider">CHATR</span>
            <span className="text-slate-400 font-medium text-xs">/ TalentXcel AI Scorecard</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share Scorecard'}</span>
            </button>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              Try TalentXcel Free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Scorecard Container */}
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Header Hero Card */}
        <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI Pre-Screened & Verified</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{candidateData.targetRole}</h1>
              <p className="text-xs text-slate-400 font-mono">Dossier ID: {candidateData.id} • {candidateData.verifiedAt}</p>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-4 shrink-0">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Match Score</p>
                <p className="text-xs text-emerald-400 font-semibold">High Fit</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center font-black text-xl text-indigo-300">
                {candidateData.overallScore}%
              </div>
            </div>
          </div>

          {/* Sub-score Pills */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center space-y-1">
              <p className="text-[11px] text-slate-400 font-medium">Skills Match</p>
              <p className="text-lg font-bold text-white">{candidateData.skillsScore}%</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center space-y-1">
              <p className="text-[11px] text-slate-400 font-medium">Experience Fit</p>
              <p className="text-lg font-bold text-white">{candidateData.experienceScore}%</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center space-y-1">
              <p className="text-[11px] text-slate-400 font-medium">Screening SLA</p>
              <p className="text-lg font-bold text-emerald-400">{candidateData.screeningScore}%</p>
            </div>
          </div>
        </div>

        {/* Skills Taxonomy Breakdown */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Award className="w-4 h-4 text-indigo-400" />
            <h2>Verified Skills & Capabilities</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {candidateData.matchedSkills.map(skill => (
              <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-xs font-semibold text-indigo-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* AI Screening Highlights */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Bot className="w-4 h-4 text-indigo-400" />
            <h2>WhatsApp Pre-Screening Verification Log</h2>
          </div>
          <div className="space-y-3">
            {candidateData.screeningHighlights.map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs">
                <p className="text-slate-400 font-medium">Q: {item.question}</p>
                <div className="flex items-start gap-2 text-slate-200 font-semibold bg-slate-900/50 p-2.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item.answer}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Viral Product-Led Growth CTA Box */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 sm:p-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Powered by TalentXcel & CHATR OS</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Screen & Parse Candidates in Under 60 Seconds
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Eliminate candidate drop-off and automate WhatsApp screening with AI parser accuracy. Join 1,200+ recruitment agencies and hiring teams.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/chatr/whatsapp-candidate-screening"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Explore AI Screening Workflow
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharedCandidateScorecard;
