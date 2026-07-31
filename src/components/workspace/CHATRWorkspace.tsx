import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IntentKernel } from '../../kernel/IntentKernel';
import { IntelligenceRuntime } from '../../runtimes/intelligence/IntelligenceRuntime';
import logo from '@/assets/chatr-icon-logo.png';
import {
  UploadCloud, Search, CheckCircle, ExternalLink, Activity, ArrowUpRight,
  Settings, Loader2, Sparkles, FileText, User, Mail, Grid, Briefcase, Zap, GitCompare,
  ShieldAlert, AlertTriangle, Lightbulb, ChevronRight, Shield, Heart, Brain
} from 'lucide-react';
import { WorkspaceItem, WorkspaceMetadata, WorkspaceCapabilities } from './adapters/types';
import { WorkspaceViewport, getAdapterFor } from './adapters/WorkspaceViewport';
import { WorkspaceRegistry } from './registry/WorkspaceRegistry';
import { BusinessWorkspace } from './registry/types';
import { useContextEngine, emit, classifyDocument, ClassificationResult } from '../../context-engine';
import { useCapability } from '../../platform/runtime/BootStageProvider';

export const CHATRWorkspace: React.FC = () => {
  const { context, addSource, removeSource } = useContextEngine();
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progressive capability states from the Worker OS
  const aiState = useCapability('worker-ai');
  const searchState = useCapability('worker-search');
  const kernelState = useCapability('chatr-kernel');

  // Classification state — tracks which items have been AI-classified
  const [classifying, setClassifying] = useState<Set<string>>(new Set());

  const [items, setItems] = useState<WorkspaceItem[]>([
    { id: '1', sourceUri: '5983042622654.pdf', typeHint: 'pdf', rawFile: new File([], '5983042622654.pdf') },
    { id: '2', sourceUri: 'XXXPW9619X_2025-26_AIS.pdf', typeHint: 'pdf', rawFile: new File([], 'XXXPW9619X_2025-26_AIS.pdf') },
    { id: '3', sourceUri: 'HDFC_Brezza_Motor_Policy.pdf', typeHint: 'pdf', rawFile: new File([], 'HDFC_Brezza_Motor_Policy.pdf') },
    { id: '4', sourceUri: 'Master_Service_Agreement.pdf', typeHint: 'pdf', rawFile: new File([], 'Master_Service_Agreement.pdf') },
    { id: '5', sourceUri: 'John_Smith_Resume.pdf', typeHint: 'resume', rawFile: new File([], 'John_Smith_Resume.pdf') },
    { id: '6', sourceUri: 'Q3_Renewal_Discussion.eml', typeHint: 'email', rawFile: new File([], 'Q3_Renewal_Discussion.eml') }
  ]);

  const [activeItemId, setActiveItemId] = useState<string | null>('1');
  const [activeWorkspace, setActiveWorkspace] = useState<BusinessWorkspace | null>(null);
  
  const [activeMetadata, setActiveMetadata] = useState<WorkspaceMetadata | null>(null);
  const [activeCapabilities, setActiveCapabilities] = useState<WorkspaceCapabilities | null>(null);
  
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
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

  // ─── AI Classification Pipeline ───────────────────────────────────────────
  // Runs Gemini classification on an item, stamps the result onto the item,
  // then re-resolves the Workspace so the right Domain Intelligence activates.
  const runClassification = useCallback(async (item: WorkspaceItem) => {
    setClassifying(prev => new Set(prev).add(item.id));

    try {
      const fileToClassify = item.rawFile || new File([], item.sourceUri);
      const result: ClassificationResult = await classifyDocument(fileToClassify);

      // Stamp the AI result onto the item so workspace matchers can read it
      (item as any).__classification__ = result;

      // Trigger re-render by updating item in array
      setItems(prev => prev.map(i => i.id === item.id ? { ...i } : i));

      // Feed rich context to the Context Engine
      addSource({
        module: 'workspace',
        signals: [{
          type: 'document.opened',
          sourceModule: 'workspace',
          payload: {
            filename: item.sourceUri,
            documentType: result.documentType,
            domainIntelligence: result.domainIntelligence,
            industry: result.industry,
            confidence: result.confidence,
          },
          timestamp: Date.now(),
        }],
        textChunks: [
          item.sourceUri,
          result.documentType,
          result.domainIntelligence,
          result.industry,
          result.summary,
          ...(result.keyEntities?.map(e => `${e.label}: ${e.value}`) ?? []),
          result.rawText ?? '',
        ],
      });

      // Re-resolve workspace with AI-stamped item
      const workspace = WorkspaceRegistry.matchWorkspace(item);
      setActiveWorkspace(workspace);
      if (workspace.modules.length > 0) {
        setActiveModuleId(workspace.modules[0].id);
      }

      emit('document.opened', 'workspace', {
        filename: item.sourceUri,
        domainIntelligence: result.domainIntelligence,
        confidence: result.confidence,
      });
    } catch (err) {
      console.error('[CHATRWorkspace] AI classification error:', err);
    } finally {
      setClassifying(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }, [addSource]);

  // ─── Active Item Effect ───────────────────────────────────────────────────
  // When user selects a different item, resolve its workspace immediately.
  // If not yet AI-classified (real file, size > 0), also kick off classification.
  useEffect(() => {
    if (!activeItem || !activeAdapter) {
      setActiveMetadata(null);
      setActiveCapabilities(null);
      setActiveWorkspace(null);
      setActiveModuleId(null);
      removeSource('workspace');
      return;
    }

    const existingClassification = (activeItem as any).__classification__;
    const workspace = WorkspaceRegistry.matchWorkspace(activeItem);
    setActiveWorkspace(workspace);
    if (workspace.modules.length > 0) {
      setActiveModuleId(workspace.modules[0].id);
    } else {
      setActiveModuleId(null);
    }

    activeAdapter.getMetadata(activeItem).then(meta => setActiveMetadata(meta));
    setActiveCapabilities(activeAdapter.getCapabilities());

    // If no AI result yet, kick off classification
    if (!existingClassification) {
      runClassification(activeItem);
    }
  }, [activeItemId, runClassification]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newItem: WorkspaceItem = {
      id: `item_${Date.now()}`,
      sourceUri: file.name,
      rawFile: file,
      typeHint: 'pdf',  // Will be overridden by AI classification
    };

    setItems(prev => [newItem, ...prev]);
    setActiveItemId(newItem.id);

    // Kick off AI classification immediately after adding
    runClassification(newItem);

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

        {/* Dynamic Header Item — AI Classification Badge */}
        <div className="flex-1 flex justify-center">
          {activeItem && (() => {
            const classification = (activeItem as any).__classification__;
            const isClassifying = classifying.has(activeItem.id);
            return (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {/* Document name */}
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  {getIconForType(activeItem.typeHint)}
                  <span className="font-bold text-sm text-slate-900 max-w-[200px] truncate">
                    {activeItem.rawFile?.name || activeItem.sourceUri}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500">{activeMetadata?.updatedAt || 'Just now'}</span>
                  <span className="text-slate-300">|</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getStatusColor(activeMetadata?.status)}`}>
                    {activeMetadata?.status || 'Ready'}
                  </span>
                </div>

                {/* AI Classification Badge */}
                {isClassifying ? (
                  <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg shadow-sm animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    <span className="text-xs font-bold text-indigo-700">AI Classifying...</span>
                  </div>
                ) : classification ? (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm ${
                    classification.domainIntelligence === 'clinical' ? 'bg-rose-50 border-rose-200' :
                    classification.domainIntelligence === 'insurance' ? 'bg-blue-50 border-blue-200' :
                    classification.domainIntelligence === 'talent' ? 'bg-amber-50 border-amber-200' :
                    classification.domainIntelligence === 'legal' ? 'bg-purple-50 border-purple-200' :
                    classification.domainIntelligence === 'finance' ? 'bg-emerald-50 border-emerald-200' :
                    'bg-slate-50 border-slate-200'
                  }`}>
                    <Brain className={`w-3.5 h-3.5 ${
                      classification.domainIntelligence === 'clinical' ? 'text-rose-500' :
                      classification.domainIntelligence === 'insurance' ? 'text-blue-500' :
                      classification.domainIntelligence === 'talent' ? 'text-amber-500' :
                      classification.domainIntelligence === 'legal' ? 'text-purple-500' :
                      classification.domainIntelligence === 'finance' ? 'text-emerald-500' :
                      'text-slate-500'
                    }`} />
                    <span className={`text-xs font-bold ${
                      classification.domainIntelligence === 'clinical' ? 'text-rose-700' :
                      classification.domainIntelligence === 'insurance' ? 'text-blue-700' :
                      classification.domainIntelligence === 'talent' ? 'text-amber-700' :
                      classification.domainIntelligence === 'legal' ? 'text-purple-700' :
                      classification.domainIntelligence === 'finance' ? 'text-emerald-700' :
                      'text-slate-700'
                    }`}>{classification.domainLabel}</span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {Math.round(classification.confidence * 100)}%
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })()}
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
              disabled={kernelState === 'initializing'}
              className={`w-full rounded-lg p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                kernelState === 'initializing'
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {kernelState === 'initializing'
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Platform warming up...</>
                : <><UploadCloud className="w-4 h-4" /> New Workspace Item</>
              }
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
          {activeItem && activeWorkspace && activeModuleId ? (
            <>
              {/* Dynamic Intelligence Tabs */}
              <div className="flex items-center border-b border-slate-100 p-2 shrink-0 overflow-x-auto hide-scrollbar">
                {activeWorkspace.modules.map(module => (
                  <button
                    key={module.id}
                    onClick={() => setActiveModuleId(module.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 min-w-max text-xs font-bold rounded-lg transition-all ${
                      activeModuleId === module.id 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {module.icon}
                    {module.title}
                  </button>
                ))}
              </div>

              {/* Dynamic Module Renderer */}
              <div className="flex-1 overflow-y-auto p-4 animate-in slide-in-from-bottom-2 fade-in flex flex-col">
                {activeWorkspace.modules.map(module => {
                  if (module.id !== activeModuleId) return null;
                  const Component = module.component;
                  
                  return (
                    <div key={module.id} className="flex flex-col h-full">
                      {/* Module Content */}
                      <div className="flex-1">
                        <Component item={activeItem} />
                      </div>
                      
                      {/* Module Actions (Owned by the module) */}
                      {module.actions && module.actions.length > 0 && (
                        <div className="mt-8 pt-4 border-t border-slate-100 space-y-2 shrink-0">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Recommended Actions</h4>
                          {module.actions.map(action => (
                            <button
                              key={action.id}
                              onClick={action.onClick}
                              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded group-hover:scale-110 transition-transform">
                                  {action.icon}
                                </div>
                                <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                  {action.label}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-8 text-center bg-slate-50">
              Select a workspace item to view intelligence.
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
