import React, { useState, useEffect, useRef } from 'react';
import { IntentKernel } from '../../kernel/IntentKernel';
import { IntelligenceRuntime } from '../../runtimes/intelligence/IntelligenceRuntime';
import { DocumentQueue, QueueJob } from '../../pipelines/document/DocumentQueue';
import { EntityGraphEngine } from '../../graph/EntityGraphEngine';
import { ScopedMemoryEngine } from '../../memory/ScopedMemoryEngine';
import { UniversalSearchService } from '../../search/UniversalSearchService';
import { UniversalSearchModal } from '../search/UniversalSearchModal';
import { WorkflowStudio } from '../workflow/WorkflowStudio';
import logo from '@/assets/chatr-icon-logo.png';
import {
  FileText, UploadCloud, Cpu, Sparkles, Shield, Search, CheckCircle, RefreshCw, Command,
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Eye, Play, ArrowRight, CornerDownLeft,
  FileCheck, ShieldAlert, Layers, BookOpen, ExternalLink, HelpCircle, Activity, Tag,
  Clock, Hash, FileSpreadsheet, AlertTriangle, CheckCircle2, Columns, GitCompare, ArrowUpRight,
  ChevronDown, ChevronUp, DollarSign, Calendar as CalendarIcon, UserCheck, Briefcase
} from 'lucide-react';

interface BoundingBox {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citation?: {
    documentName: string;
    page: number;
    clause: string;
    confidence: number;
    trustBadge: 'Verified Grounded' | 'High Confidence' | 'AI Estimate';
    bbox: BoundingBox;
  };
}

interface DocumentInsights {
  docType: 'Contract' | 'Invoice' | 'Medical' | 'General';
  readingTimeMins: number;
  confidenceScore: number;
  entitiesCount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  companies: string[];
  peopleCount: number;
  datesCount: number;
  moneyValuesCount: number;
  keyTerms: string[];
  suggestedPrompts: string[];
}

export const CHATRDocsWorkspace: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('sample_contract_microsoft_v2.pdf');
  const [compareFile, setCompareFile] = useState<string>('sample_contract_microsoft_v1.pdf');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState<boolean>(false);

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [inDocSearchQuery, setInDocSearchQuery] = useState<string>('');
  const [isBBoxPulsing, setIsBBoxPulsing] = useState<boolean>(true);
  const [workflowFeedback, setWorkflowFeedback] = useState<string | null>(null);

  const [activeBBox, setActiveBBox] = useState<BoundingBox | null>({
    page: 1,
    x: 40,
    y: 180,
    width: 520,
    height: 90,
    label: 'Clause 14.2: Governing Law & Liability Cap ($1,000,000)',
  });

  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [ingestStatus, setIngestStatus] = useState<string>('Indexed & Ready');
  const [ingestProgress, setIngestProgress] = useState<number>(100);

  // Dynamic Document Insights based on selected file
  const [insights, setInsights] = useState<DocumentInsights>({
    docType: 'Contract',
    readingTimeMins: 3,
    confidenceScore: 99.4,
    entitiesCount: 6,
    riskLevel: 'Low',
    companies: ['Microsoft Corporation', 'CHATR Systems Inc.'],
    peopleCount: 3,
    datesCount: 4,
    moneyValuesCount: 2,
    keyTerms: ['Liability Cap ($1M)', 'Delaware Law', 'Net 30', '30-Day Notice'],
    suggestedPrompts: ['Compare v1 vs v2 changes', 'Find termination clause', 'List payment terms'],
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'assistant',
      text: 'Welcome to CHATR Docs Multi-Document Intelligence. You can compare document versions, diff clauses, and trigger Business OS workflows directly.',
    },
    {
      id: 'msg_2',
      sender: 'assistant',
      text: 'Verified: According to Section 14.2 of the Master Services Agreement (v2), aggregate liability cap was increased to $1,000,000 USD (up from $500,000 USD in v1).',
      citation: {
        documentName: 'sample_contract_microsoft_v2.pdf',
        page: 1,
        clause: 'Clause 14.2: Limitation of Liability',
        confidence: 99.2,
        trustBadge: 'Verified Grounded',
        bbox: {
          page: 1,
          x: 40,
          y: 180,
          width: 520,
          height: 90,
          label: 'Clause 14.2: Governing Law & Liability Cap ($1,000,000)',
        },
      },
    },
  ]);

  const documentViewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Boot Intent Kernel & seed cross-domain items into Universal Search
    IntentKernel.boot().then(() => {
      IntentKernel.runtimeManager.registerRuntime(IntelligenceRuntime);
      IntelligenceRuntime.initialize();

      UniversalSearchService.indexItem({
        domain: 'Document',
        title: 'Master Services Agreement v2 (Microsoft)',
        snippet: 'Section 14.2 Limitation of Liability: Aggregate liability capped at $1,000,000 USD...',
        score: 0.98,
        urlOrPath: 'sample_contract_microsoft_v2.pdf',
        timestamp: new Date().toISOString(),
      });
    });

    const unsubscribe = DocumentQueue.onUpdate(() => {
      setJobs(DocumentQueue.getQueue());
    });

    return () => unsubscribe();
  }, []);

  const handleSelectFile = (fileName: string) => {
    setSelectedFile(fileName);
    setIngestStatus('Streaming Upload & Parsing...');
    setIngestProgress(25);

    if (fileName.includes('invoice')) {
      setInsights({
        docType: 'Invoice',
        readingTimeMins: 1,
        confidenceScore: 99.8,
        entitiesCount: 4,
        riskLevel: 'Low',
        companies: ['Acme Corporation'],
        peopleCount: 1,
        datesCount: 2,
        moneyValuesCount: 3,
        keyTerms: ['INV-2026-884', '$4,250.00 USD', 'Tax ID'],
        suggestedPrompts: ['Extract line item totals', 'Due date', 'Push to Finance Ledger'],
      });
    } else {
      setInsights({
        docType: 'Contract',
        readingTimeMins: 3,
        confidenceScore: 99.4,
        entitiesCount: 6,
        riskLevel: 'Low',
        companies: ['Microsoft Corporation', 'CHATR Systems Inc.'],
        peopleCount: 3,
        datesCount: 4,
        moneyValuesCount: 2,
        keyTerms: ['Liability Cap ($1M)', 'Delaware Law', 'Net 30', '30-Day Notice'],
        suggestedPrompts: ['Compare v1 vs v2 changes', 'Find termination clause', 'List payment terms'],
      });
    }

    setTimeout(() => {
      setIngestStatus('Indexed & Ready');
      setIngestProgress(100);
      IntelligenceRuntime.ingestDocument(`C:\\Users\\Arshid.Wani\\Documents\\CHATR\\${fileName}`);
    }, 500);
  };

  const handleAskQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: questionText,
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      const q = questionText.toLowerCase();
      let answerText = 'I scanned the multi-document repository and extracted matching clause revisions.';
      let citationObj: ChatMessage['citation'] = undefined;

      if (q.includes('compare') || q.includes('diff') || q.includes('change') || q.includes('v1')) {
        answerText = 'Multi-Doc Diff Analysis: Section 14.2 increased liability cap from $500K to $1M USD. Section 18.1 reduced termination notice period from 60 days to 30 days.';
        citationObj = {
          documentName: selectedFile,
          page: 1,
          clause: 'Clause 14.2 vs v1 Clause 12.1',
          confidence: 99.5,
          trustBadge: 'Verified Grounded',
          bbox: {
            page: 1,
            x: 40,
            y: 180,
            width: 520,
            height: 90,
            label: 'Diff Match: Liability Cap Increased to $1,000,000 USD',
          },
        };
      } else if (q.includes('termination') || q.includes('cancel')) {
        answerText = 'Verified: Section 18.1 allows termination for convenience upon 30 days written notice.';
        citationObj = {
          documentName: selectedFile,
          page: 2,
          clause: 'Clause 18.1: Termination Rights',
          confidence: 98.4,
          trustBadge: 'Verified Grounded',
          bbox: {
            page: 2,
            x: 40,
            y: 310,
            width: 520,
            height: 85,
            label: 'Clause 18.1: 30-Day Termination Notice',
          },
        };
      } else {
        answerText = `Verified Grounded Match in ${selectedFile}: "${questionText}" matches Section 3.1 scope specifications.`;
        citationObj = {
          documentName: selectedFile,
          page: 1,
          clause: 'Section 3.1: Scope of Work',
          confidence: 97.2,
          trustBadge: 'Verified Grounded',
          bbox: {
            page: 1,
            x: 40,
            y: 100,
            width: 520,
            height: 60,
            label: 'Section 3.1 Scope of Work',
          },
        };
      }

      const assistantMsg: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        sender: 'assistant',
        text: answerText,
        citation: citationObj,
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (citationObj) {
        setCurrentPage(citationObj.page);
        setActiveBBox(citationObj.bbox);
        setIsBBoxPulsing(true);
      }
    }, 450);
  };

  const handleCitationClick = (citation: NonNullable<ChatMessage['citation']>) => {
    setCurrentPage(citation.page);
    setActiveBBox(citation.bbox);
    setIsBBoxPulsing(true);
    if (documentViewerRef.current) {
      documentViewerRef.current.scrollTo({ top: citation.bbox.y - 40, behavior: 'smooth' });
    }
  };

  const handleTriggerBusinessOS = (workflowType: string) => {
    if (workflowType === 'finance') {
      setWorkflowFeedback('Pushed Acme Invoice INV-2026-884 ($4,250.00) to Business OS Finance Ledger!');
    } else if (workflowType === 'calendar') {
      setWorkflowFeedback('Created Contract Renewal Task & Calendar Sync for October 1, 2027!');
    } else if (workflowType === 'hr') {
      setWorkflowFeedback('Pushed Candidate Resume to HR People Ops Roster!');
    }
    setTimeout(() => setWorkflowFeedback(null), 4000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="CHATR" className="w-7 h-7 object-contain rounded" />
          <div>
            <h1 className="font-bold text-sm text-white flex items-center gap-2">
              CHATR Docs
              <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono rounded border border-cyan-500/30 font-semibold">
                Sprint 3 Multi-Doc Intelligence
              </span>
            </h1>
          </div>
        </div>

        {/* Header Action Controls & Industry Case Study Triggers */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <span className="text-[10px] text-slate-500 font-mono font-bold px-1.5">Validation Case Studies:</span>
            <button
              onClick={() => {
                setSelectedFile('Master_Service_Agreement_120pg.pdf');
                setIsInsightsExpanded(true);
                handleAskQuestion('What legal risks should I review?');
              }}
              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded font-sans font-bold text-[11px] border border-amber-500/40"
            >
              1. Legal
            </button>
            <button
              onClick={() => {
                handleSelectFile('acme_invoice_2026.pdf');
                setIsInsightsExpanded(true);
                handleAskQuestion('Extract line item totals & tax ID');
              }}
              className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded font-sans font-bold text-[11px] border border-emerald-500/40"
            >
              2. Finance
            </button>
            <button
              onClick={() => {
                handleSelectFile('resume_senior_engineer.pdf');
                setIsInsightsExpanded(true);
                handleAskQuestion('Compare candidate skills and experience');
              }}
              className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded font-sans font-bold text-[11px] border border-indigo-500/40"
            >
              3. HR
            </button>
            <button
              onClick={() => {
                handleSelectFile('starlight_ehr_report.pdf');
                setIsInsightsExpanded(true);
                handleAskQuestion('Highlight abnormal vitals & medications');
              }}
              className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded font-sans font-bold text-[11px] border border-rose-500/40"
            >
              4. Health
            </button>
            <button
              onClick={() => {
                handleSelectFile('supplier_agreement_2026.pdf');
                setIsInsightsExpanded(true);
                handleAskQuestion('Identify renewal dates & compliance');
              }}
              className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded font-sans font-bold text-[11px] border border-cyan-500/40"
            >
              5. Procurement
            </button>
          </div>

          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-sans font-medium text-xs shadow-sm transition-all ${
              isCompareMode
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isCompareMode ? 'Exit Diff Mode' : 'Side-by-Side Compare'}</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-all font-sans font-medium text-xs shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Universal Search</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded font-mono text-slate-400 border border-slate-700">Ctrl + K</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Baidu Unlimited-OCR</span>
          </div>
        </div>
      </header>

      {/* Workflow Notification Banner */}
      {workflowFeedback && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-2 text-xs text-emerald-300 font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{workflowFeedback}</span>
        </div>
      )}

      {/* Main 3-Pane Workspace Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANE 1 (LEFT): Document Explorer & Multi-Doc Selection */}
        <div className="w-72 border-r border-slate-800 bg-slate-950/90 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Upload Zone */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Ingest Workspace PDF
              </span>
              <div
                onClick={() => handleSelectFile('new_custom_document.pdf')}
                className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/60 p-3 rounded-xl text-center cursor-pointer transition-all group"
              >
                <UploadCloud className="w-5 h-5 text-cyan-400 mx-auto group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-200 mt-1 block">Drop PDF or Click to Upload</span>
              </div>
            </div>

            {/* Document Repository List */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Workspace Repository ({isCompareMode ? 'Multi-Select Diff' : 'Single View'})
              </span>
              <div className="space-y-1">
                {[
                  { name: 'sample_contract_microsoft_v2.pdf', tag: 'Version 2 (Current)', type: 'Contract' },
                  { name: 'sample_contract_microsoft_v1.pdf', tag: 'Version 1 (Previous)', type: 'Contract' },
                  { name: 'acme_invoice_2026.pdf', tag: 'INV-2026-884', type: 'Invoice' },
                ].map(doc => {
                  const isSelected = selectedFile === doc.name;
                  return (
                    <button
                      key={doc.name}
                      onClick={() => handleSelectFile(doc.name)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 font-semibold shadow-sm'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <div className="truncate flex-1">
                        <div className="truncate font-medium">{doc.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{doc.tag}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Business OS One-Click Workflow Actions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">
                Business OS Action Triggers
              </span>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => handleTriggerBusinessOS('finance')}
                  className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-2 transition-all"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Push Invoice to Finance Ledger</span>
                </button>
                <button
                  onClick={() => handleTriggerBusinessOS('calendar')}
                  className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-2 transition-all"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Create Renewal Reminder</span>
                </button>
              </div>
            </div>
          </div>

          {/* System Security Badge */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2.5 text-[10px] text-slate-400 font-mono">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Local Scope Memory Security</span>
          </div>
        </div>

        {/* PANE 2 (CENTER): Interactive PDF Reader Viewport (Single or Side-by-Side Diff) */}
        <div className="flex-1 flex flex-col bg-slate-900/50 border-r border-slate-800 overflow-hidden">
          {/* Reader Toolbar */}
          <div className="h-12 border-b border-slate-800 bg-slate-950/60 px-4 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="p-1 hover:bg-slate-800 rounded text-slate-300">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {currentPage} of 4</span>
              <button onClick={() => setCurrentPage(prev => Math.min(4, prev + 1))} className="p-1 hover:bg-slate-800 rounded text-slate-300">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* In-Document Search */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={inDocSearchQuery}
                onChange={e => setInDocSearchQuery(e.target.value)}
                placeholder="Cross-document search..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-36 font-sans"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
                className="flex items-center gap-1 text-[11px] text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/30"
              >
                <span>Executive Summary</span>
                {isInsightsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* EXPANDABLE EXECUTIVE SUMMARY CARD (Sprint 3 Feature) */}
          {isInsightsExpanded && (
            <div className="bg-slate-950 border-b border-slate-800 p-4 font-mono text-xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Document Executive Intelligence Card</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                    Verified Grounded
                  </span>
                </div>
                <span className="text-slate-400">Risk Assessment: <strong className="text-emerald-400">Low Risk</strong></span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-[11px]">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Companies Identified</span>
                  <div className="font-bold text-white mt-0.5">{insights.companies.join(', ')}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">People / Signatories</span>
                  <div className="font-bold text-cyan-300 mt-0.5">{insights.peopleCount} Executive Contacts</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Key Dates & Deadlines</span>
                  <div className="font-bold text-indigo-300 mt-0.5">{insights.datesCount} Milestone Dates</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Financial Liability</span>
                  <div className="font-bold text-emerald-400 mt-0.5">$1,000,000 USD Cap</div>
                </div>
              </div>

              {/* AI Workflow Studio Component (Sprint 4) */}
              <div className="pt-2">
                <WorkflowStudio
                  docName={selectedFile}
                  docType={insights.docType}
                  onWorkflowComplete={msg => setWorkflowFeedback(msg)}
                />
              </div>
            </div>
          )}

          {/* Interactive Document Page Viewport (Single or Side-by-Side Diff) */}
          <div ref={documentViewerRef} className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-950/90 relative gap-6">
            {/* Primary Document (Doc A) */}
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className={`${isCompareMode ? 'w-[440px]' : 'w-[600px]'} min-h-[780px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8 space-y-5 relative transition-all font-sans text-slate-300 text-xs`}
            >
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">{selectedFile}</h2>
                  <span className="text-[10px] text-cyan-400 font-mono">Current Active Document</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded">Page {currentPage}</span>
              </div>

              <div className="space-y-4">
                <div className={`p-3 rounded-lg border transition-all ${
                  isCompareMode ? 'bg-emerald-950/40 border-emerald-500/50 ring-2 ring-emerald-500/20' : 'bg-cyan-950/40 border-cyan-400'
                }`}>
                  <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase mb-1">
                    {isCompareMode ? '+ Added Revision in v2' : 'Clause 14.2 Match'}
                  </div>
                  <h3 className="font-bold text-white text-xs">SECTION 14.2: LIMITATION OF LIABILITY</h3>
                  <p className="mt-1 text-slate-200">
                    Maximum aggregate liability under this Agreement shall not exceed $1,000,000 USD. Governed by Delaware law.
                  </p>
                </div>
              </div>
            </div>

            {/* Side-by-Side Compare Document (Doc B - Diff View) */}
            {isCompareMode && (
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="w-[440px] min-h-[780px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8 space-y-5 relative transition-all font-sans text-slate-300 text-xs opacity-90"
              >
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{compareFile}</h2>
                    <span className="text-[10px] text-rose-400 font-mono">Previous Revision (v1)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded">Page {currentPage}</span>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-lg">
                    <div className="text-[9px] font-mono text-rose-400 font-bold uppercase mb-1">
                      - Superseded Clause in v1
                    </div>
                    <h3 className="font-bold text-slate-300 text-xs">SECTION 12.1: LIMITATION OF LIABILITY (v1)</h3>
                    <p className="mt-1 text-slate-400 line-through">
                      Maximum aggregate liability shall not exceed $500,000 USD. Governed by New York law.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PANE 3 (RIGHT): Grounded AI Assistant Chat & High-Trust Cards */}
        <div className="w-96 bg-slate-950 p-4 flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white">Grounded AI Assistant</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Verified Grounded
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 font-sans">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl text-xs space-y-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white ml-6 font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 mr-2'
                }`}
              >
                <p>{msg.text}</p>

                {/* Grounded Visual Citation Card */}
                {msg.citation && (
                  <button
                    onClick={() => handleCitationClick(msg.citation!)}
                    className="w-full text-left p-2.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 transition-all font-mono text-[11px] space-y-1 block group shadow-sm"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        {msg.citation.clause}
                      </span>
                      <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Page {msg.citation.page}</span>
                      <span className="text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-500/20 rounded border border-emerald-500/30">
                        {msg.citation.trustBadge} ({msg.citation.confidence}%)
                      </span>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* DYNAMIC DOCUMENT-SPECIFIC QUICK PROMPTS */}
          <div className="py-2 space-y-1.5 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
              Suggested Prompts
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {insights.suggestedPrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleAskQuestion(prompt)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-all text-left truncate max-w-full"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Question Input Form */}
          <form onSubmit={e => { e.preventDefault(); handleAskQuestion(chatInput); }} className="pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask anything or compare versions..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                className="absolute right-2 p-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-all"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* BOTTOM BAR: Ingestion Timeline Footer */}
      <footer className="h-10 border-t border-slate-800 bg-slate-950 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${ingestProgress < 100 ? 'animate-spin' : ''}`} />
            <span>Multi-Doc Pipeline: {ingestStatus}</span>
          </div>
          <div className="w-32 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all" style={{ width: `${ingestProgress}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span>Mode: {isCompareMode ? 'Side-by-Side Diff' : 'Single Document'}</span>
          <span className="text-emerald-400 font-bold">Zero Kernel Edits</span>
        </div>
      </footer>

      {/* Universal Search Modal (Ctrl + K) */}
      <UniversalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
