import React, { useState, useEffect, useRef } from 'react';
import { IntentKernel } from '../../kernel/IntentKernel';
import { IntelligenceRuntime } from '../../runtimes/intelligence/IntelligenceRuntime';
import { DocumentQueue, QueueJob } from '../../pipelines/document/DocumentQueue';
import { EntityGraphEngine } from '../../graph/EntityGraphEngine';
import { ScopedMemoryEngine } from '../../memory/ScopedMemoryEngine';
import { UniversalSearchService } from '../../search/UniversalSearchService';
import { UniversalSearchModal } from '../search/UniversalSearchModal';
import logo from '@/assets/chatr-icon-logo.png';
import {
  FileText, UploadCloud, Cpu, Sparkles, Shield, Search, CheckCircle, RefreshCw, Command,
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Eye, Play, ArrowRight, CornerDownLeft,
  FileCheck, ShieldAlert, Layers, BookOpen, ExternalLink, HelpCircle, Activity, Tag,
  Clock, Hash, FileSpreadsheet, AlertTriangle, CheckCircle2
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
  keyTerms: string[];
  suggestedPrompts: string[];
}

export const CHATRDocsWorkspace: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('sample_contract_microsoft.pdf');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [inDocSearchQuery, setInDocSearchQuery] = useState<string>('');
  const [isBBoxPulsing, setIsBBoxPulsing] = useState<boolean>(true);

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
    companies: ['Microsoft Corporation', 'CHATR Systems'],
    keyTerms: ['Liability Cap', 'Delaware Law', 'Net 30'],
    suggestedPrompts: ['Find termination clause', 'List obligations', 'Payment terms & late fees'],
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'assistant',
      text: 'Welcome to CHATR Docs. I have performed instant document intelligence on your contract.',
    },
    {
      id: 'msg_2',
      sender: 'assistant',
      text: 'According to Section 14.2 of the Master Services Agreement, aggregate liability is capped at $1,000,000 USD governed by Delaware law.',
      citation: {
        documentName: 'sample_contract_microsoft.pdf',
        page: 1,
        clause: 'Clause 14.2: Limitation of Liability',
        confidence: 98.6,
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
        title: 'Master Services Agreement (Microsoft)',
        snippet: 'Section 14.2 Limitation of Liability: Neither party shall be liable for indirect damages...',
        score: 0.98,
        urlOrPath: 'sample_contract_microsoft.pdf',
        timestamp: new Date().toISOString(),
      });
    });

    const unsubscribe = DocumentQueue.onUpdate(() => {
      setJobs(DocumentQueue.getQueue());
    });

    return () => unsubscribe();
  }, []);

  // Update Insights when selected file changes
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
        keyTerms: ['INV-2026-884', '$4,250.00 USD', 'Tax ID'],
        suggestedPrompts: ['Extract line item totals', 'Due date', 'Vendor tax ID'],
      });
    } else if (fileName.includes('ehr') || fileName.includes('medical')) {
      setInsights({
        docType: 'Medical',
        readingTimeMins: 4,
        confidenceScore: 99.1,
        entitiesCount: 8,
        riskLevel: 'Medium',
        companies: ['Starlight Health'],
        keyTerms: ['Lab Vitals', 'ICD-10 Code', 'Dosage'],
        suggestedPrompts: ['Abnormal vitals', 'Diagnoses', 'Medications prescribed'],
      });
    } else {
      setInsights({
        docType: 'Contract',
        readingTimeMins: 3,
        confidenceScore: 99.4,
        entitiesCount: 6,
        riskLevel: 'Low',
        companies: ['Microsoft Corporation', 'CHATR Systems'],
        keyTerms: ['Liability Cap', 'Delaware Law', 'Net 30'],
        suggestedPrompts: ['Find termination clause', 'List obligations', 'Payment terms & late fees'],
      });
    }

    setTimeout(() => {
      setIngestStatus('Baidu Unlimited-OCR Processing...');
      setIngestProgress(60);
    }, 300);

    setTimeout(() => {
      setIngestStatus('Indexed & Ready');
      setIngestProgress(100);
      IntelligenceRuntime.ingestDocument(`C:\\Users\\Arshid.Wani\\Documents\\CHATR\\${fileName}`);
    }, 700);
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
      let answerText = 'I scanned the document structure and extracted the matching clause.';
      let citationObj: ChatMessage['citation'] = undefined;

      if (q.includes('termination') || q.includes('cancel')) {
        answerText = 'Section 18.1 states that either party may terminate this agreement for convenience upon thirty (30) days written notice.';
        citationObj = {
          documentName: selectedFile,
          page: 2,
          clause: 'Clause 18.1: Termination Rights',
          confidence: 97.8,
          bbox: {
            page: 2,
            x: 40,
            y: 310,
            width: 520,
            height: 85,
            label: 'Clause 18.1: 30-Day Written Termination Notice',
          },
        };
      } else if (q.includes('payment') || q.includes('fee') || q.includes('cost') || q.includes('line')) {
        answerText = 'Section 4.3 dictates Net 30 payment terms upon receipt of invoice, with a 1.5% monthly late fee for overdue balances.';
        citationObj = {
          documentName: selectedFile,
          page: 1,
          clause: 'Clause 4.3: Payment & Invoicing Terms',
          confidence: 99.2,
          bbox: {
            page: 1,
            x: 40,
            y: 420,
            width: 520,
            height: 75,
            label: 'Clause 4.3: Net 30 Payment Terms & 1.5% Late Fee',
          },
        };
      } else {
        answerText = `Found reference in ${selectedFile}: "${questionText}" matches Section 3.1 scope of work requirements.`;
        citationObj = {
          documentName: selectedFile,
          page: 1,
          clause: 'Section 3.1: Scope of Work',
          confidence: 96.5,
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
                Sprint 2 Reader Excellence
              </span>
            </h1>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
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
            <span>Baidu Unlimited-OCR (CUDA)</span>
          </div>
        </div>
      </header>

      {/* Main 3-Pane Workspace Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANE 1 (LEFT): Document Explorer, File List & Outline */}
        <div className="w-72 border-r border-slate-800 bg-slate-950/90 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Upload Zone */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Ingest Workspace PDF
              </span>
              <div
                onClick={() => handleSelectFile('new_custom_document.pdf')}
                className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/60 p-3.5 rounded-xl text-center cursor-pointer transition-all group"
              >
                <UploadCloud className="w-5 h-5 text-cyan-400 mx-auto group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-200 mt-1.5 block">Drop PDF or Click to Upload</span>
                <span className="text-[10px] text-slate-500">Auto-Indexed by Unlimited-OCR</span>
              </div>
            </div>

            {/* Document List */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Workspace Documents
              </span>
              <div className="space-y-1">
                {[
                  { name: 'sample_contract_microsoft.pdf', pages: 4, size: '2.4 MB', type: 'Contract' },
                  { name: 'acme_invoice_2026.pdf', pages: 1, size: '420 KB', type: 'Invoice' },
                  { name: 'starlight_ehr_report.pdf', pages: 6, size: '5.1 MB', type: 'Medical' },
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
                        <div className="truncate font-medium flex items-center justify-between">
                          <span>{doc.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{doc.type} • {doc.pages} Pg • {doc.size}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Headings & Outline */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Document Headings & Outline
              </span>
              <div className="space-y-1 font-mono text-[11px] text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <div onClick={() => setCurrentPage(1)} className="hover:text-cyan-300 cursor-pointer py-0.5 truncate">• Sec 1: Definitions & Scope</div>
                <div onClick={() => setCurrentPage(1)} className="hover:text-cyan-300 cursor-pointer py-0.5 truncate text-cyan-400 font-bold">• Sec 14.2: Limitation of Liability</div>
                <div onClick={() => setCurrentPage(2)} className="hover:text-cyan-300 cursor-pointer py-0.5 truncate">• Sec 18.1: Termination Rights</div>
                <div onClick={() => setCurrentPage(3)} className="hover:text-cyan-300 cursor-pointer py-0.5 truncate">• Schedule A: Deliverables</div>
              </div>
            </div>
          </div>

          {/* System Security Badge */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2.5 text-[10px] text-slate-400 font-mono">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Local Memory Scope: Personal</span>
          </div>
        </div>

        {/* PANE 2 (CENTER): Interactive PDF Reader & Document Insights Bar */}
        <div className="flex-1 flex flex-col bg-slate-900/50 border-r border-slate-800 overflow-hidden">
          {/* Reader Toolbar with In-Document Search */}
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

            {/* In-Document Search Bar */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={inDocSearchQuery}
                onChange={e => setInDocSearchQuery(e.target.value)}
                placeholder="Search in document..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-36 font-sans"
              />
              {inDocSearchQuery && (
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950 px-1.5 py-0.5 rounded">
                  2 Matches
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                <button onClick={() => setZoomLevel(prev => Math.max(75, prev - 25))} className="p-0.5 hover:text-white">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-[11px]">{zoomLevel}%</span>
                <button onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))} className="p-0.5 hover:text-white">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeBBox && (
                <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/30">
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>Region BBox Active</span>
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC DOCUMENT INSIGHTS BANNER (Sprint 2 Feature) */}
          <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-bold border border-indigo-500/30 uppercase">
                  {insights.docType}
                </span>
                <span className="text-slate-300 font-bold">{selectedFile}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400" /> Read: {insights.readingTimeMins}m</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Confidence: {insights.confidenceScore}%</span>
                <span className="flex items-center gap-1"><Hash className="w-3 h-3 text-indigo-400" /> Entities: {insights.entitiesCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {insights.keyTerms.map(term => (
                <span key={term} className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800">
                  {term}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Document Page Viewport */}
          <div ref={documentViewerRef} className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-950/90 relative">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-[600px] min-h-[780px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-10 space-y-6 relative transition-all font-sans text-slate-300 text-xs"
            >
              {/* Document Header */}
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {insights.docType === 'Invoice' ? 'ACME CORPORATION INVOICE' : 'MASTER SERVICES AGREEMENT'}
                  </h2>
                  <span className="text-[10px] text-slate-500 font-mono">Document Ref: {selectedFile} • Confidential</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 bg-slate-800 text-slate-400 rounded">Page {currentPage}</span>
              </div>

              {/* Document Page Content */}
              {currentPage === 1 && (
                <div className="space-y-5 leading-relaxed relative">
                  <div>
                    <h3 className="font-bold text-slate-200 text-xs">SECTION 1: DEFINITIONS & GENERAL SCOPE</h3>
                    <p className="mt-1 text-slate-400">
                      This Agreement is entered into by and between {insights.companies.join(' and ')}.
                    </p>
                  </div>

                  {/* VISUAL BOUNDING BOX HIGHLIGHT OVERLAY (WITH SMOOTH PULSE ANIMATION) */}
                  <div className={`relative p-3 bg-cyan-950/50 border-2 border-cyan-400 rounded-lg shadow-lg transition-all ${
                    isBBoxPulsing ? 'ring-4 ring-cyan-500/30 animate-pulse' : ''
                  }`}>
                    <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-cyan-400 text-slate-950 text-[9px] font-mono font-extrabold rounded uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3 fill-current" />
                      Grounded Citation Match • Clause 14.2 (High Confidence 98.6%)
                    </div>
                    <h3 className="font-bold text-cyan-200 text-xs mt-1">SECTION 14.2: LIMITATION OF LIABILITY & GOVERNING LAW</h3>
                    <p className="mt-1 text-cyan-100 font-medium">
                      Neither party shall be liable for indirect, incidental, or consequential damages. Maximum aggregate liability under this Agreement shall not exceed $1,000,000 USD. This Agreement shall be governed by and construed in accordance with Delaware law.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-200 text-xs">SECTION 4.3: PAYMENT & INVOICING TERMS</h3>
                    <p className="mt-1 text-slate-400">
                      Invoices shall be submitted monthly. Payment terms are Net 30 days from invoice date. Overdue amounts incur 1.5% interest per month.
                    </p>
                  </div>
                </div>
              )}

              {currentPage === 2 && (
                <div className="space-y-5 leading-relaxed">
                  <div>
                    <h3 className="font-bold text-slate-200 text-xs">SECTION 18.1: TERMINATION RIGHTS</h3>
                    <p className="mt-1 text-slate-400 p-2 bg-slate-950 rounded border border-slate-800">
                      Either party may terminate this agreement for convenience upon thirty (30) days written notice to the other party, or upon ten (10) days written notice in the event of material breach.
                    </p>
                  </div>
                </div>
              )}

              {currentPage >= 3 && (
                <div className="space-y-5 leading-relaxed">
                  <h3 className="font-bold text-slate-200 text-xs">SCHEDULE A: DELIVERABLES & MILESTONES</h3>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-[11px]">
                    <div>Sprint #24 Completion: October 15, 2026</div>
                    <div>Final Audit Sign-off: November 1, 2026</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANE 3 (RIGHT): AI Assistant Conversational Chat & Dynamic Prompts */}
        <div className="w-96 bg-slate-950 p-4 flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white">Grounded AI Assistant</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Citations Active
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
                      <span>Page {msg.citation.page} • Highlight BBox Target</span>
                      <span className="text-emerald-400 font-bold">Confidence: {msg.citation.confidence}%</span>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* DYNAMIC DOCUMENT-SPECIFIC QUICK PROMPTS */}
          <div className="py-2 space-y-1.5 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
              Dynamic {insights.docType} Prompts
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
                placeholder="Ask anything about this document..."
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

      {/* BOTTOM BAR: Streaming Ingestion Timeline & Memory Status */}
      <footer className="h-10 border-t border-slate-800 bg-slate-950 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${ingestProgress < 100 ? 'animate-spin' : ''}`} />
            <span>Ingestion Pipeline: {ingestStatus}</span>
          </div>
          <div className="w-32 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all" style={{ width: `${ingestProgress}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span>Active BBox: Page {currentPage}</span>
          <span className="text-emerald-400 font-bold">Zero Kernel Edits</span>
        </div>
      </footer>

      {/* Universal Search Modal (Ctrl + K) */}
      <UniversalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
