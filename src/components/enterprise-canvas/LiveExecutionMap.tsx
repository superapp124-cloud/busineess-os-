import React, { useState } from 'react';
import {
  FileText, Activity, GitBranch, Cpu, Target, Zap, Link, Database, Shield, Layers, CheckCircle2, ChevronRight, Info
} from 'lucide-react';
import { MissionExecutionContext } from '../../core/types';

interface Props {
  missionContext: MissionExecutionContext | null;
  isOpen: boolean;
  onClose: () => void;
}

interface MapNode {
  id: string;
  label: string;
  layer: 'Artifact' | 'Event' | 'Graph' | 'Inference' | 'Mission' | 'Capability' | 'Connector' | 'ERP' | 'Audit' | 'State';
  status: 'Completed' | 'Active' | 'Pending';
  latency: string;
  details: Record<string, string>;
  icon: React.ReactNode;
}

export const LiveExecutionMap: React.FC<Props> = ({ missionContext, isOpen, onClose }) => {
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);

  if (!isOpen) return null;

  const nodes: MapNode[] = [
    {
      id: 'node_1',
      label: (missionContext?.trigger?.payload as any)?.sourceUri || 'Prescription.pdf',
      layer: 'Artifact',
      status: 'Completed',
      latency: '0ms',
      details: { Type: 'PDF Document', Hash: 'sha256:e3b0c442...', Size: '1.2 MB', Source: 'UI Ingestion' },
      icon: <FileText className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'node_2',
      label: 'ArtifactObserved Event',
      layer: 'Event',
      status: 'Completed',
      latency: '2ms',
      details: { Topic: 'tenant_demo.Artifact', Sequence: '#104', TraceID: 'tr_99182', Partition: 'P-02' },
      icon: <Activity className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'node_3',
      label: 'Digital Twin Graph',
      layer: 'Graph',
      status: 'Completed',
      latency: '8ms',
      details: { NodesCreated: '3', EdgesTraversed: '7', Entity: 'Rajesh Kumar (Patient)', GraphStore: 'Neo4j' },
      icon: <GitBranch className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'node_4',
      label: 'Risk & Policy Plugins',
      layer: 'Inference',
      status: 'Completed',
      latency: '18ms',
      details: { RiskScore: '98%', Alert: 'Metformin + Contrast Dye', Hypotheses: '2 generated', PureRead: 'Enforced' },
      icon: <Cpu className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'node_5',
      label: missionContext?.mission || 'Diabetic Care Mission',
      layer: 'Mission',
      status: 'Active',
      latency: '22ms',
      details: { Lifecycle: 'PENDING_APPROVAL', ActionRequired: 'Doctor & Patient Approval', SLA: '48h Faster' },
      icon: <Target className="w-4 h-4 text-rose-400" />,
    },
    {
      id: 'node_6',
      label: 'Prescription OCR & Pathology',
      layer: 'Capability',
      status: 'Pending',
      latency: '—',
      details: { CapabilityID: 'cap_ocr', Cost: '$0.005', TimeoutMs: '3000ms', ExecutionMode: 'Parallel DAG' },
      icon: <Zap className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'node_7',
      label: 'Apollo FHIR & Star Health API',
      layer: 'Connector',
      status: 'Pending',
      latency: '—',
      details: { Connector: 'conn_apollo_fhir', OAuth: 'Token Validated', CircuitBreaker: 'Healthy' },
      icon: <Link className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'node_8',
      label: 'SAP ERP & EHR Commit',
      layer: 'ERP',
      status: 'Pending',
      latency: '—',
      details: { Ledger: 'SAP S/4HANA', PostType: 'PreAuth Claim #SH-9921', Status: 'Queued' },
      icon: <Database className="w-4 h-4 text-yellow-400" />,
    },
    {
      id: 'node_9',
      label: 'Immutable Audit Log',
      layer: 'Audit',
      status: 'Pending',
      latency: '—',
      details: { AuditHash: 'sha256:7f8a9b...', Seal: 'Verified', Storage: 'DistributedEventStore' },
      icon: <Shield className="w-4 h-4 text-teal-400" />,
    },
    {
      id: 'node_10',
      label: 'Digital Twin State Commit',
      layer: 'State',
      status: 'Pending',
      latency: '—',
      details: { ProjectionVersion: 'v2.1', ACIDSafety: 'Guaranteed', Snapshot: 'Checkpointed' },
      icon: <Layers className="w-4 h-4 text-indigo-300" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 text-slate-100 font-sans flex flex-col backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Live Real-Time Execution Map</h2>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CER Signature Architecture
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Interactive End-to-End Pipeline Trace (Click any node to inspect operational telemetry)</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
        >
          Close ⌘ESC
        </button>
      </div>

      {/* Main Interactive Map */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Horizontal Node Flow Canvas */}
        <div className="flex-1 p-8 bg-slate-950 flex items-center overflow-x-auto relative">
          <div className="flex items-center gap-3 min-w-max mx-auto">
            {nodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                
                {/* Node Box */}
                <button
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-2xl border transition-all duration-200 text-left flex flex-col gap-2.5 w-44 backdrop-blur shadow-xl relative group ${
                    selectedNode?.id === node.id
                      ? 'bg-indigo-600 border-indigo-300 text-white ring-4 ring-indigo-500/30 scale-105 z-20'
                      : node.status === 'Completed'
                      ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-400 hover:bg-slate-850 text-slate-200'
                      : node.status === 'Active'
                      ? 'bg-amber-950/80 border-amber-500/50 hover:border-amber-400 text-amber-100 ring-2 ring-amber-500/20'
                      : 'bg-slate-950 border-slate-800/60 opacity-60 hover:opacity-100 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
                      {node.icon}
                    </div>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      node.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      node.status === 'Active' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                      'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">{node.layer}</div>
                    <div className="text-xs font-bold truncate mt-0.5">{node.label}</div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] border-t border-slate-800/80 pt-2 font-mono">
                    <span className="text-slate-500">Latency:</span>
                    <span className="text-indigo-300 font-bold">{node.latency}</span>
                  </div>
                </button>

                {/* Arrow Connector */}
                {idx < nodes.length - 1 && (
                  <div className="flex items-center shrink-0">
                    <ChevronRight className={`w-5 h-5 ${
                      node.status === 'Completed' ? 'text-indigo-400' : 'text-slate-700'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="w-80 border-l border-slate-800 bg-slate-900 p-5 flex flex-col gap-5 overflow-y-auto shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Node Telemetry Inspector</div>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                    {selectedNode.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{selectedNode.label}</div>
                    <div className="text-[9px] font-mono text-indigo-300 uppercase">{selectedNode.layer} Layer</div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-700 pt-3">
                  {Object.entries(selectedNode.details).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{k}:</span>
                      <span className="font-mono text-slate-200 font-bold text-[11px]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-[10px] text-slate-400 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-indigo-400 mb-1" />
                This node represents the <strong className="text-slate-200">{selectedNode.layer}</strong> layer in the CER 12-stage execution lifecycle.
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic p-4 text-center border border-dashed border-slate-800 rounded-xl">
              Click any node in the execution map to inspect telemetry details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
