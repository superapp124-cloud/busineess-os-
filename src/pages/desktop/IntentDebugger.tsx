import React, { useState } from 'react';
import { 
  LucideActivity, LucidePlay, LucidePause, LucideRefreshCw, 
  LucideDatabase, LucideTerminal, LucideBrain, LucideShieldCheck, 
  LucideBox, LucideEdit3
} from 'lucide-react';
import { PageLoader } from '@/components/PageLoader';

/**
 * The Deep Intent Debugger
 * This enterprise-grade tool visualizes the full execution lifecycle of a workflow,
 * allowing developers to pause, inspect, replay, and override at any stage.
 */

const mockTrace = [
  { id: 't1', stage: 'Natural Language', status: 'completed', icon: LucideTerminal, data: { input: "Onboard new employee John Doe", confidence: 0.98 } },
  { id: 't2', stage: 'Intent Parser', status: 'completed', icon: LucideBrain, data: { intent: "Onboarding", entity: "Employee", name: "John Doe" } },
  { id: 't3', stage: 'Memory', status: 'completed', icon: LucideDatabase, data: { contextFound: ["Template: Standard Dev Onboarding"] } },
  { id: 't4', stage: 'Planner', status: 'completed', icon: LucideActivity, data: { tokensUsed: 1240, latencyMs: 850, generatedNodes: 5 } },
  { id: 't5', stage: 'Capability Resolution', status: 'completed', icon: LucideBox, data: { resolved: ["com.chatr.hr", "com.chatr.it"] } },
  { id: 't6', stage: 'Policy', status: 'completed', icon: LucideShieldCheck, data: { evaluation: "Allow", policiesEnforced: ["DataResidency", "RoleBasedAccess"] } },
  { id: 't7', stage: 'Dependency Resolution', status: 'completed', icon: LucideBox, data: { order: ["com.chatr.it", "com.chatr.hr"] } },
  { id: 't8', stage: 'Execution Graph', status: 'paused', icon: LucidePlay, data: { nodesPending: 5, currentNode: "Create Active Directory User" } },
  { id: 't9', stage: 'Resource Allocation', status: 'pending', icon: LucideActivity, data: null },
  { id: 't10', stage: 'Connector Calls', status: 'pending', icon: LucideDatabase, data: null },
  { id: 't11', stage: 'Business Objects', status: 'pending', icon: LucideDatabase, data: null },
  { id: 't12', stage: 'Results & Metrics', status: 'pending', icon: LucideActivity, data: null },
];

export default function IntentDebugger() {
  const [activeNode, setActiveNode] = useState(mockTrace[7]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Deep Intent Debugger
          </h1>
          <p className="text-sm text-gray-400 mt-1">Trace, inspect, and override the execution lifecycle</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors">
            <LucidePlay className="w-4 h-4" /> Resume Execution
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: Trace Timeline */}
        <div className="w-80 border-r border-white/10 p-4 overflow-y-auto bg-[#0d0d0d]">
          <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Lifecycle Trace</h2>
          <div className="space-y-2">
            {mockTrace.map((node, i) => {
              const Icon = node.icon;
              const isActive = activeNode.id === node.id;
              
              let statusColor = "text-gray-500";
              if (node.status === 'completed') statusColor = "text-green-500";
              if (node.status === 'paused') statusColor = "text-amber-500 animate-pulse";
              if (node.status === 'error') statusColor = "text-red-500";
              if (isActive) statusColor = "text-indigo-400";

              return (
                <button
                  key={node.id}
                  onClick={() => setActiveNode(node)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                    isActive ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`mt-0.5 ${statusColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-200">{node.stage}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{node.status}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right pane: Inspection & Override */}
        <div className="flex-1 p-8 overflow-y-auto bg-[#111]">
          {activeNode && (
            <div className="max-w-3xl space-y-6">
              
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                  <activeNode.icon className="w-8 h-8 text-indigo-400" />
                  {activeNode.stage}
                </h2>
                
                <div className="flex gap-2">
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Replay Stage">
                    <LucideRefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Override Data">
                    <LucideEdit3 className="w-4 h-4" />
                  </button>
                  {activeNode.status === 'paused' && (
                    <button className="p-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg transition-colors flex items-center gap-2 px-3 text-sm font-medium">
                      <LucidePlay className="w-4 h-4" /> Step Over
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-semibold text-gray-400 tracking-wider">
                  STATE INSPECTOR
                </div>
                <div className="p-4">
                  {activeNode.data ? (
                    <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                      {JSON.stringify(activeNode.data, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-sm text-gray-600 italic">No state data available for pending stage.</div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
