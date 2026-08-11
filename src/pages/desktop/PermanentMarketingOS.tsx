/**
 * CHATR Permanent Marketing OS — Execution Control Layer
 * 
 * The ONLY new tooling built for the ₹0 Marketing Engine.
 * 4 tabs: Content Calendar, Distribution Queue, Partnership Pipeline, Growth KPIs.
 * 
 * Founder Authority: Sanobar Jahan
 * Philosophy: "Create one permanent knowledge asset per week and multiply it everywhere."
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  ListTodo, 
  Handshake, 
  BarChart3, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  Activity,
  Search,
  MousePointerClick,
  DollarSign
} from 'lucide-react';

// --- Types ---

type TabType = 'calendar' | 'queue' | 'pipeline' | 'kpis';

interface DistributionItem {
  id: string;
  platform: string;
  status: 'pending' | 'draft' | 'scheduled' | 'published' | 'failed';
}

interface ResearchAsset {
  id: string;
  week: number;
  title: string;
  status: 'Research' | 'Draft' | 'AI Adapted' | 'Human Approved' | 'Published';
  founder: string;
  createdAt: string;
  distributions: DistributionItem[];
}

interface QueueItem {
  id: string;
  title: string;
  platform: string;
  status: 'Draft' | 'AI Generated' | 'Human Approved' | 'Published' | 'Failed';
  createdAt: string;
  author: string;
}

interface Prospect {
  id: string;
  orgName: string;
  vertical: 'Recruitment' | 'Real Estate' | 'Education';
  stage: 'Prospect' | 'Contacted' | 'Replied' | 'Demo' | 'Pilot' | 'Active' | 'Case Study';
  contactPerson: string;
  lastActivity: string;
  notes: string;
}

interface KPITier {
  name: string;
  color: string;
  metrics: { name: string; value: string | number; target?: string | number }[];
}

// --- Seed Data ---

const INITIAL_ASSETS: ResearchAsset[] = [
  {
    id: 'a1',
    week: 1,
    title: 'Why Indian Recruitment Agencies Lose Candidates on WhatsApp',
    status: 'Research',
    founder: 'Sanobar Jahan',
    createdAt: '2026-08-10',
    distributions: [
      { id: 'd1', platform: 'Article', status: 'pending' },
      { id: 'd2', platform: 'LinkedIn (1/5)', status: 'pending' },
      { id: 'd3', platform: 'LinkedIn (2/5)', status: 'pending' },
      { id: 'd4', platform: 'LinkedIn (3/5)', status: 'pending' },
      { id: 'd5', platform: 'LinkedIn (4/5)', status: 'pending' },
      { id: 'd6', platform: 'LinkedIn (5/5)', status: 'pending' },
      { id: 'd7', platform: 'Facebook (1/3)', status: 'pending' },
      { id: 'd8', platform: 'Facebook (2/3)', status: 'pending' },
      { id: 'd9', platform: 'Facebook (3/3)', status: 'pending' },
      { id: 'd10', platform: 'X (1/3)', status: 'pending' },
      { id: 'd11', platform: 'X (2/3)', status: 'pending' },
      { id: 'd12', platform: 'X (3/3)', status: 'pending' },
      { id: 'd13', platform: 'Reddit', status: 'pending' },
      { id: 'd14', platform: 'YouTube', status: 'pending' },
      { id: 'd15', platform: 'Shorts (1/3)', status: 'pending' },
      { id: 'd16', platform: 'Shorts (2/3)', status: 'pending' },
      { id: 'd17', platform: 'Shorts (3/3)', status: 'pending' },
      { id: 'd18', platform: 'WhatsApp', status: 'pending' },
      { id: 'd19', platform: 'Telegram', status: 'pending' },
      { id: 'd20', platform: 'Mumbai Edition', status: 'pending' },
      { id: 'd21', platform: 'Delhi Edition', status: 'pending' },
      { id: 'd22', platform: 'Bangalore Edition', status: 'pending' },
    ]
  }
];

const INITIAL_QUEUE: QueueItem[] = [
  { id: 'q1', title: 'WhatsApp drop-off stats', platform: 'LinkedIn', status: 'Draft', createdAt: '2026-08-11', author: 'Sanobar Jahan' },
  { id: 'q2', title: 'Why WhatsApp is better than Email for recruiting', platform: 'X', status: 'AI Generated', createdAt: '2026-08-11', author: 'AI Agent' },
  { id: 'q3', title: 'Recruitment WhatsApp templates', platform: 'LinkedIn', status: 'Human Approved', createdAt: '2026-08-10', author: 'Sanobar Jahan' },
  { id: 'q4', title: 'Full Guide to WhatsApp Recruiting', platform: 'Article', status: 'Draft', createdAt: '2026-08-11', author: 'Sanobar Jahan' },
];

const INITIAL_PROSPECTS: Prospect[] = [
  { id: 'p1', orgName: 'TechTalent India', vertical: 'Recruitment', stage: 'Replied', contactPerson: 'Rahul Sharma', lastActivity: '2026-08-10', notes: 'Interested in WhatsApp bulk messaging.' },
  { id: 'p2', orgName: 'Metro Properties', vertical: 'Real Estate', stage: 'Demo', contactPerson: 'Priya Patel', lastActivity: '2026-08-09', notes: 'Needs CRM integration.' },
  { id: 'p3', orgName: 'EduSmart Academy', vertical: 'Education', stage: 'Prospect', contactPerson: 'Amit Kumar', lastActivity: '2026-08-11', notes: 'Found via LinkedIn post.' },
  { id: 'p4', orgName: 'Global Hire', vertical: 'Recruitment', stage: 'Pilot', contactPerson: 'Neha Singh', lastActivity: '2026-08-08', notes: 'Testing with 5 recruiters.' },
  { id: 'p5', orgName: 'Horizon Homes', vertical: 'Real Estate', stage: 'Contacted', contactPerson: 'Vikram Reddy', lastActivity: '2026-08-11', notes: 'Follow up next week.' },
];

// --- Main Component ---

export default function PermanentMarketingOS() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');

  const [assets, setAssets] = useState<ResearchAsset[]>(INITIAL_ASSETS);
  const [expandedAssetIds, setExpandedAssetIds] = useState<Set<string>>(new Set(['a1']));
  
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);

  const toggleAssetExpansion = (id: string) => {
    setExpandedAssetIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const renderSidebar = () => {
    const navItems = [
      { id: 'calendar' as TabType, label: 'Content Calendar', icon: Calendar },
      { id: 'queue' as TabType, label: 'Distribution Queue', icon: ListTodo },
      { id: 'pipeline' as TabType, label: 'Partnership Pipeline', icon: Handshake },
      { id: 'kpis' as TabType, label: 'Growth KPIs', icon: BarChart3 },
    ];

    return (
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-sm">₹0</span>
            Marketing OS
          </h2>
          <p className="text-xs text-gray-400 mt-2">Execution Control Layer</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-purple-600/10 text-purple-400' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center text-purple-300 font-bold text-sm">
              SJ
            </div>
            <div>
              <p className="text-sm font-medium text-white">Sanobar Jahan</p>
              <p className="text-xs text-gray-400">Founder Authority</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContentCalendar = () => {
    return (
      <div className="flex-1 overflow-auto bg-gray-950 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
            <p className="text-gray-400 mt-1">Track research assets and their distribution cascade.</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Research Asset
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-gray-800/50 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Week</th>
                <th className="px-6 py-4 font-medium w-1/3">Research Asset</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Founder</th>
                <th className="px-6 py-4 font-medium">Distribution</th>
                <th className="px-6 py-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => {
                const isExpanded = expandedAssetIds.has(asset.id);
                const distributedCount = asset.distributions.filter(d => d.status === 'published').length;
                const totalDistributions = asset.distributions.length;

                return (
                  <React.Fragment key={asset.id}>
                    <tr 
                      className="border-b border-gray-800 hover:bg-gray-800/20 cursor-pointer"
                      onClick={() => toggleAssetExpansion(asset.id)}
                    >
                      <td className="px-6 py-4 flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                        <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">W{asset.week}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{asset.title}</td>
                      <td className="px-6 py-4">
                        <span className="bg-purple-900/30 text-purple-400 border border-purple-800 px-2.5 py-1 rounded-full text-xs">
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{asset.founder}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-800 rounded-full h-1.5 max-w-[60px]">
                            <div 
                              className="bg-purple-500 h-1.5 rounded-full" 
                              style={{ width: `${(distributedCount / totalDistributions) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400">{distributedCount}/{totalDistributions}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{asset.createdAt}</td>
                    </tr>
                    
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="px-0 py-0 border-b border-gray-800 bg-gray-900/50">
                          <div className="px-14 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {asset.distributions.map(dist => (
                              <div key={dist.id} className="flex items-center gap-2 text-sm text-gray-400">
                                {dist.status === 'published' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-600" />
                                )}
                                <span>{dist.platform}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDistributionQueue = () => {
    const columns = ['Draft', 'AI Generated', 'Human Approved', 'Published', 'Failed'];
    
    return (
      <div className="flex-1 overflow-auto bg-gray-950 p-8 flex flex-col">
        <div className="flex justify-between items-center mb-8 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-white">Distribution Queue</h1>
            <p className="text-gray-400 mt-1">Kanban board for content moving through the pipeline.</p>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {columns.map(col => {
            const columnItems = queue.filter(item => item.status === col);
            return (
              <div key={col} className="w-80 flex-shrink-0 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-300 text-sm uppercase tracking-wider">{col}</h3>
                  <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                    {columnItems.length}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3 flex-1">
                  {columnItems.map(item => (
                    <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          {item.platform}
                        </span>
                        <button className="text-gray-500 hover:text-gray-300">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-white font-medium mb-3 line-clamp-2">{item.title}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{item.author}</span>
                        <span>{item.createdAt}</span>
                      </div>
                    </div>
                  ))}
                  {columnItems.length === 0 && (
                    <div className="border-2 border-dashed border-gray-800 rounded-lg h-24 flex items-center justify-center text-sm text-gray-600">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPartnershipPipeline = () => {
    const stages = ['Prospect', 'Contacted', 'Replied', 'Demo', 'Pilot', 'Active', 'Case Study'];
    
    const getVerticalColor = (vertical: string) => {
      switch (vertical) {
        case 'Recruitment': return 'bg-blue-900/30 text-blue-400 border-blue-800';
        case 'Real Estate': return 'bg-green-900/30 text-green-400 border-green-800';
        case 'Education': return 'bg-amber-900/30 text-amber-400 border-amber-800';
        default: return 'bg-gray-800 text-gray-300 border-gray-700';
      }
    };

    return (
      <div className="flex-1 overflow-auto bg-gray-950 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Partnership Pipeline</h1>
            <p className="text-gray-400 mt-1">CRM for tracking platform partnerships and integrations.</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Prospect
          </button>
        </div>

        {/* Funnel Summary */}
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
          {stages.map((stage, idx) => {
            const count = prospects.filter(p => p.stage === stage).length;
            return (
              <div key={stage} className={`flex-1 text-center ${idx !== stages.length - 1 ? 'border-r border-gray-800' : ''}`}>
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stage}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-gray-800/50 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Organization</th>
                <th className="px-6 py-4 font-medium">Vertical</th>
                <th className="px-6 py-4 font-medium">Stage</th>
                <th className="px-6 py-4 font-medium">Contact Person</th>
                <th className="px-6 py-4 font-medium">Last Activity</th>
                <th className="px-6 py-4 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {prospects.map(prospect => (
                <tr key={prospect.id} className="hover:bg-gray-800/20">
                  <td className="px-6 py-4 font-medium text-white">{prospect.orgName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs border ${getVerticalColor(prospect.vertical)}`}>
                      {prospect.vertical}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full text-xs">
                      {prospect.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4">{prospect.contactPerson}</td>
                  <td className="px-6 py-4 text-gray-400">{prospect.lastActivity}</td>
                  <td className="px-6 py-4 text-gray-400 truncate max-w-xs">{prospect.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGrowthKPIs = () => {
    const kpiTiers: KPITier[] = [
      {
        name: 'Tier 1: Activity (Controllable)',
        color: 'text-green-400',
        metrics: [
          { name: 'Research assets/week', value: 0, target: 1 },
          { name: 'Articles/week', value: 0, target: 1 },
          { name: 'Founder posts/week', value: 0, target: 5 },
          { name: 'Distribution events', value: 0, target: 50 },
          { name: 'Videos/week', value: 0, target: 3 },
          { name: 'Community contributions/week', value: 0, target: 10 },
          { name: 'Partnership outreach/week', value: 0, target: 20 },
        ]
      },
      {
        name: 'Tier 2: Discovery (Observable)',
        color: 'text-blue-400',
        metrics: [
          { name: 'Google impressions', value: 0 },
          { name: 'Search queries', value: 0 },
          { name: 'Indexed pages (canary 100)', value: 0 },
          { name: 'Referral visits', value: 0 },
          { name: 'Social profile visits', value: 0 },
          { name: 'YouTube views', value: 0 },
        ]
      },
      {
        name: 'Tier 3: Intent (Leading)',
        color: 'text-purple-400',
        metrics: [
          { name: 'Website sessions', value: 0 },
          { name: 'CHATR registrations', value: 0 },
          { name: 'Workflow starts', value: 0 },
          { name: 'WhatsApp conversations', value: 0 },
          { name: 'Referral activations', value: 0 },
          { name: 'Demo requests', value: 0 },
        ]
      },
      {
        name: 'Tier 4: Revenue (Lagging)',
        color: 'text-amber-400',
        metrics: [
          { name: 'Qualified leads', value: 0 },
          { name: 'Paid accounts', value: 0 },
          { name: 'Revenue', value: '₹0' },
          { name: 'CAC', value: '₹0' },
          { name: 'Organic acquisition %', value: '0%' },
        ]
      }
    ];

    const getIconForTier = (idx: number) => {
      switch (idx) {
        case 0: return <Activity className="w-5 h-5 text-green-400" />;
        case 1: return <Search className="w-5 h-5 text-blue-400" />;
        case 2: return <MousePointerClick className="w-5 h-5 text-purple-400" />;
        case 3: return <DollarSign className="w-5 h-5 text-amber-400" />;
        default: return <Activity className="w-5 h-5" />;
      }
    };

    return (
      <div className="flex-1 overflow-auto bg-gray-950 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Growth KPIs</h1>
          <p className="text-gray-400 mt-1">4-tier metrics dashboard tracking the ₹0 Marketing Engine performance.</p>
        </div>

        <div className="space-y-10">
          {kpiTiers.map((tier, idx) => (
            <div key={tier.name}>
              <div className="flex items-center gap-3 mb-4">
                {getIconForTier(idx)}
                <h2 className={`text-lg font-semibold ${tier.color}`}>{tier.name}</h2>
                <div className="h-px flex-1 bg-gray-800 ml-4"></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tier.metrics.map(metric => (
                  <div key={metric.name} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                    <p className="text-sm text-gray-400 mb-2 truncate" title={metric.name}>{metric.name}</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold text-white">{metric.value}</span>
                      {metric.target !== undefined && (
                        <span className="text-xs text-gray-500 mb-1">
                          Target: {metric.target}
                        </span>
                      )}
                      {metric.target === undefined && (
                        <div className="w-12 h-4 bg-gray-800 rounded relative overflow-hidden mb-1">
                          {/* Sparkline placeholder */}
                          <div className="absolute bottom-0 left-0 h-1 bg-gray-700 w-full rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {renderSidebar()}
      
      {activeTab === 'calendar' && renderContentCalendar()}
      {activeTab === 'queue' && renderDistributionQueue()}
      {activeTab === 'pipeline' && renderPartnershipPipeline()}
      {activeTab === 'kpis' && renderGrowthKPIs()}
    </div>
  );
}
