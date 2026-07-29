import React, { useState } from 'react';
import { LucideShoppingBag, LucideBox, LucideZap, LucideSettings, LucideBookOpen, LucideCpu, LucideLayers, LucideDownload, LucideCheckCircle, LucideShieldCheck } from 'lucide-react';

type MarketplaceCategory = 'Capabilities' | 'Connectors' | 'AI Models' | 'Templates' | 'Workflow Packs' | 'Knowledge Packs' | 'Automation Packs';

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory>('Capabilities');

  const categories: { name: MarketplaceCategory, icon: React.ReactNode, count: number }[] = [
    { name: 'Capabilities', icon: <LucideBox size={16} />, count: 12 },
    { name: 'Connectors', icon: <LucideZap size={16} />, count: 45 },
    { name: 'AI Models', icon: <LucideCpu size={16} />, count: 8 },
    { name: 'Templates', icon: <LucideLayers size={16} />, count: 24 },
    { name: 'Workflow Packs', icon: <LucideSettings size={16} />, count: 15 },
    { name: 'Knowledge Packs', icon: <LucideBookOpen size={16} />, count: 6 },
    { name: 'Automation Packs', icon: <LucideSettings size={16} />, count: 19 },
  ];

  const items = [
    { id: '1', name: 'FinanceOS', provider: 'CHATR Kernel', category: 'Capabilities', rating: 4.9, installs: '12k', certified: true, desc: 'Complete AR/AP, Payroll, and Ledger management.' },
    { id: '2', name: 'LegalOS', provider: 'CHATR Kernel', category: 'Capabilities', rating: 4.8, installs: '8k', certified: true, desc: 'High-risk contract generation and compliance tracking.' },
    { id: '3', name: 'GrowthOS', provider: 'CHATR Kernel', category: 'Capabilities', rating: 4.9, installs: '15k', certified: true, desc: 'AI-driven campaign and pipeline generation.' },
    { id: '4', name: 'Salesforce Sync', provider: 'Third Party', category: 'Connectors', rating: 4.2, installs: '45k', certified: false, desc: 'Two-way sync with Salesforce CRM objects.' },
    { id: '5', name: 'GPT-4o Reasoning', provider: 'OpenAI', category: 'AI Models', rating: 5.0, installs: '120k', certified: true, desc: 'Advanced reasoning model for complex Intent planning.' },
    { id: '6', name: 'B2B SaaS Onboarding', provider: 'CHATR Labs', category: 'Workflow Packs', rating: 4.7, installs: '3k', certified: true, desc: 'IEM Workflow graph for enterprise client onboarding.' },
  ];

  const filteredItems = items.filter(i => i.category === activeCategory);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <LucideShoppingBag className="text-blue-400" />
          <h2 className="text-lg font-semibold">Ecosystem</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {categories.map(cat => (
            <button 
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${
                activeCategory === cat.name ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' : 'text-gray-400 hover:bg-gray-800 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                {cat.icon}
                <span>{cat.name}</span>
              </div>
              <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <header className="border-b border-gray-800 pb-6">
            <h1 className="text-3xl font-bold">{activeCategory}</h1>
            <p className="text-gray-400 mt-2">Discover, install, and manage {activeCategory.toLowerCase()} for your workspace.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {item.name}
                      {item.certified && (
                        <span title="CHATR Certified (Passed Manifest, RLS & AI Governance Checks)">
                          <LucideShieldCheck size={16} className="text-green-400" />
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{item.provider}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                    <LucideBox className="text-gray-400" size={20} />
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 flex-1 mb-6">
                  {item.desc}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">★ {item.rating}</span>
                    <span className="flex items-center gap-1"><LucideDownload size={12} /> {item.installs}</span>
                  </div>
                  <button className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors">
                    Install
                  </button>
                </div>
              </div>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-500">
                No items found in this category.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
