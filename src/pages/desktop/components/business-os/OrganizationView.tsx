import React from 'react';
import { useState, useEffect } from 'react';
import type { OSTemplate } from '../../../../data/os-templates';
import { Loader2, Building2, Sparkles, Package, Plus } from 'lucide-react';

const OrganizationView = ({ template }: { template: OSTemplate }) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate actual organization map from SDK Registry
    const registry = (window as any).__CHATR_SDK_REGISTRY__ || {};
    const deptsMap: Record<string, any> = {};

    Object.keys(registry).forEach(pkgId => {
      const [domain] = pkgId.split('.');
      if (!domain) return;

      if (!deptsMap[domain]) {
        deptsMap[domain] = {
          id: domain,
          name: domain,
          status: 'healthy',
          agents: 0,
          packages: 0
        };
      }
      deptsMap[domain].packages += 1;
      if (registry[pkgId].agents) {
        deptsMap[domain].agents += registry[pkgId].agents.length;
      }
    });

    setDepartments(Object.values(deptsMap));
    setLoading(false);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-[#09090b] h-full relative" style={{ scrollbarWidth: 'none' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-display font-extrabold text-white tracking-tight">Organization Structure</h1>
          <p className="text-secondary text-zinc-400 mt-2">Manage your departments, packages, and AI agents mapped across the {template.name} semantic object.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 size={32} className="text-indigo-400 animate-spin" />
          </div>
        ) : (
          <LayoutEngine workspaceType="dashboard" className="mb-0">
            {departments.map(dept => (
              <div key={dept.id} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-full group hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Building2 size={18} className="text-zinc-300 group-hover:text-white transition-colors" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${dept.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {(dept.status || 'healthy').toUpperCase()}
                  </span>
                </div>
                <h3 className="text-section font-bold text-white mb-6">{dept.name}</h3>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-secondary text-zinc-400">
                      <Sparkles size={14} className="text-indigo-400" /> Active Agents
                    </div>
                    <span className="font-bold text-white">{dept.agents || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-secondary text-zinc-400">
                      <Package size={14} className="text-zinc-500" /> Packages Installed
                    </div>
                    <span className="font-bold text-white">{dept.packages || 0}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Placeholder for Add Department */}
            <div className="bg-zinc-900/20 border-2 border-dashed border-zinc-800/80 rounded-2xl p-6 flex flex-col items-center justify-center h-full hover:bg-zinc-900/40 hover:border-zinc-700 transition-colors cursor-pointer group min-h-[250px]">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
                <Plus size={20} className="text-zinc-400 group-hover:text-white" />
              </div>
              <h3 className="text-secondary font-bold text-zinc-400 group-hover:text-white">Add Department</h3>
            </div>
          </LayoutEngine>
        )}
      </div>
    </div>
  );
};

export { OrganizationView };
