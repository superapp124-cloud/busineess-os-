import React, { useState, useEffect } from 'react';
import { CapabilityRegistry } from '@/sdk/kernel/CapabilityRegistry';
import { CapabilityRuntimeManager, ICapabilityStatus } from '@/sdk/kernel/CapabilityRuntimeManager';
import { ICapabilityManifest } from '@/sdk/types';
import { LucideActivity, LucideBox, LucideCheckCircle, LucideAlertCircle, LucidePauseCircle, LucideTerminal, LucideBrain } from 'lucide-react';

export default function CapabilityInspector() {
  const [manifests, setManifests] = useState<ICapabilityManifest[]>([]);
  const [statuses, setStatuses] = useState<ICapabilityStatus[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // In a real app we'd subscribe to changes
    setManifests(CapabilityRegistry.getAllManifests());
    setStatuses(CapabilityRuntimeManager.getAllStatuses());
  }, []);

  const selectedManifest = manifests.find(m => m.id === selectedId);
  const selectedStatus = statuses.find(s => s.id === selectedId);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <LucideActivity className="text-blue-400" />
          <h2 className="text-lg font-semibold">Capability Inspector</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {manifests.map(manifest => {
            const status = statuses.find(s => s.id === manifest.id);
            const isSelected = selectedId === manifest.id;
            
            return (
              <button 
                key={manifest.id}
                onClick={() => setSelectedId(manifest.id)}
                className={`w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors ${isSelected ? 'bg-gray-800 border border-gray-700' : 'hover:bg-gray-800/50 border border-transparent'}`}
              >
                <div className={`p-2 rounded-lg bg-gray-800 text-gray-400`}>
                  <LucideBox size={18} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium text-sm truncate">{manifest.displayName || manifest.name}</div>
                  <div className="text-xs text-gray-500 font-mono truncate">{manifest.id} v{manifest.version}</div>
                </div>
                <div>
                  {status?.state === 'Healthy' && <LucideCheckCircle size={16} className="text-green-500" />}
                  {status?.state === 'Degraded' && <LucideAlertCircle size={16} className="text-amber-500" />}
                  {status?.state === 'Paused' && <LucidePauseCircle size={16} className="text-gray-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {!selectedManifest ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <LucideTerminal size={48} className="mb-4 opacity-50" />
            <p>Select a capability to inspect its runtime state and manifest contract.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-start justify-between border-b border-gray-800 pb-6">
              <div>
                <h1 className="text-3xl font-bold">{selectedManifest.displayName || selectedManifest.name}</h1>
                <p className="text-gray-400 mt-2">{selectedManifest.description}</p>
                <div className="flex gap-2 mt-4">
                  <span className="px-2 py-1 rounded text-xs font-mono bg-blue-900/30 text-blue-400 border border-blue-900/50">
                    {selectedManifest.category}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-mono bg-purple-900/30 text-purple-400 border border-purple-900/50">
                    {selectedManifest.verificationLevel || 'Experimental'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                  selectedStatus?.state === 'Healthy' ? 'bg-green-950 border-green-900 text-green-400' : 
                  'bg-gray-900 border-gray-700 text-gray-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${selectedStatus?.state === 'Healthy' ? 'bg-green-500' : 'bg-gray-500'}`} />
                  {selectedStatus?.state || 'Unknown'}
                </div>
                <div className="mt-2 text-xs text-gray-500 font-mono">
                  v{selectedManifest.version}
                </div>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-6">
              {/* Metrics */}
              <div className="col-span-3 grid grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">AI Calls</div>
                  <div className="text-2xl font-semibold">{selectedStatus?.metrics.aiCalls || 0}</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">Errors</div>
                  <div className="text-2xl font-semibold">{selectedStatus?.metrics.errors || 0}</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">Avg Response</div>
                  <div className="text-2xl font-semibold">{selectedStatus?.metrics.averageResponseTime || 0}ms</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">CPU Time</div>
                  <div className="text-2xl font-semibold">{selectedStatus?.metrics.cpuTime || 0}ms</div>
                </div>
              </div>

              {/* Dependencies */}
              <div className="col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Dependencies</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-2">Kernel Services</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedManifest.kernelServices?.map(s => (
                        <span key={s} className="px-2 py-1 rounded bg-gray-800 text-xs font-mono">{s}</span>
                      )) || <span className="text-sm text-gray-600">None declared</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-2">Connectors</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedManifest.connectors?.map(s => (
                        <span key={s} className="px-2 py-1 rounded bg-gray-800 text-xs font-mono">{s}</span>
                      )) || <span className="text-sm text-gray-600">None declared</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Tools */}
              <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <LucideBrain className="text-purple-400" size={18} />
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Semantic AI Tools</h3>
                </div>
                
                {selectedManifest.tools && selectedManifest.tools.length > 0 ? (
                  <div className="space-y-3">
                    {selectedManifest.tools.map(tool => (
                      <div key={tool.id} className="p-3 bg-gray-950 border border-gray-800 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="font-mono text-sm text-blue-300">{tool.name}</div>
                          <div className="flex gap-1">
                            {tool.capabilities?.map(c => (
                              <span key={c} className="px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400 border border-purple-900/50 text-[10px] uppercase tracking-wide">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{tool.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No AI tools registered.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
