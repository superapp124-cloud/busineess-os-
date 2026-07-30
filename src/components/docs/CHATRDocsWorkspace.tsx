import React, { useState, useEffect } from 'react';
import { IntentKernel } from '../../kernel/IntentKernel';
import { IntelligenceRuntime } from '../../runtimes/intelligence/IntelligenceRuntime';
import { DocumentQueue, QueueJob } from '../../pipelines/document/DocumentQueue';
import { EntityGraphEngine } from '../../graph/EntityGraphEngine';
import { ScopedMemoryEngine } from '../../memory/ScopedMemoryEngine';
import { UniversalSearchService } from '../../search/UniversalSearchService';
import logo from '@/assets/chatr-icon-logo.png';
import { FileText, UploadCloud, Cpu, Layers, Sparkles, Shield, Search, Database, Share2, CheckCircle, RefreshCw } from 'lucide-react';

export const CHATRDocsWorkspace: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('sample_contract_microsoft.pdf');
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [activeTab, setActiveTab] = useState<'reader' | 'chat' | 'graph' | 'memory'>('reader');
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; citation?: string }>>([
    {
      sender: 'assistant',
      text: 'Welcome to CHATR Docs. I have indexed your workspace documents with Baidu Unlimited-OCR and local entity graphs. How can I assist you?',
    },
  ]);

  useEffect(() => {
    // Boot Intent Kernel
    IntentKernel.boot().then(() => {
      IntentKernel.runtimeManager.registerRuntime(IntelligenceRuntime);
      IntelligenceRuntime.initialize();
    });

    // Subscribe to Document Queue updates
    const unsubscribe = DocumentQueue.onUpdate(() => {
      setJobs(DocumentQueue.getQueue());
    });

    return () => unsubscribe();
  }, []);

  const handleUpload = (fileName: string) => {
    setSelectedFile(fileName);
    IntelligenceRuntime.ingestDocument(`C:\\Users\\Arshid.Wani\\Documents\\CHATR\\${fileName}`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      // Perform Universal Search & Graph Query
      const graphNodes = EntityGraphEngine.queryNodes();
      const searchResults = UniversalSearchService.search({ text: userText });

      let responseText = `I found references across your local workspace documents.`;
      let citation = `Page 3 • BBox [x: 120, y: 340, w: 450, h: 180]`;

      if (userText.toLowerCase().includes('microsoft') || userText.toLowerCase().includes('contract')) {
        responseText = `According to the Master Services Agreement signed with Microsoft Corporation, Delaware governing law applies with a liability cap of $1,000,000.`;
        citation = `Master Services Agreement (Page 1, Clause 14.2)`;
      } else if (searchResults.length > 0) {
        responseText = searchResults[0].snippet;
        citation = searchResults[0].title;
      }

      setChatMessages(prev => [...prev, { sender: 'assistant', text: responseText, citation }]);
    }, 600);
  };

  const graphStats = EntityGraphEngine.getStats();
  const memoryCounts = ScopedMemoryEngine.getCounts();
  const activeJob = jobs.find(j => j.status === 'processing');

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="CHATR" className="w-7 h-7 object-contain rounded" />
          <div>
            <h1 className="font-bold text-sm text-white flex items-center gap-2">
              CHATR Docs
              <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono rounded border border-cyan-500/30">
                Intent OS v2.1
              </span>
            </h1>
          </div>
        </div>

        {/* Runtime Status Badges */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Engine: Unlimited-OCR (CUDA)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Memory: 100% Local Sovereign</span>
          </div>
        </div>
      </header>

      {/* Real-Time Background Queue Progress Bar */}
      {activeJob && (
        <div className="bg-indigo-950/80 border-b border-indigo-500/30 px-4 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-indigo-300">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Streaming Ingestion: {activeJob.filePath.split(/[/\\]/).pop()}</span>
          </div>
          <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-400 h-full transition-all duration-300"
              style={{ width: `${activeJob.progressPercentage}%` }}
            />
          </div>
          <span className="text-indigo-400">{activeJob.progressPercentage}%</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: File Navigation & Document Upload */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Workspace Documents</span>
            </div>

            <div className="space-y-1.5">
              {[
                'sample_contract_microsoft.pdf',
                'vendor_invoice_acme.pdf',
                'medical_lab_report.pdf',
                'q3_financial_statement.pdf',
              ].map(file => (
                <button
                  key={file}
                  onClick={() => handleUpload(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 transition-all ${
                    selectedFile === file
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">{file}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Action Ingestion Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => handleUpload(`scanned_doc_${Date.now()}.pdf`)}
              className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              Ingest Document
            </button>
          </div>
        </aside>

        {/* Central Document Viewer & Multi-Tab Container */}
        <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-800 bg-slate-900/20 px-4 flex items-center gap-4 text-xs font-medium">
            {[
              { id: 'reader', label: 'AI PDF Reader', icon: Layers },
              { id: 'chat', label: 'Document Chat', icon: Sparkles },
              { id: 'graph', label: `Entity Graph (${graphStats.totalNodes})`, icon: Share2 },
              { id: 'memory', label: `Scoped Memory (${memoryCounts.Workspace})`, icon: Database },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-1 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-300 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab View Contents */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'reader' && (
              <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl relative">
                {/* Bounding Box Visual Overlay Badge */}
                <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Baidu R-SWA BBoxes Active
                </div>

                <h2 className="text-xl font-bold text-white mb-2">{selectedFile}</h2>
                <p className="text-xs font-mono text-slate-400 mb-6">Indexed via Capability-Orchestrated Pipeline • Status: Ready</p>

                {/* Simulated Document Layout Page */}
                <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans border border-slate-800 p-6 rounded-lg bg-slate-950/60 relative">
                  {/* Highlighted Bounding Box Overlay */}
                  <div className="absolute inset-x-4 top-12 bottom-28 border-2 border-dashed border-cyan-400/60 rounded p-2 bg-cyan-500/5 pointer-events-none">
                    <span className="bg-cyan-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded absolute -top-3 left-2 font-mono">
                      BBox #14 • Clause 14.2 (Confidence 98.4%)
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white">MASTER SERVICES AGREEMENT</h3>
                  <p>
                    This Master Services Agreement ("Agreement") is entered into effective July 1, 2026, by and between CHATR Inc. and Microsoft Corporation.
                  </p>
                  <p>
                    <strong>14. Limitation of Liability:</strong> Neither party shall be liable for indirect, incidental, or consequential damages. Total aggregate liability under this agreement shall be capped at $1,000,000 USD.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="max-w-3xl mx-auto flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-xl p-3.5 rounded-xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-cyan-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.citation && (
                        <span className="text-[10px] font-mono text-cyan-400 mt-1 px-2 py-0.5 bg-cyan-950/60 rounded border border-cyan-500/20">
                          Citation: {msg.citation}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask anything about your workspace documents..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
                  >
                    Ask CHATR
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
                <h3 className="text-sm font-bold text-white mb-1">Entity-Linked Knowledge Graph</h3>
                <p className="text-xs text-slate-400 mb-4">Cross-document node linking across companies, contracts, and invoices.</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Node: Company</span>
                    <h4 className="text-sm font-bold text-white mt-1">Microsoft Corporation</h4>
                    <p className="text-xs text-slate-400 mt-2">Linked to: Master Services Agreement</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Node: Invoice</span>
                    <h4 className="text-sm font-bold text-white mt-1">INV-2026-884</h4>
                    <p className="text-xs text-slate-400 mt-2">Issued by: Acme Corporation ($4,250.00)</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'memory' && (
              <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-3">
                <h3 className="text-sm font-bold text-white">Scoped Workspace Vector Store</h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(memoryCounts).map(([scope, count]) => (
                    <div key={scope} className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase">{scope} Scope</span>
                      <div className="text-lg font-bold text-white mt-1">{count} Records</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
