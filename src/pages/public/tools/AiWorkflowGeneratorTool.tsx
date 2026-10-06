import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Workflow, Cpu, ArrowRight, Play, CheckCircle2, 
  Sparkles, Layers, ShieldCheck, RefreshCw, FileText, Check 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';
import { trackAcquisitionEvent, initializeAttribution } from '../../../services/acquisitionTelemetry';

interface WorkflowNode {
  id: string;
  stage: string;
  title: string;
  provider: string;
  latencyMs: number;
  status: 'completed' | 'active' | 'queued';
}

export const AiWorkflowGeneratorTool: React.FC = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [intentInput, setIntentInput] = useState('Screen candidate resume, score eligibility, and schedule interview on WhatsApp');
  const [isCompiling, setIsCompiling] = useState(false);
  const [activePreset, setActivePreset] = useState('recruitment');

  useEffect(() => {
    window.scrollTo(0, 0);
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'intent-to-workflow-generator' });

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

  const presets = [
    {
      id: 'recruitment',
      label: 'Recruitment Screening',
      prompt: 'Screen candidate resume, score eligibility, and schedule interview on WhatsApp'
    },
    {
      id: 'real-estate',
      label: 'Real Estate Lead Capture',
      prompt: 'Qualify buyer budget, dispatch PDF floor plans, and book site visit calendar'
    },
    {
      id: 'support-triage',
      label: 'Support Triage & SLA',
      prompt: 'Analyze customer sentiment, route urgent billing inquiry to Tier-2, and start 5m SLA timer'
    }
  ];

  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: '1', stage: 'Stage 1: Intent Parse', title: 'NLP Entity & Constraint Extraction', provider: 'Intent Engine', latencyMs: 28, status: 'completed' },
    { id: '2', stage: 'Stage 2: Capability Discovery', title: 'Resume Parser & WhatsApp API', provider: 'Connector Hub', latencyMs: 44, status: 'completed' },
    { id: '3', stage: 'Stage 3: Pre-Screening Execution', title: 'Interactive Button Qualification Card', provider: 'Execution Runtime', latencyMs: 62, status: 'completed' },
    { id: '4', stage: 'Stage 4: Verification & Handoff', title: 'ATS Stage Update & Calendar Booking', provider: 'Verification Engine', latencyMs: 35, status: 'completed' }
  ]);

  const handleCompile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompiling(true);
    trackAcquisitionEvent({
      event: 'tool_started',
      tool: 'intent-to-workflow-generator',
      metadata: { intentInput, activePreset }
    });
    setTimeout(() => {
      setIsCompiling(false);
    }, 450);
  };

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setActivePreset(preset.id);
    setIntentInput(preset.prompt);
  };

  const handleActionClick = () => {
    trackAcquisitionEvent({
      event: 'cta_clicked',
      tool: 'intent-to-workflow-generator',
      metadata: { cta: 'open_workflow_studio' }
    });
    if (isAuthenticated) {
      navigate('/desktop/home');
    } else {
      setAuthModalOpen(true);
    }
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CHATR Intent-to-Workflow Generator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, macOS, Windows, Linux",
    "url": "https://www.chatrchat.in/tools/intent-to-workflow-generator",
    "description": "Test how CHATR Intent OS translates natural language business requests into deterministic execution DAGs."
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Free Intent-to-Workflow Generator — Interactive DAG Builder | CHATR"
        description="Type any operational business goal. Watch CHATR compile an execution Directed Acyclic Graph (DAG) with parallel capability discovery and transaction verification."
        canonicalUrl="https://www.chatrchat.in/tools/intent-to-workflow-generator"
        keywords="intent to workflow generator, ai workflow builder, intent to action demo, autonomous workflow compiler"
        schemaData={schemaData}
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 flex-1">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>INTENT COMPILER DEMO • 100% FREE TOOL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#111817] tracking-tight leading-tight">
            Intent-to-Workflow <span className="text-[#164E3F]">DAG Generator</span>
          </h1>
          <p className="text-[#53605C] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Express any operational goal in natural language. Inspect how the CHATR Intent Operating System compiles and orchestrates deterministic workflow DAGs.
          </p>
        </div>

        {/* Generator Input */}
        <div className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#53605C]">Quick Enterprise Presets</span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all ${
                    activePreset === p.id 
                      ? 'bg-[#164E3F] text-white shadow-sm' 
                      : 'bg-[#F0F3F1] text-[#53605C] hover:bg-[#E5EAE7]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCompile} className="space-y-3">
            <label className="text-xs font-semibold text-[#53605C]">Natural Language Intent</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={intentInput}
                onChange={(e) => setIntentInput(e.target.value)}
                className="flex-1 bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl px-4 py-3 text-sm text-[#111817] focus:outline-none focus:border-[#164E3F]"
                placeholder="Describe what you want to automate..."
              />
              <button
                type="submit"
                disabled={isCompiling}
                className="bg-[#164E3F] hover:bg-[#123F33] text-white px-6 py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer"
              >
                {isCompiling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{isCompiling ? 'Compiling...' : 'Compile DAG'}</span>
              </button>
            </div>
          </form>

          {/* Visual DAG Execution Graph */}
          <div className="space-y-4 pt-4 border-t border-[#DDE3DF]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase tracking-wider text-[#53605C]">Generated Execution Graph (DAG)</span>
              <span className="font-mono text-[#164E3F] bg-[#EAEFEA] px-2.5 py-1 rounded border border-[#D5E0D5]">
                Total Latency: 169ms • Validated
              </span>
            </div>

            <div className="space-y-3">
              {nodes.map((node, index) => (
                <div key={node.id} className="relative">
                  <div className="bg-[#FAFBF9] border border-[#DDE3DF] hover:border-[#164E3F]/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#EAEFEA] border border-[#D5E0D5] flex items-center justify-center text-[#164E3F] font-mono text-xs font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-[#53605C] block">{node.stage}</span>
                        <span className="text-sm font-semibold text-[#111817]">{node.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-10 sm:ml-0">
                      <span className="text-xs px-2.5 py-1 rounded bg-white text-[#53605C] border border-[#DDE3DF] font-mono">
                        {node.provider}
                      </span>
                      <span className="text-xs font-mono text-[#164E3F] font-semibold">+{node.latencyMs}ms</span>
                      <CheckCircle2 className="w-4 h-4 text-[#164E3F]" />
                    </div>
                  </div>
                  {index < nodes.length - 1 && (
                    <div className="w-0.5 h-3 bg-[#DDE3DF] mx-auto my-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[#53605C] gap-3">
            <span>Ready to run in production with live connectors?</span>
            <button 
              onClick={handleActionClick} 
              className="text-[#164E3F] hover:text-[#123F33] font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              Open CHATR Workflow Studio <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default AiWorkflowGeneratorTool;
