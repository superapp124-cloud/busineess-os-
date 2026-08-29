import React, { useState, useEffect, useRef } from 'react';
import {
  Server, Cpu, Zap, CheckCircle, XCircle, RefreshCw,
  Play, Square, Download, RotateCcw, Archive, ChevronDown,
  ChevronRight, Activity, Database, Shield, BookOpen,
  TrendingUp, AlertTriangle, Clock, Terminal, Layers
} from 'lucide-react';
import { OllamaClient, type OllamaHealth, type ChatrCapability } from '@/services/ai/OllamaClient';
import { SoupTrainingClient, type TrainingWorkerHealth, type SoupShipVerdict, type AdapterRecord } from '@/services/ai/SoupTrainingClient';

// ============================================================
// CONSTANTS
// ============================================================

const CAPABILITIES: Array<{ id: ChatrCapability; label: string; icon: string; description: string; isKnowledgeSystem?: boolean }> = [
  { id: 'general',   label: 'General Assistant', icon: '🤖', description: 'Default chat, Q&A, reasoning' },
  { id: 'coding',    label: 'Coding',             icon: '💻', description: 'Code generation, review, debugging' },
  { id: 'reasoning', label: 'Reasoning',          icon: '🧩', description: 'Logic, planning, multi-step tasks' },
  { id: 'business',  label: 'Business',           icon: '💼', description: 'Reports, strategies, proposals' },
  { id: 'finance',   label: 'Finance',            icon: '📊', description: 'Analysis, forecasting, documents' },
  { id: 'seo',       label: 'SEO',                icon: '🔍', description: 'Content optimization, keywords' },
  { id: 'marketing', label: 'Marketing',          icon: '📢', description: 'Copy, campaigns, targeting' },
  { id: 'creator',   label: 'Creator',            icon: '🎬', description: 'Reel scripts, hooks, captions' },
  { id: 'video',     label: 'Video',              icon: '🎥', description: 'Scene prompts, shot plans, storyboards' },
  { id: 'research',  label: 'Research',           icon: '🔬', description: 'Summarization, synthesis, extraction' },
  { id: 'support',   label: 'Customer Support',   icon: '💬', description: 'Ticket handling, escalation' },
  { id: 'agent',     label: 'Agent / Tool Use',   icon: '🤝', description: 'Tool selection, multi-step planning' },
  { id: 'meera',     label: 'Meera',              icon: '🎭', description: 'Hinglish persona, Delhi creator voice' },
  { id: 'rag',       label: 'RAG / Memory (Knowledge System)', icon: '📚', description: 'Vector retrieval & documents (Not a LoRA adapter)', isKnowledgeSystem: true },
];

const TRAINING_METHODS = ['sft', 'dpo', 'orpo'];
const BASE_MODELS = [
  'Qwen/Qwen2.5-7B-Instruct',
  'meta-llama/Llama-3.1-8B-Instruct',
  'microsoft/Phi-3.5-mini-instruct',
];

// ============================================================
// TYPES
// ============================================================

type ActiveSection = 'overview' | 'new_job' | 'jobs' | 'registry' | 'datasets';

interface MockAdapter {
  capability: ChatrCapability;
  version: string;
  status: 'PRODUCTION' | 'TRAINING' | 'EVALUATING' | 'REJECTED' | 'NOT_TRAINED' | 'KNOWLEDGE_SYSTEM';
  method?: string;
  soupVerdict?: string;
  chatrGate?: string;
  ollamaTag?: string;
  promotedAt?: string;
}

// ============================================================
// AI HUB PAGE
// ============================================================

export const AIHub: React.FC = () => {
  const ollamaClient = useRef(new OllamaClient());
  const soupClient = useRef(new SoupTrainingClient());

  const [section, setSection] = useState<ActiveSection>('overview');
  const [ollamaHealth, setOllamaHealth] = useState<OllamaHealth | null>(null);
  const [workerHealth, setWorkerHealth] = useState<TrainingWorkerHealth | null>(null);
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);
  const [isCheckingWorker, setIsCheckingWorker] = useState(false);
  const [workerUrl, setWorkerUrl] = useState('http://localhost:8000');

  // New job form
  const [selectedCapability, setSelectedCapability] = useState<ChatrCapability>('meera');
  const [selectedMethod, setSelectedMethod] = useState('sft');
  const [selectedBaseModel, setSelectedBaseModel] = useState(BASE_MODELS[0]);
  const [datasetId, setDatasetId] = useState('meera_sft_v1');
  const [budgetMinutes, setBudgetMinutes] = useState(90);
  const [humanApproval, setHumanApproval] = useState('');
  const [policyStatus, setPolicyStatus] = useState<null | 'CHECKING' | 'PASSED' | 'FAILED'>(null);
  const [policyViolations, setPolicyViolations] = useState<string[]>([]);

  // Phase 0 validated adapters state
  const [adapters] = useState<MockAdapter[]>([
    { capability: 'general', version: 'v1.0.0', status: 'PRODUCTION', method: 'sft', soupVerdict: 'SHIP', chatrGate: 'PASS', ollamaTag: 'chatr:general-v1', promotedAt: 'Phase 0' },
    { capability: 'coding', version: 'v1.0.0', status: 'PRODUCTION', method: 'sft', soupVerdict: 'SHIP', chatrGate: 'PASS', ollamaTag: 'chatr:coding-v1', promotedAt: 'Phase 0' },
    { capability: 'meera', version: 'v1.0.0', status: 'PRODUCTION', method: 'sft', soupVerdict: 'SHIP', chatrGate: 'PASS', ollamaTag: 'chatr:meera-v1', promotedAt: 'Phase 0' },
    { capability: 'reasoning', version: '—', status: 'NOT_TRAINED' },
    { capability: 'business', version: '—', status: 'NOT_TRAINED' },
    { capability: 'finance', version: '—', status: 'NOT_TRAINED' },
    { capability: 'seo', version: '—', status: 'NOT_TRAINED' },
    { capability: 'marketing', version: '—', status: 'NOT_TRAINED' },
    { capability: 'creator', version: '—', status: 'NOT_TRAINED' },
    { capability: 'video', version: '—', status: 'NOT_TRAINED' },
    { capability: 'research', version: '—', status: 'NOT_TRAINED' },
    { capability: 'support', version: '—', status: 'NOT_TRAINED' },
    { capability: 'agent', version: '—', status: 'NOT_TRAINED' },
    { capability: 'rag', version: 'RAG_SYSTEM', status: 'KNOWLEDGE_SYSTEM', method: 'Vector / RAG', soupVerdict: '—', chatrGate: 'GROUNDED', ollamaTag: 'Vector Store' },
  ]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const checkOllama = async () => {
    setIsCheckingOllama(true);
    const health = await ollamaClient.current.getHealth();
    setOllamaHealth(health);
    setIsCheckingOllama(false);
  };

  const checkWorker = async () => {
    setIsCheckingWorker(true);
    soupClient.current.setEndpoint(workerUrl);
    const health = await soupClient.current.healthCheck();
    setWorkerHealth(health);
    setIsCheckingWorker(false);
  };

  const validateTrainingPlan = () => {
    const violations: string[] = [];
    if (!selectedCapability) violations.push('CAPABILITY_ALLOWLIST: Select a capability');
    if (selectedCapability === 'rag') violations.push('RAG_KNOWLEDGE_SYSTEM: RAG is a retrieval mechanism, not a trainable LoRA adapter.');
    if (!datasetId.trim()) violations.push('DATASET_NOT_FOUND: Provide a dataset ID');
    if (budgetMinutes > 120) violations.push('BUDGET_CAP: Budget exceeds 120 min cap');
    if ((selectedMethod === 'dpo' || selectedMethod === 'orpo') && !humanApproval.trim()) {
      violations.push('HUMAN_APPROVAL_REQUIRED: DPO/ORPO requires human approval');
    }
    if (!BASE_MODELS.includes(selectedBaseModel)) violations.push('MODEL_ALLOWLIST: Select an approved base model');
    setPolicyViolations(violations);
    setPolicyStatus(violations.length === 0 ? 'PASSED' : 'FAILED');
  };

  useEffect(() => {
    checkOllama();
    checkWorker();
  }, []);

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const StatusBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <span className={`px-2.5 py-0.5 rounded-xl text-[10px] font-mono font-bold border ${
      ok ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    }`}>{label}</span>
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5 flex-wrap">
            <span className="text-2xl">🧠</span>
            <h1 className="text-xl font-bold text-white">CHATR AI Training Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
              SOUP v0.73.3 (PINNED)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            14 training capability domains · Ollama inference runtime · Soup QLoRA worker · CHATR Evaluation Gate
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
            ollamaHealth?.status === 'ONLINE'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}>
            Ollama: {ollamaHealth?.status ?? 'CHECKING...'}
          </span>
          <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
            workerHealth?.status === 'ONLINE'
              ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}>
            Soup Worker: {workerHealth?.status ?? 'NOT CHECKED'}
          </span>
        </div>
      </div>

      {/* ARCHITECTURE OVERVIEW STRIP */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-300">
          <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">CHATR Director (Dell)</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="px-3 py-1.5 bg-violet-950/50 border border-violet-500/30 rounded-xl text-violet-300">Policy Engine</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="px-3 py-1.5 bg-violet-950/50 border border-violet-500/30 rounded-xl text-violet-300">Soup Worker (Colab T4)</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="px-3 py-1.5 bg-amber-950/50 border border-amber-500/30 rounded-xl text-amber-300">CHATR Gate</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="px-3 py-1.5 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-emerald-300">Adapter Registry</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200">Ollama (Serving)</span>
        </div>
      </div>

      {/* SECTION TABS */}
      <div className="flex space-x-2 overflow-x-auto pb-1">
        {([
          { id: 'overview', label: '📊 System Status', icon: Activity },
          { id: 'new_job', label: '➕ New Training Job', icon: Play },
          { id: 'jobs', label: '⚙️ Training Jobs', icon: Terminal },
          { id: 'registry', label: '📦 Adapter Registry', icon: Layers },
          { id: 'datasets', label: '🗄️ Datasets', icon: Database },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setSection(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center space-x-2 transition whitespace-nowrap ${
              section === tab.id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* SECTION: SYSTEM STATUS */}
      {/* ======================================================== */}
      {section === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Ollama Runtime Status */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Ollama Runtime (Local Inference)</h2>
              </div>
              <button onClick={checkOllama} disabled={isCheckingOllama}
                className="px-3 py-1.5 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center space-x-1">
                <RefreshCw className={`w-3 h-3 ${isCheckingOllama ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            {ollamaHealth ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {ollamaHealth.status === 'ONLINE'
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : <XCircle className="w-4 h-4 text-rose-400" />}
                  <span className="text-sm font-bold text-white">{ollamaHealth.status}</span>
                  <span className="text-xs text-slate-400">{ollamaHealth.url}</span>
                </div>
                {ollamaHealth.status === 'ONLINE' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <p className="text-slate-400 font-mono">Base Model</p>
                        <p className={`font-bold mt-0.5 ${ollamaHealth.baseModelLoaded ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {ollamaHealth.baseModelLoaded ? '✅ Loaded' : '⚠️ Not loaded'}
                        </p>
                        <p className="text-slate-500 text-[10px]">qwen2.5:7b-instruct</p>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <p className="text-slate-400 font-mono">CHATR Adapters</p>
                        <p className="font-bold text-violet-400 mt-0.5">{ollamaHealth.chatrAdapters.length} loaded</p>
                        <p className="text-slate-500 text-[10px]">of 14 capabilities</p>
                      </div>
                    </div>
                    {ollamaHealth.chatrAdapters.length > 0 && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <p className="text-[10px] font-mono text-slate-400 uppercase">Active CHATR Adapters</p>
                        {ollamaHealth.chatrAdapters.map(tag => (
                          <p key={tag} className="text-[11px] font-mono text-violet-300">{tag}</p>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-rose-950/30 border border-rose-500/30 p-3.5 rounded-2xl space-y-2">
                    <p className="text-xs text-rose-300 font-bold">Ollama is not running.</p>
                    <p className="text-[11px] text-slate-400">Install Ollama, then run:</p>
                    <code className="text-[11px] font-mono text-amber-300 bg-slate-950 px-2 py-1 rounded block">
                      ollama pull qwen2.5:7b-instruct
                    </code>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Checking...</p>
            )}
          </div>

          {/* Soup Worker Status */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-bold text-white">Soup Training Worker (Colab T4)</h2>
              </div>
              <button onClick={checkWorker} disabled={isCheckingWorker}
                className="px-3 py-1.5 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center space-x-1">
                <RefreshCw className={`w-3 h-3 ${isCheckingWorker ? 'animate-spin' : ''}`} />
                <span>Ping</span>
              </button>
            </div>
            <div className="flex gap-2">
              <input type="text" value={workerUrl} onChange={e => setWorkerUrl(e.target.value)}
                placeholder="https://xxxx.trycloudflare.com"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-violet-500" />
            </div>
            {workerHealth ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {workerHealth.status === 'ONLINE'
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : <XCircle className="w-4 h-4 text-rose-400" />}
                  <span className="text-sm font-bold text-white">{workerHealth.status}</span>
                  {workerHealth.status === 'ONLINE' && (
                    <span className="text-xs text-slate-400">{workerHealth.gpuName}</span>
                  )}
                </div>
                {workerHealth.status === 'ONLINE' && (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-mono">VRAM Total</p>
                      <p className="font-bold text-emerald-400 mt-0.5">{workerHealth.vramTotalGb} GB</p>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-mono">VRAM Free</p>
                      <p className="font-bold text-amber-400 mt-0.5">{workerHealth.vramFreeGb} GB</p>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-mono">Soup Version</p>
                      <p className="font-bold text-violet-400 mt-0.5">{workerHealth.soupVersion ?? '0.73.3'}</p>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-mono">Active Job</p>
                      <p className={`font-bold mt-0.5 ${workerHealth.activeJob ? 'text-amber-400' : 'text-slate-500'}`}>
                        {workerHealth.activeJob ?? 'Idle'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Paste your Colab URL above and ping to check.</p>
            )}
            <p className="text-[11px] text-slate-400">
              💡 Open <code className="text-violet-300 bg-slate-950 px-1 py-0.5 rounded">notebooks/meera_performance_worker.ipynb</code> in Colab T4 → Run All → paste tunnel URL.
            </p>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: NEW TRAINING JOB */}
      {/* ======================================================== */}
      {section === 'new_job' && (
        <div className="max-w-2xl space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Play className="w-4 h-4 text-violet-400" />
              <span>New Training Job</span>
            </h2>

            <div className="space-y-4">
              {/* Capability */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Capability</label>
                <select
                  value={selectedCapability}
                  onChange={e => setSelectedCapability(e.target.value as ChatrCapability)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                >
                  {CAPABILITIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500">
                  {CAPABILITIES.find(c => c.id === selectedCapability)?.description}
                </p>
              </div>

              {/* Base Model */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Base Model</label>
                <select
                  value={selectedBaseModel}
                  onChange={e => setSelectedBaseModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                >
                  {BASE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Method */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Training Method</label>
                <div className="flex space-x-2">
                  {TRAINING_METHODS.map(m => (
                    <button key={m} onClick={() => setSelectedMethod(m)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                        selectedMethod === m
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}>
                      {m.toUpperCase()}
                    </button>
                  ))}
                </div>
                {(selectedMethod === 'dpo' || selectedMethod === 'orpo') && (
                  <p className="text-[10px] text-amber-400">⚠️ Human approval required for {selectedMethod.toUpperCase()}</p>
                )}
              </div>

              {/* Dataset ID */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Dataset ID</label>
                <input type="text" value={datasetId} onChange={e => setDatasetId(e.target.value)}
                  placeholder="e.g. meera_sft_v1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-violet-500" />
                <p className="text-[10px] text-slate-500">Must exist in data/{selectedCapability}/{datasetId}.jsonl</p>
              </div>

              {/* Budget */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Budget (minutes, max 120)</label>
                <input type="number" value={budgetMinutes} onChange={e => setBudgetMinutes(Number(e.target.value))}
                  min={10} max={120}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-violet-500" />
              </div>

              {/* Human Approval (DPO/ORPO) */}
              {(selectedMethod === 'dpo' || selectedMethod === 'orpo') && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-amber-400 uppercase">Human Approver Name (Required)</label>
                  <input type="text" value={humanApproval} onChange={e => setHumanApproval(e.target.value)}
                    placeholder="Your name (e.g. Arshid)"
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-2xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-500" />
                </div>
              )}

              {/* Validate */}
              <button onClick={validateTrainingPlan}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition">
                <Shield className="w-4 h-4 text-violet-400" />
                <span>Validate Training Plan (Policy Engine)</span>
              </button>

              {/* Policy Result */}
              {policyStatus && (
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  policyStatus === 'PASSED'
                    ? 'bg-emerald-950/30 border-emerald-500/30'
                    : 'bg-rose-950/30 border-rose-500/30'
                }`}>
                  <div className="flex items-center space-x-2">
                    {policyStatus === 'PASSED'
                      ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                      : <XCircle className="w-4 h-4 text-rose-400" />}
                    <span className="text-sm font-bold text-white">
                      Policy Engine: {policyStatus === 'PASSED' ? 'ALL RULES PASSED' : 'VIOLATIONS FOUND'}
                    </span>
                  </div>
                  {policyViolations.map((v, i) => (
                    <p key={i} className="text-[11px] font-mono text-rose-300">❌ {v}</p>
                  ))}
                </div>
              )}

              {/* Submit */}
              <button
                disabled={policyStatus !== 'PASSED'}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition ${
                  policyStatus === 'PASSED'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Submit to Soup Worker ({selectedCapability} / {selectedMethod.toUpperCase()})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: ADAPTER REGISTRY */}
      {/* ======================================================== */}
      {section === 'registry' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Adapter Registry — 14 Capability Domains</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Base model: <code className="text-violet-300">Qwen/Qwen2.5-7B-Instruct</code> · All adapters are LoRA / QLoRA (NF4)
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2 pr-4">Capability</th>
                    <th className="pb-2 pr-4">Version</th>
                    <th className="pb-2 pr-4">Method</th>
                    <th className="pb-2 pr-4">Soup</th>
                    <th className="pb-2 pr-4">CHATR Gate</th>
                    <th className="pb-2 pr-4">Ollama Tag</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {CAPABILITIES.map(cap => {
                    const adapter = adapters.find(a => a.capability === cap.id);
                    return (
                      <tr key={cap.id} className="hover:bg-slate-900/40 transition">
                        <td className="py-2.5 pr-4">
                          <span className="mr-1.5">{cap.icon}</span>
                          <span className="text-slate-200">{cap.label}</span>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500">{adapter?.version ?? '—'}</td>
                        <td className="py-2.5 pr-4 text-slate-500">{adapter?.method ?? '—'}</td>
                        <td className="py-2.5 pr-4">
                          {adapter?.soupVerdict === 'SHIP'
                            ? <span className="text-emerald-400">SHIP</span>
                            : adapter?.soupVerdict === 'DONT_SHIP'
                              ? <span className="text-rose-400">DON'T SHIP</span>
                              : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="py-2.5 pr-4">
                          {adapter?.chatrGate === 'PASS'
                            ? <span className="text-emerald-400">PASS</span>
                            : adapter?.chatrGate === 'FAIL'
                              ? <span className="text-rose-400">FAIL</span>
                              : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="py-2.5 pr-4 text-violet-400">
                          {adapter?.ollamaTag ?? <span className="text-slate-600">not loaded</span>}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                            adapter?.status === 'PRODUCTION' ? 'bg-emerald-500/20 text-emerald-300'
                              : adapter?.status === 'TRAINING' ? 'bg-amber-500/20 text-amber-300'
                              : adapter?.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-800 text-slate-600'
                          }`}>
                            {adapter?.status === 'NOT_TRAINED' ? 'NOT TRAINED' : adapter?.status ?? '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: DATASETS */}
      {/* ======================================================== */}
      {section === 'datasets' && (
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-violet-400" />
            <span>Dataset Registry — 14 Capability Directories</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Datasets live in <code className="text-violet-300">data/&lt;capability&gt;/</code>. Every dataset requires provenance metadata before it can be approved for training.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {CAPABILITIES.map(cap => {
              const datasetCounts: Record<string, { rows: number; status: string }> = {
                general: { rows: 20, status: '✅ Approved (SHA-256: dc620faa...)' },
                coding:  { rows: 19, status: '✅ Approved (SHA-256: ad35b2bd...)' },
                meera:   { rows: 19, status: '✅ Approved (SHA-256: fa8c13c2...)' },
                rag:     { rows: 0,  status: '📚 Vector Index (pgvector / docs)' },
              };
              const meta = datasetCounts[cap.id] ?? { rows: 0, status: '0 examples · Pending' };

              return (
                <div key={cap.id} className="bg-slate-950 border border-slate-800 p-3 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm">{cap.icon}</span>
                    <span className="text-xs font-bold text-white">{cap.label}</span>
                  </div>
                  <p className="text-[10px] font-mono text-violet-300">data/{cap.id}/</p>
                  <div className="flex flex-wrap gap-1">
                    {cap.id === 'rag' ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-500/30 text-blue-300">
                        knowledge_base.parquet
                      </span>
                    ) : (
                      ['sft_v1.jsonl', 'eval.jsonl'].map(f => (
                        <span key={f} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500">
                          {f}
                        </span>
                      ))
                    )}
                  </div>
                  <p className={`text-[10px] font-mono ${meta.rows > 0 ? 'text-emerald-400 font-bold' : cap.id === 'rag' ? 'text-blue-300' : 'text-slate-600'}`}>
                    {meta.rows > 0 ? `${meta.rows} rows · ${meta.status}` : meta.status}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION: TRAINING JOBS */}
      {/* ======================================================== */}
      {section === 'jobs' && (
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-violet-400" />
            <span>Training Jobs</span>
          </h2>
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl text-center text-slate-500 text-sm">
            No training jobs yet. Submit your first job in the <strong className="text-slate-300">New Training Job</strong> tab.
          </div>
        </div>
      )}

    </div>
  );
};

export default AIHub;
