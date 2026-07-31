import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IntentKernel } from '../../kernel/IntentKernel';
import { IntelligenceRuntime } from '../../runtimes/intelligence/IntelligenceRuntime';
import logo from '@/assets/chatr-icon-logo.png';
import {
  UploadCloud, Search, CheckCircle, ExternalLink, Activity, ArrowUpRight,
  Settings, Loader2, Sparkles, FileText, User, Mail, Grid, Briefcase, Zap, GitCompare,
  ShieldAlert, AlertTriangle, Lightbulb, ChevronRight, Shield, Heart, Brain, Target, Check
} from 'lucide-react';
import { WorkspaceItem, WorkspaceMetadata, WorkspaceCapabilities } from './adapters/types';
import { WorkspaceViewport, getAdapterFor } from './adapters/WorkspaceViewport';
import { WorkspaceRegistry } from './registry/WorkspaceRegistry';
import { BusinessWorkspace } from './registry/types';
import {
  useContextEngine, emit, classifyDocument, ClassificationResult,
  inferUserGoal, GoalIntelligenceResult
} from '../../context-engine';
import { useCapability } from '../../platform/runtime/BootStageProvider';
import { GoalDrivenWorkspacePane } from './GoalDrivenWorkspace';

export const CHATRWorkspace: React.FC = () => {
  const { context, addSource, removeSource } = useContextEngine();
  const [isDeveloperMode, setIsDeveloperMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progressive capability states from the Worker OS
  const aiState = useCapability('worker-ai');
  const searchState = useCapability('worker-search');
  const kernelState = useCapability('chatr-kernel');

  // Work Execution & Classification State
  const [classifying, setClassifying] = useState<Set<string>>(new Set());
  const [activeGoalTabId, setActiveGoalTabId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [items, setItems] = useState<WorkspaceItem[]>([
    { id: '1', sourceUri: 'Addendum to Professional Service Agreement _Volume and tenure.pdf', typeHint: 'pdf', rawFile: new File([], 'Addendum to Professional Service Agreement _Volume and tenure.pdf') },
    { id: '2', sourceUri: 'LinkedIn Profile optimisation.docx', typeHint: 'word', rawFile: new File([], 'LinkedIn Profile optimisation.docx') },
    { id: '3', sourceUri: '5983042622654.pdf', typeHint: 'pdf', rawFile: new File([], '5983042622654.pdf') },
    { id: '4', sourceUri: 'GRADE III, SUMMER ENGAGEMENT PROGRAMME 26-27.pdf', typeHint: 'pdf', rawFile: new File([], 'GRADE III, SUMMER ENGAGEMENT PROGRAMME 26-27.pdf') },
    { id: '5', sourceUri: '2747177d-9902-4def-bf31-1b3c8bc2c79a.docx', typeHint: 'pdf', rawFile: new File([], '2747177d-9902-4def-bf31-1b3c8bc2c79a.docx') },
    { id: '6', sourceUri: 'XXXPW9619X_2025-26_AIS.pdf', typeHint: 'pdf', rawFile: new File([], 'XXXPW9619X_2025-26_AIS.pdf') },
    { id: '7', sourceUri: 'HDFC_Brezza_Motor_Policy.pdf', typeHint: 'pdf', rawFile: new File([], 'HDFC_Brezza_Motor_Policy.pdf') },
    { id: '8', sourceUri: 'Master_Service_Agreement.pdf', typeHint: 'pdf', rawFile: new File([], 'Master_Service_Agreement.pdf') }
  ]);

  const [activeItemId, setActiveItemId] = useState<string | null>('1');
  const [activeWorkspace, setActiveWorkspace] = useState<BusinessWorkspace | null>(null);
  
  const [activeMetadata, setActiveMetadata] = useState<WorkspaceMetadata | null>(null);
  const [activeCapabilities, setActiveCapabilities] = useState<WorkspaceCapabilities | null>(null);
  
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const activeItem = items.find(i => i.id === activeItemId) || null;
  const activeAdapter = activeItem ? getAdapterFor(activeItem) : undefined;

  useEffect(() => {
    IntentKernel.boot().then(() => {
      IntentKernel.runtimeManager.registerRuntime(IntelligenceRuntime);
      IntelligenceRuntime.initialize();
    });
  }, []);

  // ─── Universal Work Execution Pipeline ─────────────────────────────────────
  const runClassification = useCallback(async (item: WorkspaceItem) => {
    setClassifying(prev => new Set(prev).add(item.id));

    try {
      const fileToClassify = item.rawFile || new File([], item.sourceUri);
      
      const [classification, goalResult] = await Promise.all([
        classifyDocument(fileToClassify),
        inferUserGoal(fileToClassify)
      ]);

      // Stamp results onto item
      (item as any).__classification__ = classification;
      (item as any).__goalResult__ = goalResult;

      // Trigger re-render by updating item in array
      setItems(prev => prev.map(i => i.id === item.id ? { ...i } : i));

      // Register context with global Context Engine
      addSource({
        module: 'workspace',
        signals: [{
          type: 'document.opened',
          sourceModule: 'workspace',
          payload: {
            filename: item.sourceUri,
            goal: goalResult.inferredGoal.title,
            category: goalResult.inferredGoal.category,
            confidence: goalResult.inferredGoal.confidence,
          },
          timestamp: Date.now(),
        }],
        textChunks: [
          item.sourceUri,
          goalResult.inferredGoal.title,
          goalResult.mission.realQuestion,
          goalResult.summary,
          ...(goalResult.mission.whatChatrFound ?? []),
          goalResult.rawText ?? '',
        ],
      });

      // Resolve business workspace
      const workspace = WorkspaceRegistry.matchWorkspace(item);
      setActiveWorkspace(workspace);
      if (workspace.modules.length > 0) {
        setActiveModuleId(workspace.modules[0].id);
      }

      emit('document.opened', 'workspace', {
        filename: item.sourceUri,
        goal: goalResult.inferredGoal.title,
        confidence: goalResult.inferredGoal.confidence,
      });
    } catch (err) {
      console.error('[CHATRWorkspace] Work Execution error:', err);
    } finally {
      setClassifying(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }, [addSource]);

  // ─── Active Item Effect ───────────────────────────────────────────────────
  useEffect(() => {
    if (!activeItem || !activeAdapter) {
      setActiveMetadata(null);
      setActiveCapabilities(null);
      setActiveWorkspace(null);
      setActiveModuleId(null);
      removeSource('workspace');
      return;
    }

    const existingGoal = (activeItem as any).__goalResult__;

    const workspace = WorkspaceRegistry.matchWorkspace(activeItem);
    setActiveWorkspace(workspace);
    if (workspace.modules.length > 0) {
      setActiveModuleId(workspace.modules[0].id);
    } else {
      setActiveModuleId(null);
    }

    activeAdapter.getMetadata(activeItem).then(meta => setActiveMetadata(meta));
    setActiveCapabilities(activeAdapter.getCapabilities());

    // If no Goal result yet, kick off inference
    if (!existingGoal) {
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
      typeHint: 'pdf',
    };

    setItems(prev => [newItem, ...prev]);
    setActiveItemId(newItem.id);

    // Kick off Work Execution immediately
    runClassification(newItem);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecuteGoalAction = (actionId: string, actionLabel: string) => {
    setToastMessage(`✓ Executed: ${actionLabel}`);
    setTimeout(() => setToastMessage(null), 4000);
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

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Universal Workspace Header — Outcome & Goal Focused (Zero AI Jargon) */}
      <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
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

        {/* Dynamic Header Badge — Outcome & Goal */}
        <div className="flex-1 flex justify-center">
          {activeItem && (() => {
            const goalResult: GoalIntelligenceResult | undefined = (activeItem as any).__goalResult__;
            const isClassifying = classifying.has(activeItem.id);
            return (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  {getIconForType(activeItem.typeHint)}
                  <span className="font-bold text-sm text-slate-900 max-w-[180px] truncate">
                    {activeItem.rawFile?.name || activeItem.sourceUri}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500">{activeMetadata?.updatedAt || 'Just now'}</span>
                  <span className="text-slate-300">|</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getStatusColor(activeMetadata?.status)}`}>
                    {activeMetadata?.status || 'Ready'}
                  </span>
                </div>

                {/* Outcome Badge — Zero AI Terminology */}
                {isClassifying ? (
                  <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg shadow-sm animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    <span className="text-xs font-bold text-indigo-700">Understanding Work...</span>
                  </div>
                ) : goalResult ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-indigo-200 shadow-sm">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-900">
                      {goalResult.mission.goalTitle}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {goalResult.mission.progressPercent}% Complete
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })()}
        </div>

        <div className="flex items-center gap-2">
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
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              New Workspace Item
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Items</div>
            {items.map(item => {
              const isSelected = activeItemId === item.id;
              const title = item.sourceUri;
              const goal: GoalIntelligenceResult | undefined = (item as any).__goalResult__;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItemId(item.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-200 shadow-sm'
                      : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">{getIconForType(item.typeHint)}</div>
                    <div className="flex-1 overflow-hidden">
                      <div className={`text-xs truncate font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-700'}`}>{title}</div>
                      {goal ? (
                        <div className="text-[10px] font-semibold text-indigo-600 truncate mt-0.5">
                          🎯 {goal.mission.goalTitle}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 mt-0.5">Updated today</div>
                      )}
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
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                <Grid className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">CHATR Work Execution Platform</h2>
              <p className="text-slate-500 mb-8 text-sm max-w-sm mx-auto leading-relaxed">
                Drop any contract, resume, invoice, or health report. CHATR instantly understands your work goal and helps you finish it.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20"
              >
                Browse Files
              </button>
            </div>
          ) : (
            <WorkspaceViewport item={activeItem} />
          )}
        </div>

        {/* SHELL: Right Intelligence Panel (20%) — Outcome & Work Control Center */}
        <div className="w-1/5 min-w-[340px] max-w-[420px] bg-white flex flex-col z-10 p-4 overflow-y-auto shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          {activeItem && (activeItem as any).__goalResult__ ? (
            <GoalDrivenWorkspacePane
              item={activeItem}
              goalResult={(activeItem as any).__goalResult__}
              activeTabId={activeGoalTabId}
              onTabChange={(tabId) => setActiveGoalTabId(tabId)}
              onExecuteAction={handleExecuteGoalAction}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-3" />
              <div className="font-bold text-slate-700">Understanding Work Goal...</div>
              <div className="text-xs text-slate-400 mt-1">Analyzing context and building execution checklist.</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
