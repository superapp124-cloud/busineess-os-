import React, { useEffect, useState } from 'react';
import { useTenant } from '@/core/tenant/TenantContext';
import { LucideScale, LucideFileText, LucideBriefcase, LucideShieldCheck } from 'lucide-react';
import { legalRepo, ILegalContract } from '@/capabilities/legal/LegalRepository';
import { PageLoader } from '@/components/PageLoader';

export default function LegalWorkspace() {
  const { activeOrganization } = useTenant();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<ILegalContract[]>([]);

  useEffect(() => {
    if (!activeOrganization) return;
    
    const load = async () => {
      setLoading(true);
      try {
        const data = await legalRepo.list({ org_id: activeOrganization.id });
        setContracts(data);
      } catch (e) {
        console.error('Failed to load LegalOS', e);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [activeOrganization]);

  if (loading) return <PageLoader message="Initializing LegalOS..." />;

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <LucideScale className="text-blue-400" />
          <h2 className="text-lg font-semibold">LegalOS</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button className="w-full text-left px-3 py-2 rounded bg-blue-900/30 text-blue-400 border border-blue-900/50 flex items-center gap-2">
            <LucideFileText size={16} />
            <span>Contracts</span>
          </button>
          <button className="w-full text-left px-3 py-2 rounded text-gray-400 hover:bg-gray-800 flex items-center gap-2">
            <LucideBriefcase size={16} />
            <span>Case Files</span>
          </button>
          <button className="w-full text-left px-3 py-2 rounded text-gray-400 hover:bg-gray-800 flex items-center gap-2">
            <LucideShieldCheck size={16} />
            <span>Compliance</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header className="flex justify-between items-end border-b border-gray-800 pb-6">
            <div>
              <h1 className="text-3xl font-bold">Contract Repository</h1>
              <p className="text-gray-400 mt-2">Manage obligations, summaries, and approvals.</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium">
              <LucideFileText size={18} />
              New Contract
            </button>
          </header>

          {/* Contracts List */}
          <div>
            {contracts.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
                No contracts found in the repository.
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-800/50 text-gray-400 text-sm">
                    <tr>
                      <th className="p-4 font-medium">Title</th>
                      <th className="p-4 font-medium">Party</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {contracts.map(c => (
                      <tr key={c.id} className="hover:bg-gray-800/30 transition-colors cursor-pointer">
                        <td className="p-4 font-medium">{c.title}</td>
                        <td className="p-4 text-gray-400">{c.party_name}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {c.risk_score ? (
                            <span className={`font-mono ${c.risk_score > 70 ? 'text-red-400' : 'text-green-400'}`}>
                              {c.risk_score}/100
                            </span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
