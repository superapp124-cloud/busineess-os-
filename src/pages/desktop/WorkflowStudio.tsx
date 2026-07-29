import React, { useState } from 'react';
import { LucideWorkflow, LucideTarget, LucideMegaphone, LucideScale, LucideCheckSquare, LucideSend, LucidePlus, LucideSettings } from 'lucide-react';
import { PageLoader } from '@/components/PageLoader';

export default function WorkflowStudio() {
  const [activeWorkflow, setActiveWorkflow] = useState('New Campaign Workflow');

  // Business Concept Nodes mapping over technical IEM nodes
  const nodes = [
    { id: '1', title: 'Business Goal', icon: <LucideTarget size={18} className="text-purple-400" />, subtitle: 'Intent Definition' },
    { id: '2', title: 'Generate Campaign', icon: <LucideMegaphone size={18} className="text-blue-400" />, subtitle: 'GrowthOS' },
    { id: '3', title: 'Legal Review', icon: <LucideScale size={18} className="text-amber-400" />, subtitle: 'LegalOS (Risk Check)' },
    { id: '4', title: 'Director Approval', icon: <LucideCheckSquare size={18} className="text-green-400" />, subtitle: 'Human in loop' },
    { id: '5', title: 'Publish & Notify', icon: <LucideSend size={18} className="text-pink-400" />, subtitle: 'EventMesh' }
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LucideWorkflow className="text-blue-400" />
            <h2 className="text-lg font-semibold">Workflow Studio</h2>
          </div>
          <button className="text-gray-400 hover:text-white"><LucidePlus size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">My Workflows</div>
          <button className="w-full text-left px-3 py-2 rounded bg-blue-900/30 text-blue-400 border border-blue-900/50">
            {activeWorkflow}
          </button>
          <button className="w-full text-left px-3 py-2 rounded text-gray-400 hover:bg-gray-800">
            Employee Onboarding
          </button>
          <button className="w-full text-left px-3 py-2 rounded text-gray-400 hover:bg-gray-800">
            Contract Negotiation
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative bg-[#0a0a0a]">
        
        {/* Canvas Header */}
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-gray-950 to-transparent z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <h1 className="text-xl font-bold">{activeWorkflow}</h1>
            <p className="text-gray-400 text-sm">Translates to Intent Execution Model (IEM)</p>
          </div>
          <div className="flex gap-3 pointer-events-auto">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md font-medium text-sm flex items-center gap-2">
              <LucideSettings size={16} /> Configure
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium text-sm">
              Save & Deploy
            </button>
          </div>
        </header>

        {/* Mock React-Flow Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-20 overflow-y-auto"
             style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1f2937 1px, transparent 0)', backgroundSize: '40px 40px' }}>
          
          <div className="space-y-8 flex flex-col items-center mt-20">
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                {/* Node */}
                <div className="w-72 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl hover:border-blue-500 cursor-pointer transition-colors group relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-center">
                      {node.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-100">{node.title}</div>
                      <div className="text-xs text-gray-500">{node.subtitle}</div>
                    </div>
                  </div>
                  
                  {/* Floating settings gear */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white">
                    <LucideSettings size={14} />
                  </div>
                </div>

                {/* Edge/Connector */}
                {index < nodes.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-700 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-b-2 border-gray-700 rotate-45" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
