import React, { useState } from 'react';
import {
  GitBranch, Play, Clock, Search, RotateCcw, Filter,
  Shield, User, Briefcase, Database, Zap, ChevronRight,
  AlertTriangle, Eye, Layers, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import { MissionExecutionContext } from '../../core/types';

interface Props {
  missionContext: MissionExecutionContext | null;
  isOpen: boolean;
  onClose: () => void;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'Person' | 'Document' | 'System' | 'Policy' | 'Organization' | 'Alert';
  x: number;
  y: number;
  properties: Record<string, string>;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
  type: 'governs' | 'belongs_to' | 'interacts' | 'requires' | 'performed_by';
}

// Sample Digital Twin Graph data
const SAMPLE_NODES: GraphNode[] = [
  { id: 'pat_1', label: 'Rajesh Kumar (Patient)', type: 'Person', x: 180, y: 140, properties: { Age: '58', Condition: 'T2DM', eGFR: '67' } },
  { id: 'doc_1', label: 'Prescription PDF', type: 'Document', x: 420, y: 140, properties: { Clinic: 'Apollo', Date: '2026-08-01' } },
  { id: 'drug_1', label: 'Metformin 500mg BD', type: 'System', x: 300, y: 280, properties: { ATC: 'A10BA02', Status: 'Prescribed' } },
  { id: 'drug_2', label: 'Contrast Dye (MRI)', type: 'Alert', x: 560, y: 280, properties: { Risk: 'HIGH', Alert: 'Nephropathy Risk' } },
  { id: 'pol_1', label: 'Drug Interaction Protocol', type: 'Policy', x: 420, y: 410, properties: { Rule: 'Stop Metformin 48h pre-dye' } },
  { id: 'ins_1', label: 'Star Health Insurance', type: 'Organization', x: 180, y: 380, properties: { Policy: '#SH2024-88291', Remaining: '₹11,800' } },
  { id: 'lab_1', label: 'Dr. Lal PathLabs', type: 'Organization', x: 680, y: 140, properties: { Panel: 'Diabetic Workup (8 tests)' } },
];

const SAMPLE_EDGES: GraphEdge[] = [
  { from: 'pat_1', to: 'doc_1', label: 'HAS_PRESCRIPTION', type: 'belongs_to' },
  { from: 'doc_1', to: 'drug_1', label: 'PRESCRIBES', type: 'belongs_to' },
  { from: 'drug_1', to: 'drug_2', label: '⚠️ HIGH INTERACTION RISK', type: 'interacts' },
  { from: 'pol_1', to: 'drug_1', label: 'GOVERNS', type: 'governs' },
  { from: 'pat_1', to: 'ins_1', label: 'COVERED_BY', type: 'belongs_to' },
  { from: 'doc_1', to: 'lab_1', label: 'ORDERS_PANEL', type: 'requires' },
];

export const DigitalTwinExplorer: React.FC<Props> = ({ missionContext, isOpen, onClose }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(SAMPLE_NODES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeTravelStep, setTimeTravelStep] = useState(100); // 0 to 100%
  const [isReplaying, setIsReplaying] = useState(false);

  if (!isOpen) return null;

  const filteredNodes = SAMPLE_NODES.filter(n =>
    n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTimeTravelLabel = (val: number) => {
    if (val === 100) return 'NOW (Real-Time Live Twin)';
    if (val > 75) return '15 mins ago (Post-Inference)';
    if (val > 50) return '1 hour ago (Post-OCR Extraction)';
    if (val > 25) return 'Yesterday (Pre-Prescription Upload)';
    return '1 Month ago (Baseline Record)';
  };

  const handleReplay = () => {
    setIsReplaying(true);
    setTimeTravelStep(0);
    let step = 0;
    const timer = setInterval(() => {
      step += 20;
      setTimeTravelStep(step);
      if (step >= 100) {
        clearInterval(timer);
        setIsReplaying(false);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 text-slate-100 font-sans flex flex-col backdrop-blur-md animate-in fade-in duration-200">

      {/* Top Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Digital Twin Graph Explorer</h2>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CER v2.0 Live Engine
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Interactive Enterprise Ontology Graph & Time Travel Event Replay</p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search graph nodes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 pl-8 pr-3 py-1.5 rounded-lg text-xs w-56 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
          >
            Close ⌘ESC
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Canvas Graph Representation */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">

          {/* Time Travel Slider Control */}
          <div className="absolute top-4 left-4 right-4 z-10 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 backdrop-blur shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300">Time Travel & Replay:</span>
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950 px-2.5 py-1 rounded border border-indigo-800">
                {getTimeTravelLabel(timeTravelStep)}
              </span>
            </div>

            <div className="flex-1 flex items-center gap-3 max-w-md">
              <input
                type="range"
                min="0"
                max="100"
                value={timeTravelStep}
                onChange={e => setTimeTravelStep(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <button
              onClick={handleReplay}
              disabled={isReplaying}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isReplaying
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isReplaying ? 'animate-spin' : ''}`} />
              {isReplaying ? 'Replaying...' : 'Replay State Stream'}
            </button>
          </div>

          {/* Visual SVG Canvas */}
          <div className="flex-1 relative flex items-center justify-center p-12">
            <svg className="w-full h-full absolute inset-0 pointer-events-none">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                </marker>
                <marker id="arrow-red" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
              </defs>

              {SAMPLE_EDGES.map((edge, idx) => {
                const fromNode = SAMPLE_NODES.find(n => n.id === edge.from);
                const toNode = SAMPLE_NODES.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                const isAlert = edge.type === 'interacts';

                return (
                  <g key={idx}>
                    <line
                      x1={`${(fromNode.x / 800) * 100}%`}
                      y1={`${(fromNode.y / 500) * 100}%`}
                      x2={`${(toNode.x / 800) * 100}%`}
                      y2={`${(toNode.y / 500) * 100}%`}
                      stroke={isAlert ? '#ef4444' : '#6366f1'}
                      strokeWidth={isAlert ? '2.5' : '1.5'}
                      strokeDasharray={isAlert ? '4' : 'none'}
                      markerEnd={isAlert ? 'url(#arrow-red)' : 'url(#arrow)'}
                      className="opacity-70"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Render Nodes */}
            <div className="w-full h-full relative">
              {filteredNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isAlert = node.type === 'Alert';

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{ left: `${(node.x / 800) * 100}%`, top: `${(node.y / 500) * 100}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-3 rounded-2xl border transition-all duration-200 shadow-xl flex items-center gap-3 backdrop-blur ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-300 ring-4 ring-indigo-500/30 scale-105 z-20'
                        : isAlert
                        ? 'bg-red-950/80 text-red-200 border-red-500/50 hover:border-red-400 z-10'
                        : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-indigo-400 hover:bg-slate-800 z-10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      node.type === 'Person' ? 'bg-indigo-500/20 text-indigo-300' :
                      node.type === 'Document' ? 'bg-cyan-500/20 text-cyan-300' :
                      node.type === 'Policy' ? 'bg-violet-500/20 text-violet-300' :
                      node.type === 'Alert' ? 'bg-red-500/20 text-red-400' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {node.type === 'Person' && <User className="w-4 h-4" />}
                      {node.type === 'Document' && <Layers className="w-4 h-4" />}
                      {node.type === 'Policy' && <Shield className="w-4 h-4" />}
                      {node.type === 'Alert' && <AlertTriangle className="w-4 h-4" />}
                      {node.type === 'Organization' && <Briefcase className="w-4 h-4" />}
                      {node.type === 'System' && <Database className="w-4 h-4" />}
                    </div>

                    <div className="text-left">
                      <div className="text-xs font-bold leading-tight">{node.label}</div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5 font-mono">{node.type}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Node Properties & Graph Connections */}
        <div className="w-80 border-l border-slate-800 bg-slate-900 p-5 flex flex-col gap-5 overflow-y-auto shrink-0">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Entity Details</div>
            {selectedNode ? (
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{selectedNode.label}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {selectedNode.type}
                  </span>
                </div>

                <div className="space-y-1.5 border-t border-slate-700 pt-2">
                  {Object.entries(selectedNode.properties).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{k}:</span>
                      <span className="font-mono text-slate-200 font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Select a graph node to inspect properties.</p>
            )}
          </div>

          {/* Graph Connections */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Connected Relationships</div>
            <div className="space-y-2">
              {SAMPLE_EDGES.filter(e => e.from === selectedNode?.id || e.to === selectedNode?.id).map((edge, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs flex items-center justify-between">
                  <span className="font-mono text-[10px] text-indigo-300 font-bold">{edge.label}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-300 font-semibold truncate max-w-[120px]">
                    {edge.from === selectedNode?.id ? edge.to : edge.from}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
