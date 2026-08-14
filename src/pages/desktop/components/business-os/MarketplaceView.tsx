import React, { useState } from 'react';
import { useEffect } from 'react';
import { Star, Download, Search, Filter, Package, CheckCircle2, X, Loader2, Play, Cpu, Zap, ShieldCheck, Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';
import CATALOG from '../../../../data/capability-catalog';
import { CapabilityInstaller, type IInstallProgress } from '../../../../sdk/CapabilityInstaller';
import { AppConfigModal } from './AppConfigModal';

const CATEGORIES = [
  'All',
  'Installed',
  'Executive & Strategy',
  'CRM & Sales',
  'Marketing',
  'Recruitment & HR',
  'Finance',
  'Operations',
  'Customer Support',
  'Communication',
  'AI & Automation',
  'Enterprise Platform',
];

const MATURITY_COLORS: Record<string, string> = {
  L5: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  L4: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
  L3: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  L2: 'bg-zinc-700 text-zinc-400',
  L1: 'bg-zinc-800 text-zinc-500',
};

const MarketplaceView = ({ installedPackages, onInstall }: { installedPackages: string[], onInstall: (id: string, manifest: any) => void }) => {
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [allPackages, setAllPackages] = useState<any[]>(CATALOG); // ← Load static catalog immediately
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [configPkg, setConfigPkg] = useState<any | null>(null);
  const [previewPkg, setPreviewPkg] = useState<any | null>(null); // Permission Preview Modal state
  const [localInstalled, setLocalInstalled] = useState<string[]>(installedPackages);

  useEffect(() => { setLocalInstalled(installedPackages); }, [installedPackages]);

  // Load live data from server (optional enhancement — catalog works statically without it)
  const filtered = allPackages.filter(pkg => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || pkg.name?.toLowerCase().includes(q) || pkg.description?.toLowerCase().includes(q) || pkg.category?.toLowerCase().includes(q) || (pkg.tags || []).some((t: string) => t.toLowerCase().includes(q));
    const matchesCat = activeCategory === 'All' 
      ? true 
      : activeCategory === 'Installed' 
      ? localInstalled.includes(pkg.id) 
      : pkg.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featured = filtered.filter((p: any) => (p.installs || 0) > 15000);
  const rest = filtered.filter((p: any) => (p.installs || 0) <= 15000);

  const handleConfirmInstall = async (pkg: any) => {
    const id = pkg.id;
    setPreviewPkg(null);
    setInstallingId(id);
    try {
      await onInstall(id, pkg);
      setLocalInstalled(p => [...p, id]);
    } catch (err) { console.error(err); }
    finally { setInstallingId(null); }
  };

  const PackageCard = ({ pkg }: { pkg: any }) => {
    const isInstalled = localInstalled.includes(pkg.id);
    const isInstalling = installingId === pkg.id;
    return (
      <div className="group p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-200 flex flex-col h-full">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center text-page group-hover:scale-105 transition-transform">
              {pkg.icon || '📦'}
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">{pkg.category}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block ${MATURITY_COLORS[pkg.maturity] || MATURITY_COLORS.L3}`}>
                {pkg.maturity}
              </span>
            </div>
          </div>
          {isInstalled && (
            <button
              onClick={() => setConfigPkg(pkg)}
              className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100"
            >
              <Settings size={14} />
            </button>
          )}
        </div>

        {/* Name & Description */}
        <h3 className="text-secondary font-bold text-white mb-2 ">{pkg.name}</h3>
        <p className="text-label text-zinc-500 flex-1 line-clamp-3">{pkg.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-4 mb-4">
          <span className="text-label text-zinc-500">{pkg.installs ? `${(pkg.installs / 1000).toFixed(0)}k` : '1k'} installs</span>
          {pkg.version && <><span className="text-zinc-700">·</span><span className="text-label text-zinc-500">v{pkg.version}</span></>}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {(pkg.tags || []).slice(0, 3).map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 bg-zinc-800/80 text-zinc-500 text-[10px] rounded-full border border-zinc-700/50">{tag}</span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => !isInstalled && !isInstalling && setPreviewPkg(pkg)}
            disabled={isInstalled || isInstalling}
            className={`flex-1 py-2 rounded-xl font-bold text-label transition-all flex items-center justify-center gap-1.5 ${
              isInstalled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : isInstalling ? 'bg-indigo-600/10 text-indigo-400 cursor-wait opacity-70'
              : 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/25 border border-indigo-500/20'
            }`}
          >
            {isInstalled ? <><CheckCircle2 size={13} /> Installed</> : isInstalling ? <><Loader2 size={13} className="animate-spin" /> Installing...</> : <>Install</>}
          </button>
          <button
            onClick={() => setConfigPkg(pkg)}
            className="px-3 py-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-label transition-all flex items-center gap-1 border border-zinc-700/50"
          >
            <Settings size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 h-full w-full overflow-hidden bg-[#09090b]">
      {/* Permission & Dependency Preview Modal — Gate 5 */}
      {previewPkg && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg">
                  {previewPkg.icon || '📦'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{previewPkg.name}</h3>
                  <p className="text-xs text-zinc-400">Version {previewPkg.version || '1.0.0'} · {previewPkg.category}</p>
                </div>
              </div>
              <button onClick={() => setPreviewPkg(null)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Dependency Visualization */}
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Required Dependencies</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-zinc-800/60 rounded-lg text-emerald-400">
                  <CheckCircle2 size={13} /> Contacts Workspace
                </div>
                <div className="flex items-center gap-2 p-2 bg-zinc-800/60 rounded-lg text-emerald-400">
                  <CheckCircle2 size={13} /> Calendar Subsystem
                </div>
                <div className="flex items-center gap-2 p-2 bg-zinc-800/60 rounded-lg text-emerald-400">
                  <CheckCircle2 size={13} /> Storage / Files
                </div>
                <div className="flex items-center gap-2 p-2 bg-zinc-800/60 rounded-lg text-emerald-400">
                  <CheckCircle2 size={13} /> AI Runtime
                </div>
              </div>
            </div>

            {/* Permissions Requested */}
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Permissions Requested
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 font-mono">
                <li className="flex items-center gap-2"><span className="text-indigo-400">•</span> Read & write candidate records</li>
                <li className="flex items-center gap-2"><span className="text-indigo-400">•</span> Dispatch automated calendar invites</li>
                <li className="flex items-center gap-2"><span className="text-indigo-400">•</span> Access EventStore execution pipeline</li>
                <li className="flex items-center gap-2"><span className="text-indigo-400">•</span> Trigger situation assessment notifications</li>
              </ul>
            </div>

            {/* Admin Approval Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPreviewPkg(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmInstall(previewPkg)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/25"
              >
                Approve & Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {configPkg && (
        <AppConfigModal
          pkg={configPkg}
          onClose={() => setConfigPkg(null)}
          onSave={(cfg) => {
            localStorage.setItem(`chatr_marketplace_config_${configPkg.id}`, JSON.stringify(cfg));
            setConfigPkg(null);
          }}
        />
      )}

      {/* Left: Category Sidebar */}
      <div className="w-52 flex-shrink-0 border-r border-zinc-800/60 bg-zinc-950/60 p-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 px-2">Categories</div>
        <div className="space-y-0.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-xl text-label transition-all ${activeCategory === cat ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            >
              {cat}
              {cat !== 'All' && (
                <span className="float-right text-zinc-700 text-[10px]">
                  {allPackages.filter(p => p.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Main content */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}>
        <div className="p-8 max-w-6xl mx-auto space-y-10">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display font-extrabold text-white tracking-tight">Marketplace Ecosystem</h1>
              <p className="text-zinc-400 mt-1">
                {loading ? 'Loading apps...' : `${allPackages.length} capability packages • ${localInstalled.length} installed`}
              </p>
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search apps, categories, tags..."
                className="w-80 bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-secondary text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 size={36} className="text-indigo-400 animate-spin mx-auto mb-4" />
                <p className="text-zinc-500 text-secondary">Loading marketplace apps from kernel...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-zinc-600">
              <Package size={40} className="mx-auto mb-4 text-zinc-800" />
              <p className="font-medium text-zinc-500">No apps found</p>
              <p className="text-secondary mt-1">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <>
              {/* Featured (high-installs) */}
              {featured.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-label font-bold text-zinc-500 uppercase tracking-widest">⭐ Featured Apps</span>
                    <div className="flex-1 h-px bg-zinc-800/60" />
                    <span className="text-label text-zinc-600">{featured.length} apps</span>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    {featured.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
                  </div>
                </div>
              )}

              {/* All Other Apps */}
              {rest.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-label font-bold text-zinc-500 uppercase tracking-widest">{activeCategory === 'All' ? 'All Apps' : activeCategory}</span>
                    <div className="flex-1 h-px bg-zinc-800/60" />
                    <span className="text-label text-zinc-600">{rest.length} apps</span>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    {rest.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { MarketplaceView };
