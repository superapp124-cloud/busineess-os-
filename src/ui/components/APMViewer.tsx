import React, { useState, useEffect } from 'react';

export const APMViewer: React.FC = () => {
  const [traces, setTraces] = useState<any[]>([]);

  useEffect(() => {
    // Mock connecting to the MetricsExporter
    const mockTraces = [
      { id: 'span-1', name: 'Inference.evaluate(ArtifactObserved)', duration: 120, children: [
        { id: 'span-2', name: 'Plugin.RiskAnalyzer', duration: 45, hypothesesCount: 1 },
        { id: 'span-3', name: 'Plugin.ComplianceChecker', duration: 50, error: null },
      ]},
      { id: 'span-4', name: 'Inference.resolveConflicts', duration: 15, children: [] }
    ];
    setTraces(mockTraces);
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
        Live APM Telemetry
      </h3>
      <div className="space-y-3 font-mono text-sm text-gray-300">
        {traces.map(trace => (
          <div key={trace.id} className="bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-400 font-bold">{trace.name}</span>
              <span className="text-yellow-500">{trace.duration}ms</span>
            </div>
            {trace.children.length > 0 && (
              <div className="pl-4 border-l border-white/10 space-y-2 mt-2">
                {trace.children.map((child: any) => (
                  <div key={child.id} className="flex justify-between">
                    <span className="text-gray-400">├─ {child.name}</span>
                    <span className="text-yellow-500/70">{child.duration}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
