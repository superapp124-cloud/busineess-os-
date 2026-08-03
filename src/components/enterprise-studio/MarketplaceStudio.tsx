import React, { useState } from 'react';
import {
  Package, Download, CheckCircle2, Search, Zap, Shield,
  Stethoscope, Users, Briefcase, Award, Sparkles, Star
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface IndustryPack {
  id: string;
  name: string;
  category: string;
  version: string;
  description: string;
  workflowsCount: number;
  installed: boolean;
  rating: number;
  icon: React.ReactNode;
}

const SAMPLE_PACKS: IndustryPack[] = [
  {
    id: 'pack_hc',
    name: 'Healthcare & Clinical Intelligence Pack',
    category: 'Healthcare',
    version: 'v2.4.0',
    description: 'Prescription analysis, drug interaction safety (WHO ATC), pathology recommendations, care plans, and FHIR EHR connectors.',
    workflowsCount: 10,
    installed: true,
    rating: 4.9,
    icon: <Stethoscope className="w-5 h-5 text-rose-400" />,
  },
  {
    id: 'pack_talent',
    name: 'Talent & ATS Recruitment Pack',
    category: 'HR & Talent',
    version: 'v3.1.0',
    description: 'Resume parser, ATS scoring engine, skill match vectorizer, interview panel scheduler, salary benchmark, and BGV triggers.',
    workflowsCount: 8,
    installed: true,
    rating: 4.8,
    icon: <Users className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: 'pack_fin',
    name: 'SAP & Oracle Finance Operations Pack',
    category: 'Finance',
    version: 'v4.0.2',
    description: 'Vendor invoice 3-way matching, PO approval, tax AIS/26AS reconciliation, payroll validation, and ERP ledger connectors.',
    workflowsCount: 10,
    installed: true,
    rating: 5.0,
    icon: <Award className="w-5 h-5 text-amber-400" />,
  },
  {
    id: 'pack_legal',
    name: 'Legal Review & Compliance Pack',
    category: 'Legal',
    version: 'v1.8.0',
    description: 'Contract review, §7.3 liability clause risk scoring, NDA auto-redline, SLA validation, and DocuSign workflow integration.',
    workflowsCount: 8,
    installed: true,
    rating: 4.7,
    icon: <Briefcase className="w-5 h-5 text-violet-400" />,
  },
  {
    id: 'pack_sc',
    name: 'Supply Chain & Procurement Pack',
    category: 'Supply Chain',
    version: 'v2.0.1',
    description: 'Vendor registration, risk assessment, purchase requisition, goods receipt inspection, and reorder triggers.',
    workflowsCount: 8,
    installed: false,
    rating: 4.6,
    icon: <Package className="w-5 h-5 text-blue-400" />,
  },
  {
    id: 'pack_it',
    name: 'IT Operations & Incident Management Pack',
    category: 'IT Ops',
    version: 'v1.5.0',
    description: 'PagerDuty incident triage, Okta role access provisioning, CAB change approval, and vulnerability review.',
    workflowsCount: 10,
    installed: false,
    rating: 4.9,
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
  },
];

export const MarketplaceStudio: React.FC<Props> = ({ isOpen, onClose }) => {
  const [packs, setPacks] = useState<IndustryPack[]>(SAMPLE_PACKS);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleInstall = (id: string) => {
    setPacks(prev =>
      prev.map(p => p.id === id ? { ...p, installed: !p.installed } : p)
    );
  };

  const filteredPacks = packs.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 text-slate-100 font-sans flex flex-col backdrop-blur-md animate-in fade-in duration-200">

      {/* Top Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Enterprise Automation Marketplace</h2>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CER v2.0 Industry Packs
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Zero-Code Enterprise Knowledge & Workflow Automation Packs</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 pl-8 pr-3 py-1.5 rounded-lg text-xs w-56 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
          >
            Close ⌘ESC
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2 inline-block">
                PLUG-AND-PLAY ENTERPRISE PACKS
              </span>
              <h3 className="text-lg font-bold text-white">50 Golden Reference Workflows Ready Out-Of-The-Box</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Install pre-configured Industry Packs containing Canonical Objects, Inference Plugins, Knowledge Embeddings, Policies, and Connectors.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          {/* Packs Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredPacks.map(pack => (
              <div key={pack.id} className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-lg transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      {pack.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{pack.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono text-slate-400">{pack.version}</span>
                        <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-900">
                          {pack.workflowsCount} Workflows
                        </span>
                        <div className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {pack.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{pack.description}</p>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] text-slate-500 font-mono">Verified CER Pack</span>
                  <button
                    onClick={() => handleInstall(pack.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      pack.installed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                    }`}
                  >
                    {pack.installed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Installed
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" /> Install Pack
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
