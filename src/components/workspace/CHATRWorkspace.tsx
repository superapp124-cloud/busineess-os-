import React, { useState, useEffect, useRef } from 'react';
import { IntentKernel } from '../../kernel/IntentKernel';
import { IntelligenceRuntime } from '../../runtimes/intelligence/IntelligenceRuntime';
import logo from '@/assets/chatr-icon-logo.png';
import {
  UploadCloud, Search, CheckCircle, ExternalLink, Activity, ArrowUpRight,
  Settings, Loader2, Sparkles, FileText, User, Mail, Grid, Briefcase, Zap, GitCompare
} from 'lucide-react';
import { WorkspaceItem, WorkspaceMetadata, WorkspaceCapabilities, WorkspaceAdapter } from './adapters/types';
import { WorkspaceViewport, getAdapterFor } from './adapters/WorkspaceViewport';

export const CHATRWorkspace: React.FC = () => {
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<WorkspaceItem[]>([
    { id: '1', sourceUri: 'Master_Service_Agreement.pdf', typeHint: 'pdf', rawFile: new File([], 'Master_Service_Agreement.pdf') },
    { id: '2', sourceUri: 'John_Smith_Resume.pdf', typeHint: 'resume', rawFile: new File([], 'John_Smith_Resume.pdf') },
    { id: '3', sourceUri: 'Q3_Renewal_Discussion.eml', typeHint: 'email', rawFile: new File([], 'Q3_Renewal_Discussion.eml') }
  ]);

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  const [activeMetadata, setActiveMetadata] = useState<WorkspaceMetadata | null>(null);
  const [activeCapabilities, setActiveCapabilities] = useState<WorkspaceCapabilities | null>(null);
  
  const [intelligenceTab, setIntelligenceTab] = useState<'overview' | 'insights' | 'actions'>('overview');
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user'|'ai', text: string, source?: string }>>([]);

  const activeItem = items.find(i => i.id === activeItemId) || null;
  const activeAdapter = activeItem ? getAdapterFor(activeItem) : undefined;

  useEffect(() => {
    IntentKernel.boot().then(() => {
      IntentKernel.runtimeManager.registerRuntime(IntelligenceRuntime);
      IntelligenceRuntime.initialize();
    });
  }, []);

  // When active item changes, fetch metadata and capabilities from its adapter
  useEffect(() => {
    if (!activeItem || !activeAdapter) {
      setActiveMetadata(null);
      setActiveCapabilities(null);
      return;
    }

    // Reset intelligence panel state
    setChatHistory([]);
    setIntelligenceTab('overview');

    activeAdapter.getMetadata(activeItem).then(meta => setActiveMetadata(meta));
    setActiveCapabilities(activeAdapter.getCapabilities());
  }, [activeItemId, activeItem, activeAdapter]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect type hint purely based on name for this v1 simulation
    let typeHint = 'pdf';
    if (file.name.toLowerCase().includes('resume')) typeHint = 'resume';
    if (file.name.toLowerCase().endsWith('.eml') || file.name.toLowerCase().endsWith('.msg')) typeHint = 'email';
    if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) typeHint = 'word';
    if (file.type.startsWith('image/')) typeHint = 'image';

    const newItem: WorkspaceItem = {
      id: `item_${Date.now()}`,
      sourceUri: file.name,
      rawFile: file,
      typeHint
    };

    setItems(prev => [newItem, ...prev]);
    setActiveItemId(newItem.id);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getIconForType = (typeHint?: string) => {
    if (typeHint === 'resume') return <User className="w-5 h-5 text-amber-500" />;
    if (typeHint === 'email') return <Mail className="w-5 h-5 text-indigo-500" />;
    if (typeHint === 'image') return <div className="w-5 h-5 bg-pink-100 text-pink-500 rounded flex items-center justify-center font-bold text-[10px]">IMG</div>;
    return <FileText className="w-5 h-5 text-cyan-500" />;
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'Ready': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Needs Attention': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    }
  };

  const handleAskIntelligence = (question: string) => {
    if (!question.trim()) return;
    setChatHistory(prev => [...prev, { sender: 'user', text: question }]);
    setChatInput('');

    setTimeout(() => {
      let aiText = `I analyzed the ${activeMetadata?.type?.toLowerCase() || 'workspace'} and found relevant information based on your query.`;
      let sourceText = undefined;

      if (question.toLowerCase().includes('compare') || question.toLowerCase().includes('diff')) {
        aiText = 'The liability cap was increased from $500,000 to $1,000,000. Additionally, the termination notice period was reduced to 30 days.';
        sourceText = 'Section 14.2 & Section 18.1';
      }

      setChatHistory(prev => [...prev, { sender: 'ai', text: aiText, source: sourceText }]);
    }, 600);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Universal Workspace Header */}
      <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <img src={logo} alt="CHATR" className="w-7 h-7 object-contain rounded" />
          <h1 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
            CHATR Workspace
            {isDeveloperMode && (
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 font-mono rounded border border-slate-200 font-semibold uppercase">
                Dev Mode
              </span>
            )}
          </h1>
        </div>

        {/* Dynamic Header Item */}
        <div className="flex-1 flex justify-center">
          {activeItem && activeMetadata && (
            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              {getIconForType(activeItem.typeHint)}
              <span className="font-bold text-sm text-slate-900 max-w-[250px] truncate">{activeMetadata.title}</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{activeMetadata.type}</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500">{activeMetadata.updatedAt}</span>
              <span className="text-slate-300">|</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getStatusColor(activeMetadata.status)}`}>
                {activeMetadata.status}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Settings / Developer Mode */}
          <div className="relative">
            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">Advanced Settings</div>
                <label className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition-colors">
                  <span className="font-medium">Developer Mode</span>
                  <input type="checkbox" checked={isDeveloperMode} onChange={() => setIsDeveloperMode(!isDeveloperMode)} className="accent-indigo-600 w-4 h-4 rounded cursor-pointer" />
                </label>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SHELL: Left Sidebar (20%) */}
        <div className="w-1/5 min-w-[280px] max-w-[320px] bg-white border-r border-slate-200 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-4 border-b border-slate-100">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.eml,.msg,image/*" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              New Workspace Item
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Items</div>
            {items.map(item => {
              const isSelected = activeItemId === item.id;
              // Mock simple metadata for sidebar if we don't have the full async metadata yet
              const title = item.rawFile?.name || item.sourceUri;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItemId(item.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                      : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIconForType(item.typeHint)}</div>
                    <div className="flex-1 overflow-hidden">
                      <div className={`text-sm truncate font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-700'}`}>{title}</div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-500">
                        <span>Updated today</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SHELL: Center Viewport (60%) */}
        <div className="w-3/5 bg-slate-100 border-r border-slate-200 relative flex flex-col">
          {!activeItem ? (
            // UNIVERSAL EMPTY STATE
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                <Grid className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Your Intelligent Workspace</h2>
              <p className="text-slate-500 mb-8 text-sm max-w-sm mx-auto leading-relaxed">
                Drop your file to create a workspace. We extract entities, structure insights, and enable semantic search instantly.
              </p>
              
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"><FileText className="w-3.5 h-3.5" /> PDFs & Docs</div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"><Mail className="w-3.5 h-3.5" /> Emails</div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"><User className="w-3.5 h-3.5" /> Resumes</div>
              </div>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-10 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20"
              >
                Browse Files
              </button>
            </div>
          ) : (
            // ADAPTER RENDER PORTAL
            <WorkspaceViewport item={activeItem} />
          )}
        </div>

        {/* SHELL: Right Intelligence Panel (20%) */}
        <div className="w-1/5 min-w-[320px] max-w-[400px] bg-white flex flex-col z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          {activeItem && activeMetadata && activeCapabilities ? (
            <>
              {/* Intelligence Tabs */}
              <div className="flex items-center border-b border-slate-100 p-2 shrink-0">
                {(['overview', 'insights', 'actions'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setIntelligenceTab(tab)}
                    className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all ${
                      intelligenceTab === tab 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* OVERVIEW TAB */}
              {intelligenceTab === 'overview' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-6 animate-in slide-in-from-bottom-2 fade-in">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Extracted Metadata</h3>
                    <div className="space-y-3">
                      {Object.entries(activeMetadata.fields).map(([label, value]) => (
                        <div key={label} className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                          <span className="text-sm font-medium text-slate-500">{label}</span>
                          <span className="text-sm font-bold text-slate-900 text-right pl-4">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeCapabilities.aiSupported && (
                    <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 rounded-xl border border-indigo-100 shadow-inner">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <h4 className="font-bold text-sm text-indigo-900">Intelligence Ready</h4>
                      </div>
                      <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
                        CHATR has fully analyzed this {activeMetadata.type.toLowerCase()}. Switch to the Insights tab to query the document.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* INSIGHTS TAB (formerly Assistant) */}
              {intelligenceTab === 'insights' && (
                <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 fade-in">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.length === 0 && (
                      <div className="text-center py-8 px-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">What would you like to know?</h3>
                        <p className="text-xs text-slate-500 mb-6">Ask questions about this {activeMetadata.type.toLowerCase()} to get instant, sourced answers.</p>
                        
                        <div className="space-y-2 text-left">
                          {['Summarize the key points', 'Are there any hidden risks?', 'Who are the primary parties?'].map(prompt => (
                            <button
                              key={prompt}
                              onClick={() => handleAskIntelligence(prompt)}
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-lg text-sm text-slate-600 font-medium transition-all shadow-sm"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3.5 rounded-2xl text-sm leading-relaxed max-w-[90%] shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-slate-900 text-white rounded-tr-sm font-medium'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                        }`}>
                          <p>{msg.text}</p>
                        </div>
                        
                        {msg.source && (
                          <div className="w-[90%] mt-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-xs">
                            <p className="text-slate-600 mb-2">
                              <span className="font-bold text-indigo-900">Source:</span> {msg.source}
                            </p>
                            <button className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                              View in document
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                    <form onSubmit={e => { e.preventDefault(); handleAskIntelligence(chatInput); }}>
                      <div className="relative flex flex-col bg-slate-50 border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 rounded-xl overflow-hidden transition-all shadow-inner">
                        <textarea
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          placeholder={`Ask about this ${activeMetadata.type.toLowerCase()}...`}
                          className="w-full bg-transparent py-3 pl-4 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none h-14"
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAskIntelligence(chatInput);
                            }
                          }}
                        />
                        <div className="absolute right-2 bottom-2">
                          <button type="submit" className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all shadow-sm">
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ACTIONS TAB */}
              {intelligenceTab === 'actions' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Suggested Actions</h3>
                  
                  <button className="w-full flex items-start gap-4 p-4 text-left rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all group">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                      <GitCompare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Compare Versions</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Check against historical records</div>
                    </div>
                  </button>

                  <button className="w-full flex items-start gap-4 p-4 text-left rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all group">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Create Reminder</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Sync deadline to Calendar</div>
                    </div>
                  </button>

                  <button className="w-full flex items-start gap-4 p-4 text-left rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-md transition-all group">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Review Risks</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Highlight unusual clauses</div>
                    </div>
                  </button>
                </div>
              )}

            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-8 text-center bg-slate-50">
              Select a workspace item to view its intelligence panel.
            </div>
          )}
        </div>
      </div>
      
      {/* Developer Mode Bottom Bar */}
      {isDeveloperMode && (
        <footer className="h-10 border-t border-slate-300 bg-slate-900 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-bold tracking-wider">DEV: UNIVERSAL_ADAPTER_ROUTING_ACTIVE</span>
            <span className="text-indigo-400">Active Adapter: {activeAdapter?.id || 'NULL'}</span>
          </div>
          <div>Capabilities Bound: {activeCapabilities ? Object.keys(activeCapabilities).length : 0}</div>
        </footer>
      )}
    </div>
  );
};
