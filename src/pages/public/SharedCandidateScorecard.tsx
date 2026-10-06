import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Share2, Copy, Check, 
  Briefcase, Award, TrendingUp, Clock, Bot, Building2, UserCheck, Zap 
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { supabase } from '@/integrations/supabase/client';

export const SharedCandidateScorecard: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
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
    verifiedBy: 'TalentXcel SI Screening Engine v3.4'
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title={`Verified Candidate Scorecard (${candidateData.targetRole}) — TalentXcel & CHATR`}
        description="View verified candidate competencies, screening highlights, and skills assessment powered by TalentXcel SI parser."
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-8">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="inline-flex items-center gap-2 text-[#53605C]">
            <span className="font-semibold text-[#164E3F]">TalentXcel</span>
            <span>/ Candidate Dossier</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DDE3DF] hover:bg-white bg-[#FAFBF9] text-xs font-semibold text-[#111817] transition-colors shadow-sm cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#164E3F]" /> : <Copy className="w-3.5 h-3.5 text-[#83918C]" />}
            <span>{copied ? 'Link Copied' : 'Share Scorecard'}</span>
          </button>
        </div>

        {/* Header Hero Card */}
        <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-[#164E3F] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SI Pre-Screened & Verified</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111817] tracking-tight">{candidateData.targetRole}</h1>
              <p className="text-xs text-[#83918C] font-mono">Dossier ID: {candidateData.id} • {candidateData.verifiedAt}</p>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-3 bg-[#FAFBF9] border border-[#DDE3DF] rounded-2xl p-4 shrink-0 shadow-sm">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-[#83918C] tracking-wider">Match Score</p>
                <p className="text-xs text-[#164E3F] font-semibold">High Fit</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-[#E8F0EB] border-2 border-[#164E3F] flex items-center justify-center font-black text-xl text-[#164E3F]">
                {candidateData.overallScore}%
              </div>
            </div>
          </div>

          {/* Sub-score Pills */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 text-center space-y-1">
              <p className="text-xs text-[#83918C] font-medium">Skills Match</p>
              <p className="text-lg font-bold text-[#111817]">{candidateData.skillsScore}%</p>
            </div>
            <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 text-center space-y-1">
              <p className="text-xs text-[#83918C] font-medium">Experience Fit</p>
              <p className="text-lg font-bold text-[#111817]">{candidateData.experienceScore}%</p>
            </div>
            <div className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 text-center space-y-1">
              <p className="text-xs text-[#83918C] font-medium">Screening SLA</p>
              <p className="text-lg font-bold text-[#164E3F]">{candidateData.screeningScore}%</p>
            </div>
          </div>
        </div>

        {/* Skills Taxonomy Breakdown */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#111817] font-bold text-base">
            <Award className="w-4 h-4 text-[#164E3F]" />
            <h2>Verified Skills & Capabilities</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {candidateData.matchedSkills.map(skill => (
              <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-xs font-semibold text-[#164E3F]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#164E3F]" />
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* SI Screening Highlights */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#111817] font-bold text-base">
            <Bot className="w-4 h-4 text-[#164E3F]" />
            <h2>WhatsApp Pre-Screening Verification Log</h2>
          </div>
          <div className="space-y-3">
            {candidateData.screeningHighlights.map((item, idx) => (
              <div key={idx} className="bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-4 space-y-2 text-xs">
                <p className="text-[#83918C] font-medium">Q: {item.question}</p>
                <div className="flex items-start gap-2 text-[#111817] font-semibold bg-white border border-[#DDE3DF] p-3 rounded-lg shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
                  <span>{item.answer}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conversion CTA Box */}
        <div className="bg-white border border-[#DDE3DF] rounded-3xl p-8 sm:p-10 space-y-4 text-center shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-[#164E3F] text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Powered by TalentXcel & CHATR OS</span>
          </div>
          <h3 className="text-2xl font-extrabold text-[#111817]">
            Screen & Parse Candidates in Under 60 Seconds
          </h3>
          <p className="text-xs sm:text-sm text-[#53605C] max-w-lg mx-auto leading-relaxed">
            Eliminate candidate drop-off and automate WhatsApp screening with SI parser accuracy. Join recruitment agencies and hiring teams.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#164E3F] hover:bg-[#123F33] text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              Start Free Workspace <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/tools/resume-grader"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FAFBF9] border border-[#DDE3DF] text-[#111817] font-medium text-xs transition-colors shadow-sm"
            >
              Test Resume Grader Free
            </Link>
          </div>
        </div>
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

export default SharedCandidateScorecard;
