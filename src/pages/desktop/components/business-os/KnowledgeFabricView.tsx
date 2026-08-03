import React, { useState, useEffect } from 'react';
import type { OSTemplate } from '../../../../data/os-templates';
import { Loader2, Database, FileText, Users, FolderOpen } from 'lucide-react';

const KnowledgeFabricView = ({ template }: { template: OSTemplate }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate live knowledge stats from the SDK objects
    const registry = (window as any).__CHATR_SDK_REGISTRY__ || {};
    let docs = 0;
    
    Object.keys(registry).forEach(pkgId => {
      const sdk = registry[pkgId];
      if (sdk.objects) {
        sdk.objects.forEach((obj: any) => {
          const records = BusinessObjectStore.list(pkgId, obj.name);
          docs += records.length;
        });
      }
    });

    setStats({
      indexedDocuments: docs,
      vectorEmbeddings: docs * 15, // Mock average embeddings per doc
      integrations: [
        { name: 'Google Workspace', desc: 'Drive, Docs, Sheets', type: 'google', status: 'Connected' },
        { name: 'Slack', desc: 'Channels and DMs', type: 'slack', status: 'Connected' },
        { name: 'Notion', desc: 'Team Wikis', type: 'notion', status: 'Active' },
        { name: 'Local File System', desc: 'Desktop Sync', type: 'local', status: 'Disconnected' }
      ]
    });
    setLoading(false);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-[#09090b] h-full relative" style={{ scrollbarWidth: 'none' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-display font-extrabold text-white tracking-tight">Enterprise Knowledge Fabric</h1>
          <p className="text-secondary text-zinc-400 mt-2">Connect your data sources. The AI Semantic Engine will automatically index and map these to the {template.name} graph.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 size={32} className="text-indigo-400 animate-spin" />
          </div>
        ) : (
          <>
            <LayoutEngine workspaceType="dashboard" className="mb-10">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl">
                <div className="text-display font-extrabold text-white mb-1">{stats?.indexedDocuments?.toLocaleString() || 0}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Indexed Documents</div>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl">
                <div className="text-display font-extrabold text-white mb-1">{stats?.vectorEmbeddings?.toLocaleString() || 0}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Vector Embeddings</div>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl">
                <div className="text-display font-extrabold text-emerald-400 mb-1">Active</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Sync Status</div>
              </div>
            </LayoutEngine>

            <h2 className="text-label font-bold text-zinc-500 uppercase tracking-widest mb-4">Semantic Graph Nodes</h2>
            <div className="flex flex-wrap gap-3 mb-12">
              {template.superintendent.knowledgeGraph.map(node => (
                <div key={node} className="px-4 py-2 bg-indigo-500/10 text-indigo-300 font-medium rounded-xl border border-indigo-500/20 flex items-center gap-2">
                  <Database size={14} /> {node}
                </div>
              ))}
              <div className="px-4 py-2 bg-zinc-900/50 text-zinc-400 font-medium rounded-xl border border-zinc-800 border-dashed cursor-pointer hover:text-white transition-colors">
                + Add Custom Node
              </div>
            </div>

            <h2 className="text-label font-bold text-zinc-500 uppercase tracking-widest mb-4">Data Integrations</h2>
            <div className="grid grid-cols-2 gap-4">
              {(stats?.integrations || []).map((int: any) => (
                <div key={int.name} className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                      {int.type === 'google' && <Database size={20} className="text-blue-400" />}
                      {int.type === 'notion' && <FileText size={20} className="text-white" />}
                      {int.type === 'slack' && <Users size={20} className="text-rose-400" />}
                      {int.type === 'local' && <FolderOpen size={20} className="text-emerald-400" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-secondary">{int.name}</h3>
                      <p className="text-label text-zinc-500 mt-0.5">{int.desc}</p>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-xl text-label font-bold transition-colors ${int.status === 'Connected' || int.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                    {int.status}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { KnowledgeFabricView };
