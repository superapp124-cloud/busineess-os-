import React, { useState } from 'react';
import { LucideActivity, LucidePlay, LucideCheckCircle, LucideXCircle, LucidePauseCircle, LucideTerminal, LucideBrain, LucideGitCommit } from 'lucide-react';
import { PageLoader } from '@/components/PageLoader';

// Mock data for UI preview since the engine runs in memory right now
const MOCK_EXECUTIONS = [
  {
    execution_id: 'exec_1234_abc',
    workflow_id: 'generate_growth_campaign',
    intent_id: 'intent_999',
    status: 'Running',
    current_step: 'node_generate_assets',
    started_at: Date.now() - 5000,
    retry_count: 0
  },
  {
    execution_id: 'exec_5678_xyz',
    workflow_id: 'legal_contract_review',
    intent_id: 'intent_888',
    status: 'Paused',
    current_step: 'node_human_approval',
    started_at: Date.now() - 15000,
    retry_count: 0
  }
];

export default function ExecutionInspector() {
  const [selectedExec, setSelectedExec] = useState<string | null>(null);

  const selected = MOCK_EXECUTIONS.find(e => e.execution_id === selectedExec);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <LucideActivity className="text-blue-400" />
          <h2 className="text-lg font-semibold">Execution Inspector</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {MOCK_EXECUTIONS.map(exec => {
            const isSelected = selectedExec === exec.execution_id;
            
            return (
              <button 
                key={exec.execution_id}
                onClick={() => setSelectedExec(exec.execution_id)}
                className={`w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors ${isSelected ? 'bg-gray-800 border border-gray-700' : 'hover:bg-gray-800/50 border border-transparent'}`}
              >
                <div className={`p-2 rounded-lg bg-gray-800 ${exec.status === 'Running' ? 'text-blue-400' : exec.status === 'Paused' ? 'text-amber-400' : 'text-gray-400'}`}>
                  {exec.status === 'Running' && <LucidePlay size={18} />}
                  {exec.status === 'Paused' && <LucidePauseCircle size={18} />}
                  {exec.status === 'Completed' && <LucideCheckCircle size={18} />}
                  {exec.status === 'Failed' && <LucideXCircle size={18} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium text-sm truncate">{exec.workflow_id}</div>
                  <div className="text-xs text-gray-500 font-mono truncate">{exec.execution_id}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {!selected ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <LucideTerminal size={48} className="mb-4 opacity-50" />
            <p>Select an execution to inspect its IEM graph and telemetry.</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex items-start justify-between border-b border-gray-800 pb-6">
              <div>
                <h1 className="text-3xl font-bold">{selected.workflow_id}</h1>
                <p className="text-gray-400 font-mono text-sm mt-2">ID: {selected.execution_id}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                  selected.status === 'Running' ? 'bg-blue-950 border-blue-900 text-blue-400' : 
                  selected.status === 'Paused' ? 'bg-amber-950 border-amber-900 text-amber-400' :
                  'bg-gray-900 border-gray-700 text-gray-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    selected.status === 'Running' ? 'bg-blue-500 animate-pulse' : 
                    selected.status === 'Paused' ? 'bg-amber-500' : 'bg-gray-500'
                  }`} />
                  {selected.status}
                </div>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-6">
              {/* Telemetry */}
              <div className="col-span-3 grid grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">Intent ID</div>
                  <div className="text-sm font-mono truncate">{selected.intent_id}</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">Current Node</div>
                  <div className="text-sm font-mono text-purple-400 truncate">{selected.current_step}</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">Started</div>
                  <div className="text-sm">{new Date(selected.started_at).toLocaleTimeString()}</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">Retries</div>
                  <div className="text-sm">{selected.retry_count}</div>
                </div>
              </div>

              {/* Execution Graph Visualizer (Mock text for now) */}
              <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <LucideGitCommit size={16} /> IEM Workflow Graph
                </h3>
                <div className="space-y-4">
                  <div className="p-3 border border-green-900/50 bg-green-900/10 rounded-lg flex justify-between items-center text-green-400">
                    <span>node_start_intent</span>
                    <LucideCheckCircle size={16} />
                  </div>
                  <div className="w-0.5 h-4 bg-gray-800 mx-auto" />
                  <div className="p-3 border border-green-900/50 bg-green-900/10 rounded-lg flex justify-between items-center text-green-400">
                    <span>node_fetch_context</span>
                    <LucideCheckCircle size={16} />
                  </div>
                  <div className="w-0.5 h-4 bg-gray-800 mx-auto" />
                  <div className="p-3 border border-blue-900/50 bg-blue-900/10 rounded-lg flex justify-between items-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <span className="font-bold">{selected.current_step}</span>
                    <LucidePlay size={16} className="animate-pulse" />
                  </div>
                  <div className="w-0.5 h-4 bg-gray-800 mx-auto" />
                  <div className="p-3 border border-gray-800 bg-gray-950 rounded-lg flex justify-between items-center text-gray-600">
                    <span>node_finalize</span>
                  </div>
                </div>
              </div>

              {/* Console / Event Log */}
              <div className="col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col h-[500px]">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <LucideTerminal size={16} /> Event Log
                </h3>
                <div className="flex-1 bg-black rounded border border-gray-800 p-3 overflow-y-auto font-mono text-xs space-y-2">
                  <div className="text-gray-500">[{new Date(selected.started_at).toISOString()}] [INFO] Execution started</div>
                  <div className="text-green-400">[{new Date(selected.started_at + 100).toISOString()}] [SUCCESS] node_start_intent completed</div>
                  <div className="text-blue-400">[{new Date(selected.started_at + 150).toISOString()}] [INFO] EventMesh published 'intent.analyzed'</div>
                  <div className="text-green-400">[{new Date(selected.started_at + 500).toISOString()}] [SUCCESS] node_fetch_context completed</div>
                  <div className="text-purple-400">[{new Date(selected.started_at + 510).toISOString()}] [INFO] Transitioning to {selected.current_step}</div>
                  {selected.status === 'Paused' && (
                    <div className="text-amber-400">[{new Date(selected.started_at + 550).toISOString()}] [WARN] Execution Paused. Awaiting Human Approval.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
