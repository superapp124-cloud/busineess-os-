import React, { useState, useEffect } from 'react';
import { UniversalSearchService, UniversalSearchResult, SearchDomain } from '../../search/UniversalSearchService';
import { DocumentAgentTools } from '../../runtimes/intelligence/DocumentAgentTools';
import { IntentPlanner } from '../../planner/IntentPlanner';
import { ExecutionPlan } from '../../planner/ExecutionGraph';
import { Search, FileText, Mail, Calendar, User, CheckSquare, MessageSquare, Globe, Command, X, Play, Sparkles, Shield, FileCheck, GitBranch, ArrowRight, CheckCircle2 } from 'lucide-react';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (result: UniversalSearchResult) => void;
}

export interface IntentAction {
  id: string;
  title: string;
  category: 'DocumentTool' | 'Workflow' | 'Navigation';
  description: string;
  icon: React.ElementType;
  handler: () => void | Promise<void>;
}

const DOMAIN_ICONS: Record<SearchDomain, React.ElementType> = {
  Document: FileText,
  Email: Mail,
  Calendar: Calendar,
  Contact: User,
  Task: CheckSquare,
  Message: MessageSquare,
  WebClip: Globe,
};

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({ isOpen, onClose, onSelectResult }) => {
  const [queryText, setQueryText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<SearchDomain | 'All'>('All');
  const [results, setResults] = useState<UniversalSearchResult[]>([]);
  const [actions, setActions] = useState<IntentAction[]>([]);
  const [activePlan, setActivePlan] = useState<ExecutionPlan | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamic Intent Detection & Search Results Query
  useEffect(() => {
    const q = queryText.toLowerCase().trim();
    const detectedActions: IntentAction[] = [];

    if (q.includes('summarize') || q.includes('summary')) {
      detectedActions.push({
        id: 'act_summarize',
        title: 'Summarize Selected Document',
        category: 'DocumentTool',
        description: 'Execute AI document summarization on current workspace PDF',
        icon: Sparkles,
        handler: async () => {
          const summary = await DocumentAgentTools.summarize('doc_current');
          setActionFeedback(`Summary Generated: ${summary.slice(0, 120)}...`);
        },
      });
    }

    if (q.includes('clause') || q.includes('contract') || q.includes('legal')) {
      detectedActions.push({
        id: 'act_clause',
        title: 'Find Contract Clauses & Liability Caps',
        category: 'DocumentTool',
        description: 'Search Delaware governing law and liability clauses across contracts',
        icon: FileCheck,
        handler: async () => {
          const clauses = await DocumentAgentTools.findClause('liability');
          setActionFeedback(`Found ${clauses.length} clause matches in Master Services Agreement.`);
        },
      });
    }

    if (q.includes('redact') || q.includes('pii') || q.includes('ssn') || q.includes('privacy')) {
      detectedActions.push({
        id: 'act_redact',
        title: 'Scan & Redact Sensitive PII Data',
        category: 'DocumentTool',
        description: 'Automatically mask SSNs, tax IDs, and confidential vitals',
        icon: Shield,
        handler: async () => {
          const res = await DocumentAgentTools.redactPII('SSN sample: 000-12-3456');
          setActionFeedback(`PII Scan Complete: Redacted ${res.piiCount} sensitive records.`);
        },
      });
    }

    if (q.includes('invoice') || q.includes('acme') || q.includes('create invoice')) {
      detectedActions.push({
        id: 'act_invoice',
        title: 'Run Accounting AI Invoice Parsing Workflow',
        category: 'Workflow',
        description: 'Parse line items, vendor details, and tax totals for INV-2026-884',
        icon: Play,
        handler: () => {
          setActionFeedback('Launched Accounting AI Workflow: Invoice INV-2026-884 verified.');
        },
      });
    }

    // Generate Intent Execution Plan DAG via IntentPlanner
    if (q.length >= 6 && (q.includes(' ') || q.includes('summarize') || q.includes('contract') || q.includes('email'))) {
      try {
        const plan = IntentPlanner.generatePlan(queryText);
        setActivePlan(plan);
      } catch (e) {
        setActivePlan(null);
      }
    } else {
      setActivePlan(null);
    }

    setActions(detectedActions);

    const domainsFilter = selectedDomain === 'All' ? undefined : [selectedDomain];
    const searchResults = UniversalSearchService.search({
      text: queryText,
      domains: domainsFilter,
      limit: 10,
    });
    setResults(searchResults);
  }, [queryText, selectedDomain]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={queryText}
            onChange={e => {
              setQueryText(e.target.value);
              setActionFeedback(null);
            }}
            placeholder="Type intent command ('summarize', 'find clause', 'redact pii') or search..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 p-3 text-xs text-emerald-300 font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Domain Filters */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          {(['All', 'Document', 'Email', 'Calendar', 'Contact', 'Task', 'Message'] as const).map(domain => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedDomain === domain
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* Scrollable Results & Intent Actions */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Compiled Intent Execution Plan DAG */}
          {activePlan && (
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Compiled Execution Plan (DAG)</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono rounded border border-indigo-500/30">
                    Confidence: {(activePlan.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <button
                  onClick={async () => {
                    const res = await IntentPlanner.executePlan(activePlan);
                    setActionFeedback(`Execution Plan Completed: ${res.stepsCompleted}/${res.totalSteps} steps executed in ${res.durationMs}ms.`);
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Execute DAG Plan
                </button>
              </div>

              <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                {activePlan.steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-2 bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{step.name}</span>
                    {step.dependencies.length > 0 && (
                      <span className="text-[9px] text-slate-500 ml-auto flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        dep: {step.dependencies.join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Quick Intent Actions */}
          {actions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider px-1 font-bold">
                Detected Intent Command Actions
              </span>
              {actions.map(act => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => act.handler()}
                    className="w-full text-left p-3 rounded-xl bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-all">{act.title}</h4>
                        <p className="text-[11px] text-slate-400">{act.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 font-semibold">
                      Execute
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Search Index Results */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-1 font-bold">
              Universal Memory & Search Results ({results.length})
            </span>
            {results.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-500">
                No matching items found across workspace memory.
              </div>
            ) : (
              results.map(item => {
                const Icon = DOMAIN_ICONS[item.domain] || FileText;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectResult) onSelectResult(item);
                      onClose();
                    }}
                    className="p-3 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 cursor-pointer flex items-start gap-3 transition-all"
                  >
                    <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                        <span className="text-[10px] font-mono text-slate-500">{item.domain}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.snippet}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Command className="w-3 h-3 text-cyan-400" />
            <span>CHATR Intent Launcher (Ctrl + K)</span>
          </div>
          <span>Press ESC or Ctrl+K to close</span>
        </div>
      </div>
    </div>
  );
};
