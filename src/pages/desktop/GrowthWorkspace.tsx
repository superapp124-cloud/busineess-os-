import React, { useEffect, useState } from 'react';
import { useTenant } from '@/core/tenant/TenantContext';
import { LucideTrendingUp, LucideBrain, LucideTarget, LucideBarChart, LucideZap } from 'lucide-react';
import { growthRepo, IGrowthCampaign } from '@/capabilities/growth/GrowthRepository';
import { PageLoader } from '@/components/PageLoader';

export default function GrowthWorkspace() {
  const { activeOrganization } = useTenant();
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<IGrowthCampaign[]>([]);

  useEffect(() => {
    if (!activeOrganization) return;
    
    const load = async () => {
      setLoading(true);
      try {
        const [brief, camps] = await Promise.all([
          growthRepo.getExecutiveBriefing(activeOrganization.id),
          growthRepo.list({ org_id: activeOrganization.id })
        ]);
        setBriefing(brief);
        setCampaigns(camps);
      } catch (e) {
        console.error('Failed to load GrowthOS', e);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [activeOrganization]);

  if (loading) return <PageLoader message="Initializing GrowthOS..." />;

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <LucideTrendingUp className="text-purple-400" />
          <h2 className="text-lg font-semibold">GrowthOS</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button className="w-full text-left px-3 py-2 rounded bg-purple-900/30 text-purple-400 border border-purple-900/50 flex items-center gap-2">
            <LucideTarget size={16} />
            <span>Executive Briefing</span>
          </button>
          <button className="w-full text-left px-3 py-2 rounded text-gray-400 hover:bg-gray-800 flex items-center gap-2">
            <LucideBrain size={16} />
            <span>Brand Brain</span>
          </button>
          <button className="w-full text-left px-3 py-2 rounded text-gray-400 hover:bg-gray-800 flex items-center gap-2">
            <LucideZap size={16} />
            <span>Content Factory</span>
          </button>
          <button className="w-full text-left px-3 py-2 rounded text-gray-400 hover:bg-gray-800 flex items-center gap-2">
            <LucideBarChart size={16} />
            <span>Revenue Attribution</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header className="flex justify-between items-end border-b border-gray-800 pb-6">
            <div>
              <h1 className="text-3xl font-bold">Good afternoon.</h1>
              <p className="text-gray-400 mt-2">Here is your Growth Intelligence briefing for today.</p>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium">
              <LucideBrain size={18} />
              AI Growth Planner
            </button>
          </header>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-sm text-gray-400 mb-1">Revenue Trend</div>
              <div className="text-3xl font-semibold text-green-400">{briefing?.revenueTrend}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-sm text-gray-400 mb-1">Pipeline Health</div>
              <div className="text-3xl font-semibold">{briefing?.pipelineHealth}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-sm text-gray-400 mb-1">Active Campaigns</div>
              <div className="text-3xl font-semibold">{briefing?.activeCampaigns}</div>
            </div>
          </div>

          {/* AI Recommended Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <LucideZap className="text-amber-400" size={20} />
              Recommended Actions
            </h2>
            <div className="space-y-3">
              {briefing?.recommendedActions?.map((action: any) => (
                <div key={action.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                  <div className="font-medium">{action.text}</div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm">Dismiss</button>
                    <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm">Execute</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaigns */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Strategic Campaigns</h2>
            {campaigns.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
                No campaigns running. Use the AI Growth Planner to translate a business goal into a strategy.
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map(c => (
                  <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-gray-500">{c.objective}</div>
                    </div>
                    <div className="text-sm px-2 py-1 rounded bg-gray-800 text-gray-300">
                      {c.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
