import React, { useState, useEffect, useRef } from 'react';
import { IntentKernel } from '../../kernel/IntentKernel';
import { IntelligenceRuntime } from '../../runtimes/intelligence/IntelligenceRuntime';
import { DocumentQueue, QueueJob } from '../../pipelines/document/DocumentQueue';
import { UniversalSearchService } from '../../search/UniversalSearchService';
import { UniversalSearchModal } from '../search/UniversalSearchModal';
import { WorkflowStudio } from '../workflow/WorkflowStudio';
import logo from '@/assets/chatr-icon-logo.png';
import {
  FileText, UploadCloud, Cpu, Sparkles, Shield, Search, CheckCircle, RefreshCw, Command,
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Eye, Play, ArrowRight, CornerDownLeft,
  FileCheck, ShieldAlert, Layers, BookOpen, ExternalLink, HelpCircle, Activity, Tag,
  Clock, Hash, FileSpreadsheet, AlertTriangle, CheckCircle2, Columns, GitCompare, ArrowUpRight,
  ChevronDown, ChevronUp, DollarSign, Calendar as CalendarIcon, UserCheck, Briefcase, Settings, Loader2
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
    conversationalText?: string;
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

interface DocumentItem {
  id: string;
  name: string;
  pages: number;
  date: string;
  status: 'Uploading...' | 'Reading document...' | 'Preparing insights...' | 'Ready' | 'Needs Attention';
  type: string;
}

export const CHATRDocsWorkspace: React.FC = () => {
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: '1', name: 'Master_Service_Agreement_120pg.pdf', pages: 120, date: 'Updated today', status: 'Ready', type: 'Contract' },
    { id: '2', name: 'acme_invoice_2026.pdf', pages: 3, date: 'Yesterday', status: 'Ready', type: 'Invoice' },
    { id: '3', name: 'resume_senior_engineer.pdf', pages: 2, date: 'Last week', status: 'Ready', type: 'HR' }
  ]);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [compareFile, setCompareFile] = useState<string>('acme_invoice_2026.pdf');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState<boolean>(true);

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

  const [chatInput, setChatInput] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Ingestion stats for dev mode
  const [ingestStatus, setIngestStatus] = useState<string>('Indexed & Ready');
  const [ingestProgress, setIngestProgress] = useState<number>(100);

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
    suggestedPrompts: ['Compare versions', 'Summarize payment terms', 'Review legal risks'],
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const documentViewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    IntentKernel.boot().then(() => {
      IntentKernel.runtimeManager.registerRuntime(IntelligenceRuntime);
      IntelligenceRuntime.initialize();
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDocId = `doc_${Date.now()}`;
    const newDoc: DocumentItem = {
      id: newDocId,
      name: file.name,
      pages: Math.floor(Math.random() * 20) + 1, // mock
      date: 'Just now',
      status: 'Uploading...',
      type: 'General'
    };

    setDocuments(prev => [newDoc, ...prev]);
    setSelectedFile(file.name);
    setIngestStatus('Uploading...');
    setIngestProgress(20);

    // Mock processing pipeline
    setTimeout(() => {
      setDocuments(prev => prev.map(d => d.id === newDocId ? { ...d, status: 'Reading document...' } : d));
      setIngestStatus('Reading document...');
      setIngestProgress(50);
    }, 1500);

    setTimeout(() => {
      setDocuments(prev => prev.map(d => d.id === newDocId ? { ...d, status: 'Preparing insights...' } : d));
      setIngestStatus('Preparing insights...');
      setIngestProgress(80);
    }, 3000);

    setTimeout(() => {
      setDocuments(prev => prev.map(d => d.id === newDocId ? { ...d, status: 'Ready' } : d));
      setIngestStatus('Indexed & Ready');
      setIngestProgress(100);
      
      setInsights({
        docType: 'Contract',
        readingTimeMins: 2,
        confidenceScore: 98.1,
        entitiesCount: 2,
        riskLevel: 'Medium',
        companies: ['Unknown Entity'],
        peopleCount: 1,
        datesCount: 1,
        moneyValuesCount: 0,
        keyTerms: ['General Terms'],
        suggestedPrompts: ['What is this document about?', 'Extract key dates'],
      });
      
      IntelligenceRuntime.ingestDocument(file.name);
    }, 4500);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectFile = (fileName: string) => {
    setSelectedFile(fileName);
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
        suggestedPrompts: ['Compare versions', 'Summarize payment terms', 'Review legal risks'],
      });
    }
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
      let answerText = isDeveloperMode 
        ? 'I scanned the multi-document repository and extracted matching clause revisions.'
        : 'I found the following information in the document.';
        
      let citationObj: ChatMessage['citation'] = undefined;

      if (q.includes('compare') || q.includes('diff') || q.includes('change') || q.includes('v1')) {
        answerText = isDeveloperMode
          ? 'Multi-Doc Diff Analysis: Section 14.2 increased liability cap from $500K to $1M USD. Section 18.1 reduced termination notice period from 60 days to 30 days.'
          : 'I found a few differences between the versions. The liability cap increased, and the termination notice was reduced to 30 days.';
        citationObj = {
          documentName: selectedFile || 'document.pdf',
          page: 1,
          clause: 'Clause 14.2 vs v1 Clause 12.1',
          conversationalText: 'the liability cap increased from $500K to $1M USD.',
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
        answerText = isDeveloperMode
          ? 'Verified: Section 18.1 allows termination for convenience upon 30 days written notice.'
          : 'You can terminate the agreement for convenience with 30 days written notice.';
        citationObj = {
          documentName: selectedFile || 'document.pdf',
          page: 2,
          clause: 'Clause 18.1',
          conversationalText: 'termination is allowed for convenience with 30 days written notice.',
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
        answerText = isDeveloperMode
          ? `Verified Grounded Match in ${selectedFile}: "${questionText}" matches Section 3.1 scope specifications.`
          : `I found a match for your query in Section 3.1.`;
        citationObj = {
          documentName: selectedFile || 'document.pdf',
          page: 1,
          clause: 'Section 3.1',
          conversationalText: `this section covers relevant scope specifications.`,
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Ready': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Needs Attention': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <img src={logo} alt="CHATR" className="w-7 h-7 object-contain rounded" />
          <h1 className="font-bold text-sm text-white flex items-center gap-2">
            CHATR Docs
            {isDeveloperMode && (
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono rounded border border-indigo-500/30 font-semibold">
                Developer Mode
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {isDeveloperMode ? (
            <div className="flex items-center gap-2 font-mono text-slate-400">
              <button onClick={() => setIsCompareMode(!isCompareMode)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm transition-all ${isCompareMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}><GitCompare className="w-3.5 h-3.5" /><span>{isCompareMode ? 'Exit Diff Mode' : 'Side-by-Side Compare'}</span></button>
              <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-500/30 shadow-sm"><Search className="w-3.5 h-3.5" /><span>Universal Search</span><span className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded border border-slate-700">Ctrl + K</span></button>
              <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700"><Cpu className="w-3.5 h-3.5 text-emerald-400" /><span>Baidu Unlimited-OCR</span></div>
            </div>
          ) : (
            selectedFile && (
              <div className="flex items-center gap-5 text-slate-300 font-sans">
                 <span className="font-semibold text-white max-w-[200px] truncate">{selectedFile}</span>
                 <span className="text-slate-500">Updated today</span>
                 <button className="flex items-center gap-1.5 hover:text-white transition-colors" onClick={() => setIsSearchOpen(true)}><Search className="w-4 h-4"/> Search</button>
                 <button className="flex items-center gap-1.5 hover:text-white transition-colors"><ExternalLink className="w-4 h-4"/> Share</button>
              </div>
            )
          )}

          {/* Settings Menu for Dev Mode Toggle */}
          <div className="relative border-l border-slate-800 pl-4 ml-2">
            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            {isSettingsOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500">Advanced Settings</div>
                <label className="flex items-center justify-between px-4 py-3 hover:bg-slate-800 cursor-pointer text-xs text-slate-300 transition-colors">
                  <span className="font-medium">Enable Developer Mode</span>
                  <input type="checkbox" checked={isDeveloperMode} onChange={() => setIsDeveloperMode(!isDeveloperMode)} className="accent-indigo-500 w-4 h-4 rounded border-slate-600 cursor-pointer" />
                </label>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANE 1 (LEFT, 20%): Sidebar */}
        <div className="w-1/5 min-w-[280px] max-w-[320px] border-r border-slate-800 bg-slate-950 p-4 flex flex-col space-y-5 overflow-y-auto">
          
          <div className="space-y-3">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,image/*" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-950/20 bg-slate-900/60 rounded-xl p-4 text-center cursor-pointer transition-all group"
            >
              <UploadCloud className="w-5 h-5 text-cyan-400 mx-auto group-hover:scale-110 transition-transform mb-2" />
              <span className="text-sm font-semibold text-slate-200 block">+ Upload documents</span>
              <span className="text-xs text-slate-500 mt-1 block">Drag PDFs, Word or Images here<br/>or Browse Files</span>
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-400 px-1 block">Recent Documents</span>
            <div className="space-y-2">
              {documents.map(doc => {
                const isSelected = selectedFile === doc.name;
                const isProcessing = doc.status !== 'Ready' && doc.status !== 'Needs Attention';
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectFile(doc.name)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-cyan-950/20 border-cyan-500/30 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <div className="flex-1 overflow-hidden">
                        <div className={`text-sm truncate font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>{doc.name}</div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span>{doc.pages} pages</span>
                          <span>•</span>
                          <span>{doc.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`self-start text-[10px] px-2 py-0.5 rounded border flex items-center gap-1.5 ${getStatusColor(doc.status)} font-medium`}>
                      {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                      {doc.status}
                    </div>
                  </button>
                );
              })}
              {documents.length === 0 && (
                <div className="text-center p-4 text-xs text-slate-500 bg-slate-900/30 rounded-lg border border-slate-800 border-dashed">
                  Nothing uploaded yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANE 2 (CENTER, 60%): Document Hero View */}
        <div className="w-3/5 flex flex-col bg-slate-900/30 border-r border-slate-800 overflow-hidden relative">
          {!selectedFile ? (
            // EMPTY STATE
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-200 mb-2">Drop your first document here</h2>
              <p className="text-slate-400 mb-6 text-sm">Supports PDF, Word, and Images</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-cyan-900/20"
              >
                Browse Files
              </button>
            </div>
          ) : (
            // ACTIVE DOCUMENT
            <>
              {/* Document Header & Overview */}
              <div className="shrink-0 bg-slate-950/80 backdrop-blur border-b border-slate-800 p-4 lg:p-6 shadow-sm z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white tracking-tight">{isDeveloperMode ? 'Document Executive Intelligence Card' : 'Overview'}</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsInsightsExpanded(!isInsightsExpanded)} className="text-slate-400 hover:text-white transition-colors">
                      {isInsightsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isInsightsExpanded && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                        {insights.docType}
                      </div>
                      <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-medium">
                        $1M Value
                      </div>
                      <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                        Renews Oct 1
                      </div>
                      <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                        30-day Notice
                      </div>
                      <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                        Delaware
                      </div>
                      <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium rounded-lg">
                        Low Risk
                      </div>
                    </div>
                    
                    {/* Action Studio embedded in overview */}
                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                      <WorkflowStudio
                        docName={selectedFile}
                        docType={insights.docType}
                        isDeveloperMode={isDeveloperMode}
                        onWorkflowComplete={msg => setWorkflowFeedback(msg)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PDF Viewport (Hero) */}
              <div ref={documentViewerRef} className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-950/80">
                <div 
                  className="w-full max-w-[800px] min-h-[1100px] bg-white rounded-sm shadow-2xl shadow-black p-12 text-slate-900 font-serif relative"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                >
                  <h1 className="text-2xl font-bold text-center mb-8 uppercase tracking-widest border-b-2 border-black pb-4">Master Service Agreement</h1>
                  <p className="mb-6">This Master Service Agreement ("Agreement") is entered into as of the Effective Date by and between the parties.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-2">1. Scope of Services</h3>
                      <p className="text-justify leading-relaxed">Provider agrees to perform the services described in each Statement of Work ("SOW") executed by the parties. All services shall be performed in a professional and workmanlike manner.</p>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg mb-2">2. Term and Termination</h3>
                      <p className="text-justify leading-relaxed">This Agreement shall commence on the Effective Date and continue until terminated. <span className="bg-yellow-200/50 rounded px-1">Either party may terminate this Agreement for convenience upon thirty (30) days prior written notice.</span></p>
                    </div>

                    <div className="mt-8 p-1 relative">
                      <div className={`absolute -inset-2 rounded-lg transition-all duration-700 ${isBBoxPulsing ? 'bg-cyan-400/20 ring-2 ring-cyan-400' : ''}`}></div>
                      <h3 className="font-bold text-lg mb-2 relative z-10">14. Limitation of Liability</h3>
                      <p className="text-justify leading-relaxed relative z-10 font-bold bg-yellow-200/40 p-2 rounded">
                        14.2 Maximum aggregate liability under this Agreement shall not exceed $1,000,000 USD. Governed by Delaware law.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* PANE 3 (RIGHT, 20%): Assistant */}
        <div className="w-1/5 min-w-[320px] max-w-[400px] bg-slate-950 p-4 flex flex-col justify-between overflow-hidden">
          
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">
                {isDeveloperMode ? 'Grounded AI Assistant' : 'Assistant'}
              </h3>
            </div>
            {isDeveloperMode && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Verified Grounded
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 font-sans pr-2">
            {messages.length === 0 && !isDeveloperMode && (
              <div className="text-center text-slate-500 text-xs py-8 px-4 animate-in fade-in">
                Select a document and ask a question to begin analyzing.
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl text-xs space-y-2 leading-relaxed max-w-[90%] shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                }`}>
                  <p>{msg.text}</p>
                </div>

                {msg.citation && (
                  isDeveloperMode ? (
                    <button
                      onClick={() => handleCitationClick(msg.citation!)}
                      className="w-[90%] text-left mt-2 p-2.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 transition-all font-mono text-[11px] space-y-1 group shadow-sm"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 truncate pr-2">
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          {msg.citation.clause}
                        </span>
                        <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Page {msg.citation.page}</span>
                        <span className="text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-500/20 rounded border border-emerald-500/30">
                          {msg.citation.trustBadge} ({msg.citation.confidence}%)
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="w-[90%] mt-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs">
                      <p className="text-slate-300 leading-relaxed mb-2">
                        <span className="font-semibold text-slate-200">Source:</span> {msg.citation.clause}
                      </p>
                      <button 
                        onClick={() => handleCitationClick(msg.citation!)} 
                        className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View in document
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>

          <div className="shrink-0 pt-3">
            {!isDeveloperMode && selectedFile && (
              <div className="mb-3 space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block px-1">Try asking</span>
                <div className="flex flex-col gap-1.5 text-xs">
                  {['Compare this with last year\'s version', 'What obligations do we have?', 'What changed?', 'Summarize payment terms', 'Review legal risks'].slice(0, 3).map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => handleAskQuestion(prompt)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:border-slate-600 transition-all text-left truncate font-medium"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={e => { e.preventDefault(); handleAskQuestion(chatInput); }}>
              <div className="relative flex flex-col bg-slate-900 border border-slate-700 focus-within:border-cyan-500/50 rounded-xl overflow-hidden shadow-inner transition-colors">
                <textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask anything about this document..."
                  className="w-full bg-transparent py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none resize-none h-16"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion(chatInput);
                    }
                  }}
                />
                <div className="absolute right-2 bottom-2">
                  <button
                    type="submit"
                    className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>

      {isDeveloperMode && (
        <footer className="h-10 border-t border-slate-800 bg-slate-950 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 shrink-0">
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
            <span className="text-emerald-400 font-bold">Zero Kernel Edits</span>
          </div>
        </footer>
      )}

      <UniversalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
