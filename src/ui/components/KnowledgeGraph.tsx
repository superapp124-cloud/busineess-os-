import React from 'react';

export const KnowledgeGraph: React.FC = () => {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-xl font-semibold text-white mb-4">Enterprise Knowledge Fabric</h3>
      <div className="flex-1 bg-black/60 rounded-lg border border-white/5 relative overflow-hidden flex items-center justify-center">
        {/* Mock visual nodes */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-xs text-blue-200">
          Policy A
        </div>
        <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center text-xs text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          Mission Root
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-14 h-14 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-xs text-green-200">
          User 12
        </div>
        
        {/* SVG lines for mock edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
          <line x1="30%" y1="30%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4" />
          <line x1="50%" y1="50%" x2="70%" y2="70%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4" />
        </svg>

        <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-mono">
          Connected to DistributedGraphStore (Neo4j Mock)
        </div>
      </div>
    </div>
  );
};
