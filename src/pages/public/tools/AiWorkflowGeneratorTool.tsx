import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Workflow, Cpu, ArrowRight, Play, CheckCircle2, 
  Sparkles, Layers, ShieldCheck, RefreshCw, FileText, Check 
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

interface WorkflowNode {
  id: string;
  stage: string;
  title: string;
  provider: string;
  latencyMs: number;
  status: 'completed' | 'active' | 'queued';
}

export const AiWorkflowGeneratorTool: React.FC = () => {
  const [intentInput, setIntentInput] = useState('Screen candidate resume, score eligibility, and schedule interview on WhatsApp');
  const [isCompiling, setIsCompiling] = useState(false);
  const [activePreset, setActivePreset] = useState('recruitment');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    { id: '2', stage: 'Stage 2: Capability Discovery', title: 'TalentXcel Resume Parser & WhatsApp API', provider: 'Connector Hub', latencyMs: 44, status: 'completed' },
    { id: '3', stage: 'Stage 3: Pre-Screening Execution', title: 'Interactive Button Qualification Card', provider: 'Execution Runtime', latencyMs: 62, status: 'completed' },
    { id: '4', stage: 'Stage 4: Verification & Handoff', title: 'ATS Stage Update & Calendar Booking', provider: 'Verification Engine', latencyMs: 35, status: 'completed' }
  ]);

  const handleCompile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
    }, 450);
  };

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setActivePreset(preset.id);
    setIntentInput(preset.prompt);
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
    <>
      <SEOHead
        title="Free Intent-to-Workflow Generator — Interactive DAG Builder | CHATR"
        description="Type any operational business goal. Watch CHATR compile an execution Directed Acyclic Graph (DAG) with parallel capability discovery and transaction verification."
        keywords="intent to workflow generator, ai workflow builder, intent to action demo, autonomous workflow compiler"
        schemaData={schemaData}
      />
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
        <header className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">CHATR</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">INTENT OS</span>
            </Link>
            <Link to="/auth" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-all">
              Launch Workspace
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INTENT COMPILER DEMO</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Intent-to-Workflow Generator
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Express any operational goal in natural language. Inspect how the CHATR Intent Operating System compiles and orchestrates deterministic workflow DAGs.
            </p>
          </div>

          {/* Generator Input */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300">Quick Enterprise Presets</span>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl border font-medium transition-all ${activePreset === p.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCompile} className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Natural Language Intent</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={intentInput}
                  onChange={(e) => setIntentInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isCompiling}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-indigo-600/20"
                >
                  {isCompiling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>{isCompiling ? 'Compiling...' : 'Compile DAG'}</span>
                </button>
              </div>
            </form>

            {/* Visual DAG Execution Graph */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-slate-400">Generated Execution Graph (DAG)</span>
                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Total Latency: 169ms • Validated
                </span>
              </div>

              <div className="space-y-3">
                {nodes.map((node, index) => (
                  <div key={node.id} className="relative">
                    <div className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 block">{node.stage}</span>
                          <span className="text-sm font-semibold text-white">{node.title}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                          {node.provider}
                        </span>
                        <span className="text-xs font-mono text-emerald-400">+{node.latencyMs}ms</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                    {index < nodes.length - 1 && (
                      <div className="w-0.5 h-3 bg-slate-800 mx-auto my-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Ready to run in production?</span>
              <Link to="/auth" className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1">
                Open CHATR Workflow Studio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AiWorkflowGeneratorTool;
