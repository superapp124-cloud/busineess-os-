import React, { useState, useEffect } from 'react';
import { X, Server, Network, Settings, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export interface RuntimeInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'Events' | 'Graph' | 'State' | 'Plugins' | 'Capabilities' | 'Connectors' | 'Performance' | 'Replay';
const TABS: TabType[] = ['Events', 'Graph', 'State', 'Plugins', 'Capabilities', 'Connectors', 'Performance', 'Replay'];

export const RuntimeInspector: React.FC<RuntimeInspectorProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Events');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 text-slate-100 font-mono flex flex-col backdrop-blur-sm">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="font-bold tracking-wide text-sm">CHATR Runtime Inspector</span>
          <span className="text-slate-500 text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Ctrl+Shift+I</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 border-b border-slate-800 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium border-r border-slate-800 whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-slate-800 text-white border-t-2 border-t-indigo-500' 
                : 'bg-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 border-t-2 border-t-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'Events' && <EventsTab />}
        {activeTab === 'Plugins' && <PluginsTab />}
        {activeTab === 'Capabilities' && <CapabilitiesTab />}
        {activeTab === 'Performance' && <PerformanceTab />}
        {activeTab === 'Connectors' && <ConnectorsTab />}
        
        {['Graph', 'State', 'Replay'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <Settings className="w-12 h-12 animate-[spin_4s_linear_infinite] opacity-50" />
            <div className="text-lg font-sans">Coming in next sprint</div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- TABS COMPONENTS ---

const EventsTab = () => {
  const events = [
    { type: 'ArtifactObserved', source: 'UI_Upload', time: '2ms ago', badge: 'green', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { type: 'InferenceGenerated', source: 'EnterpriseInferenceEngine', time: '18ms ago', badge: 'blue', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { type: 'MissionCreated', source: 'MissionIntelligence', time: '22ms ago', badge: 'indigo', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { type: 'MissionStateChanged', source: 'EVALUATION→PENDING_APPROVAL', time: '23ms ago', badge: 'amber', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { type: 'PolicyEvaluated', source: 'PolicyEvaluationPlugin', time: '45ms ago', badge: 'purple', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { type: 'RiskAssessed', source: 'score: 0.18 LOW', time: '46ms ago', badge: 'emerald', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { type: 'RecommendationGenerated', source: '2 actions', time: '48ms ago', badge: 'cyan', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { type: 'StateUpdated', source: 'store: mission', time: '50ms ago', badge: 'orange', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  ];

  return (
    <div className="space-y-2">
      {events.map((evt, i) => (
        <div key={i} className="flex items-center p-2 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
          <div className={`w-1 h-8 rounded-full ${evt.color.split(' ')[0].replace('/20', '')} mr-4`} />
          <div className="flex-1 flex items-center space-x-4">
            <span className="font-bold text-slate-200">{evt.type}</span>
            <span className={`px-2 py-0.5 text-[10px] rounded border ${evt.color} uppercase tracking-wider`}>
              {evt.badge}
            </span>
            <span className="text-slate-500 text-sm truncate max-w-md">{evt.source}</span>
          </div>
          <div className="text-slate-500 text-xs">{evt.time}</div>
        </div>
      ))}
    </div>
  );
};

const PluginsTab = () => {
  const plugins = [
    { name: 'RelationshipPlugin', latency: '12ms' },
    { name: 'PolicyEvaluationPlugin', latency: '8ms' },
    { name: 'RiskAnalyzerPlugin', latency: '14ms' },
    { name: 'MissionRecommendationPlugin', latency: '6ms' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {plugins.map((p, i) => (
        <div key={i} className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-200">{p.name}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">Healthy</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Latency: <span className="text-emerald-400">{p.latency}</span></span>
            <span className="text-slate-400">Success: <span className="text-slate-200">100%</span></span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

const CapabilitiesTab = () => {
  const caps = [
    { name: 'ContractReview', p50: '320ms' },
    { name: 'RiskEvaluator', p50: '85ms' },
    { name: 'PolicyValidator', p50: '45ms' },
    { name: 'EntityExtractor', p50: '22ms' },
  ];

  return (
    <div className="space-y-3">
      {caps.map((c, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-4">
            <Server className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="font-bold text-slate-200">{c.name}</div>
              <div className="text-[10px] text-slate-500 mt-1">pod-v2-abc{i} • Running</div>
            </div>
          </div>
          <div className="flex items-center space-x-8">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">p50 Latency</div>
              <div className="text-slate-300">{c.p50}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">SLA</div>
              <div className="text-emerald-400">{i === 0 ? '99.8%' : '100%'}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PerformanceTab = () => {
  const metrics = [
    { label: 'Inference', value: '84ms', avg: true, color: 'text-indigo-400' },
    { label: 'Mission Creation', value: '22ms', avg: true, color: 'text-emerald-400' },
    { label: 'Execution', value: '320ms', avg: true, color: 'text-amber-400' },
    { label: 'Knowledge Retrieval', value: '18ms', avg: true, color: 'text-blue-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="p-6 rounded-xl bg-slate-800 border border-slate-700 flex flex-col justify-between h-40">
          <div className="text-slate-400 text-xs font-sans">{m.label} {m.avg && '(avg)'}</div>
          <div className={`text-4xl font-bold mt-2 ${m.color}`}>{m.value}</div>
          <div className="flex items-end space-x-1 h-8 mt-auto opacity-60">
            {[...Array(8)].map((_, j) => (
              <div 
                key={j} 
                className="w-full bg-slate-600 rounded-t" 
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ConnectorsTab = () => {
  const connectors = [
    { name: 'SAP ERP', status: 'Connected', type: 'success' },
    { name: 'Slack', status: 'Healthy', type: 'success' },
    { name: 'Microsoft 365', status: 'Connected', type: 'success' },
    { name: 'GitHub', status: 'Disconnected', type: 'error' },
    { name: 'Workday HRIS', status: 'Connected', type: 'success' },
    { name: 'Salesforce CRM', status: 'Degraded', type: 'warning' },
  ];

  const getIcon = (type: string) => {
    if (type === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (type === 'error') return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-amber-500" />;
  };

  const getColor = (type: string) => {
    if (type === 'success') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (type === 'error') return 'text-red-500 bg-red-500/10 border-red-500/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connectors.map((c, i) => (
        <div key={i} className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Network className="w-5 h-5 text-slate-500" />
            <span className="font-bold text-slate-200">{c.name}</span>
          </div>
          <div className={`flex items-center space-x-1.5 px-2 py-1 rounded border text-[10px] uppercase tracking-wider ${getColor(c.type)}`}>
            {getIcon(c.type)}
            <span>{c.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
