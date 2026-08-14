import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, LayoutGrid, Sparkles, Plus, Search, Settings, ShieldCheck, Bell, Database, Users,
  ChevronLeft, ChevronRight, Command
} from 'lucide-react';
import { useCanonicalRoute } from '../../hooks/useCanonicalRoute';
import { GlobalSearchPalette } from '../../components/GlobalSearchPalette';
import { KernelProvider } from '../../presentation-runtime/providers/KernelProvider';
import { AutomationEngine } from '../../sdk/engines/AutomationEngine';
import { useDesignSystem } from '../../contexts/DesignSystemContext';
import RecruiterWorkspace from './RecruiterWorkspace';
import { OSTemplate, TEMPLATES, resolveTemplate } from '../../data/os-templates';
import { CapabilityWorkspaceView } from '../../components/desktop/universal/CapabilityWorkspaceView';
import { BusinessOSHome } from '../../components/desktop/universal/BusinessOSHome';
import CATALOG from '../../data/capability-catalog';
import { CapabilityInstaller, type IInstallProgress } from '../../sdk/CapabilityInstaller';

import {
  SDK_REGISTRY,
  AIBusinessSetup,
  MarketplaceView,
  DomainSuperintendentView,
  OrganizationView,
  KnowledgeFabricView,
  PlatformSettingsView,
  IdentityAccessView,
  DepartmentWorkspace
} from './components/business-os';

type AppState = 'onboarding' | 'provisioning' | 'os';

export default function BusinessOS() {
  const { theme, density, uiScale, setTheme, setDensity, setUiScale } = useDesignSystem();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  React.useEffect(() => {
    AutomationEngine.initialize();
  }, []);

  const [appState, setAppState] = useState<AppState>('os');
  // ── Canonical URL routing (replaces useState<ViewMode>('home')) ──
  // Survives refresh. Produces shareable deep links.
  // CHATR Product Unification Contract — Gate 1.
  const { viewMode: activeView, packageId: urlPackageId, deptId: urlDeptId, navigate: canonicalNavigate } = useCanonicalRoute();

  // ── Global Search — Gate 2 ──
  // Ctrl/Cmd + K opens the tenant-scoped search palette.
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  const [activeTemplate, setActiveTemplate] = useState<OSTemplate | null>(() => resolveTemplate(localStorage.getItem('chatr_active_domain') || 'Professional Services') || TEMPLATES[0]);
  const [activeProfile, setActiveProfile] = useState<any>(() => ({
    name: localStorage.getItem('chatr_company_name') || localStorage.getItem('chatr_org_name') || localStorage.getItem('user_workspace_name') || (localStorage.getItem('chatr_user_name') ? `${localStorage.getItem('chatr_user_name')}'s Workspace` : 'CHATR Business OS'),
    industry: localStorage.getItem('chatr_active_domain') || 'Professional Services',
    dept: ['Executive Office', 'Sales', 'Recruitment', 'Delivery', 'Finance'],
    tech: ['Microsoft 365', 'Supabase', 'Gemini AI', 'Stripe'],
    teamSize: '11-50',
    location: 'Noida'
  }));
  // selectedPackage: prefer URL-sourced packageId/deptId, fall back to local state for
  // cases where the page navigates programmatically before the URL updates.
  const [localPackageId, setLocalPackageId] = useState<string | null>(null);
  const selectedPackage = urlPackageId || urlDeptId || localPackageId;
  const [installedPackages, setInstalledPackages] = useState<string[]>(
    () => CapabilityInstaller.getInstalledIds()
  );
  const [installedManifests, setInstalledManifests] = useState<any[]>([]);
  const [installProgress, setInstallProgress] = useState<IInstallProgress | null>(null);
  const [installingId, setInstallingId] = useState<string | null>(null);

  // Keep installedManifests in sync with installedPackages
  // Prefers full SDK data, falls back to CATALOG manifest
  useEffect(() => {
    const manifests = installedPackages.map(id => {
      const sdk = SDK_REGISTRY[id];
      return sdk || CATALOG.find(c => c.id === id);
    }).filter(Boolean);
    setInstalledManifests(manifests);
  }, [installedPackages]);

  // Install handler — runs 10-step pipeline
  const handleInstallCapability = async (id: string) => {
    setInstallingId(id);
    const sdk = SDK_REGISTRY[id];
    const catalogItem = CATALOG.find(c => c.id === id);
    
    // Build a minimal SDK from catalog if no full SDK exists
    const sdkToInstall = sdk || {
      id,
      name: catalogItem?.name || id,
      description: catalogItem?.description || '',
      department: catalogItem?.department || '',
      category: catalogItem?.category || '',
      version: catalogItem?.version || '1.0.0',
      maturity: catalogItem?.maturity || 'L3',
      icon: catalogItem?.icon || '📦',
      rating: catalogItem?.rating || 4.0,
      installs: catalogItem?.installs || 0,
      tags: catalogItem?.tags || [],
      objects: [],
      views: [],
      dashboards: [],
      reports: [],
      ai: { skills: [] },
      workflows: [],
      automations: [],
      permissions: {},
      notifications: [],
      seed: { objects: [] },
      search: { objects: [] },
      settings: catalogItem?.configSchema || [],
      integrations: [],
    };

    const result = await CapabilityInstaller.install(sdkToInstall, (progress) => {
      setInstallProgress(progress);
    });
    
    if (result.success) {
      setInstalledPackages(CapabilityInstaller.getInstalledIds());
    }
    setInstallProgress(null);
    setInstallingId(null);
  };

  // Uninstall handler
  const handleUninstallCapability = (id: string) => {
    CapabilityInstaller.uninstall(id);
    setInstalledPackages(CapabilityInstaller.getInstalledIds());
    if (selectedPackage === id) setLocalPackageId(null);
    canonicalNavigate('marketplace');
  };

  if (appState === 'onboarding') {
    return <AIBusinessSetup onComplete={(template, profile) => {
      if (profile?.name) localStorage.setItem('chatr_company_name', profile.name);
      if (profile?.industry) localStorage.setItem('chatr_active_domain', profile.industry);
      setActiveTemplate(template);
      setActiveProfile(profile);
      setAppState('os');
    }} />;
  }

  if (appState === 'os') {
    return (
      <KernelProvider useInMemory={false}>
        {/* Global Search Palette — Gate 2: Ctrl/Cmd+K */}
        {/* Rendered at KernelProvider level to overlay entire BusinessOS UI */}
        <GlobalSearchPalette isOpen={isSearchOpen} onClose={closeSearch} />

        <div className="flex w-full h-full bg-[#09090b] overflow-hidden font-sans">
          
          {/* Universal Sidebar - Collapsible with Hover-to-Expand */}
          <div 
            className={`${isSidebarExpanded || isSidebarHovered ? 'w-64' : 'w-20'} bg-zinc-950/80 border-r border-zinc-800/60 flex flex-col h-full flex-shrink-0 relative z-20 backdrop-blur-xl transition-all duration-300 ease-in-out`}
            onMouseEnter={() => !isSidebarExpanded && setIsSidebarHovered(true)}
            onMouseLeave={() => !isSidebarExpanded && setIsSidebarHovered(false)}
          >
            
            {/* Toggle Sidebar Button */}
            <button 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="absolute -right-3 top-6 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors shadow-md z-30"
            >
              {isSidebarExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Tenant Header */}
            <div className="h-16 flex items-center px-5 border-b border-zinc-800/60 shrink-0 bg-transparent transition-all duration-300">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center shrink-0">
                  <img src="/chatr-logo.png" alt="CHATR" className="h-6 w-auto object-contain filter invert opacity-90" />
                </div>
                {(isSidebarExpanded || isSidebarHovered) && (
                  <div className="overflow-hidden transition-all duration-300 opacity-100">
                    <div className="font-bold text-secondary text-white tracking-wide truncate w-40">{activeProfile?.name || 'CHATR Business OS'}</div>
                    <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">{activeTemplate?.name} Template</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 overflow-x-hidden" style={{ scrollbarWidth: 'none' }}>

              {/* 1. WORK SECTION */}
              <div>
                {(isSidebarExpanded || isSidebarHovered) && (
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-3">
                    Work
                  </div>
                )}
                <div className="space-y-1">
                  <button onClick={() => canonicalNavigate('home')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-secondary transition-all ${activeView === 'home' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium'}`} title="Home">
                    <LayoutGrid size={15} className={`shrink-0 ${activeView === 'home' ? 'text-indigo-400' : 'text-zinc-500'}`} /> 
                    {(isSidebarExpanded || isSidebarHovered) && <span className="truncate">Home</span>}
                  </button>

                  <button onClick={() => canonicalNavigate('recruitment')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-secondary transition-all group ${activeView === 'recruitment' ? 'bg-indigo-600/10 text-indigo-400 font-semibold border border-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium border border-transparent'}`} title="Recruitment & HR">
                    <div className="flex items-center gap-3">
                      <Users size={15} className={`shrink-0 ${activeView === 'recruitment' ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-indigo-400 transition-colors'}`} /> 
                      {(isSidebarExpanded || isSidebarHovered) && <span className="truncate">Recruitment & HR</span>}
                    </div>
                    {(isSidebarExpanded || isSidebarHovered) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">L4</span>}
                  </button>

                  <button onClick={() => canonicalNavigate('organization')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-secondary transition-all ${activeView === 'organization' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium'}`} title="Organization Structure">
                    <Building2 size={15} className={`shrink-0 ${activeView === 'organization' ? 'text-white' : 'text-zinc-500'}`} /> 
                    {(isSidebarExpanded || isSidebarHovered) && <span className="truncate">Organization Structure</span>}
                  </button>
                </div>
              </div>

              {/* 2. INTELLIGENCE SECTION */}
              <div>
                {(isSidebarExpanded || isSidebarHovered) && (
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-3">
                    Intelligence
                  </div>
                )}
                <div className="space-y-1">
                  <button onClick={() => canonicalNavigate('knowledge')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-secondary transition-all ${activeView === 'knowledge' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium'}`} title="Enterprise Knowledge Fabric">
                    <Database size={15} className={`shrink-0 ${activeView === 'knowledge' ? 'text-white' : 'text-zinc-500'}`} /> 
                    {(isSidebarExpanded || isSidebarHovered) && <span className="truncate">Knowledge Fabric</span>}
                  </button>
                </div>
              </div>

              {/* 3. EXECUTION SECTION */}
              <div>
                {(isSidebarExpanded || isSidebarHovered) && (
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-3">
                    Execution
                  </div>
                )}
                <div className="space-y-1">
                  <button onClick={() => canonicalNavigate('marketplace')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-secondary transition-all ${activeView === 'marketplace' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium'}`} title="Capability Marketplace">
                    <Plus size={15} className={`shrink-0 ${activeView === 'marketplace' ? 'text-white' : 'text-zinc-500'}`} /> 
                    {(isSidebarExpanded || isSidebarHovered) && <span className="truncate">Capability Marketplace</span>}
                  </button>

                  {/* Installed Packages list */}
                  {installedManifests.map(manifest => {
                    const isActive = activeView === 'package' && selectedPackage === manifest.id;
                    return (
                      <button
                        key={manifest.id}
                        onClick={() => { setLocalPackageId(manifest.id); canonicalNavigate('package', { packageId: manifest.id }); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-secondary transition-all group ${
                          isActive ? 'bg-emerald-600/10 text-emerald-400 font-semibold border border-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium border border-transparent'
                        }`}
                        title={manifest.name}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-body shrink-0">{manifest.icon || '📦'}</span>
                          {(isSidebarExpanded || isSidebarHovered) && <span className="truncate max-w-[120px]">{manifest.name}</span>}
                        </div>
                        {(isSidebarExpanded || isSidebarHovered) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-500 flex-shrink-0">{manifest.maturity || 'L3'}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. ADMIN SECTION (Collapsible) */}
              <div>
                <div 
                  onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                  className="flex items-center justify-between mb-2 px-3 cursor-pointer group"
                >
                  {(isSidebarExpanded || isSidebarHovered) && (
                    <div className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest transition-colors flex items-center gap-1.5">
                      <span>Admin & Governance</span>
                      <span className="text-[9px] text-zinc-600 font-mono">{isAdminExpanded ? '▲' : '▼'}</span>
                    </div>
                  )}
                </div>
                {(isAdminExpanded || !isSidebarExpanded) && (
                  <div className="space-y-1">
                    <button onClick={() => canonicalNavigate('identity')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-secondary transition-all ${activeView === 'identity' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium'}`} title="Identity & Access">
                      <ShieldCheck size={15} className={`shrink-0 ${activeView === 'identity' ? 'text-white' : 'text-zinc-500'}`} /> 
                      {(isSidebarExpanded || isSidebarHovered) && <span className="truncate">Identity & Access</span>}
                    </button>

                    <button onClick={() => canonicalNavigate('ai_runtime')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-secondary transition-all ${activeView === 'ai_runtime' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium'}`} title="System Health">
                      <Sparkles size={15} className={`shrink-0 ${activeView === 'ai_runtime' ? 'text-white' : 'text-zinc-500'}`} /> 
                      {(isSidebarExpanded || isSidebarHovered) && <span className="truncate">System Health</span>}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden bg-background">
            {/* Action Bar (Top Toolbar) */}
            <div className="h-14 border-b border-zinc-800/60 flex items-center justify-between px-6 bg-zinc-950/30 backdrop-blur-md shrink-0 z-10">
              <div className="flex items-center gap-4">
                {/* Search trigger — opens GlobalSearchPalette (Ctrl/Cmd+K) */}
                <button
                  id="global-search-trigger"
                  onClick={openSearch}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-500 w-80 hover:border-zinc-700 hover:text-zinc-300 transition-all group"
                  title="Search (Ctrl+K)"
                >
                  <Search size={13} className="shrink-0" />
                  <span className="flex-1 text-left text-[13px] truncate">Search people, conversations, executions…</span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <kbd className="text-[10px] font-mono bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 group-hover:border-zinc-600"><Command size={9} className="inline" /></kbd>
                    <kbd className="text-[10px] font-mono bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 group-hover:border-zinc-600">K</kbd>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-4">
                {/* Design System Toggles */}
                <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                  <select 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="bg-transparent text-label text-zinc-400 border-none outline-none px-2 py-1 cursor-pointer hover:text-zinc-200"
                  >
                    <option value="default">Premium Dark</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="midnight">Midnight</option>
                    <option value="neon">Neon</option>
                  </select>
                  <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                  <select 
                    value={density}
                    onChange={(e) => setDensity(e.target.value as any)}
                    className="bg-transparent text-label text-zinc-400 border-none outline-none px-2 py-1 cursor-pointer hover:text-zinc-200"
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>
                
                <span className="text-label font-bold text-zinc-500 px-3 py-1 bg-zinc-900 rounded-md border border-zinc-800">{activeTemplate?.name}</span>
                <button onClick={() => setAppState('onboarding')} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Reconfigure Business OS Setup">
                  <Settings size={12} /> Reconfigure Setup
                </button>
                <Bell size={16} className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
                <Settings size={16} className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
              </div>
            </div>

            {/* View Router */}
            <div className="flex-1 flex overflow-hidden relative w-full">
              {activeView === 'home' && (
                <BusinessOSHome onNavigateToRecord={(capId, _objName, _recId) => {
                  setLocalPackageId(capId);
                  canonicalNavigate('package', { packageId: capId });
                }} />
              )}
              {activeView === 'marketplace' && <MarketplaceView installedPackages={installedPackages} onInstall={(id, _manifest) => { handleInstallCapability(id); }} />}
              {activeView === 'recruitment' && <RecruiterWorkspace />}
              {activeView === 'ai_runtime' && activeTemplate && <DomainSuperintendentView template={activeTemplate} />}
              {activeView === 'organization' && activeTemplate && <OrganizationView template={activeTemplate} />}
              {activeView === 'knowledge' && activeTemplate && <KnowledgeFabricView template={activeTemplate} />}
              {activeView === 'settings' && activeTemplate && <PlatformSettingsView template={activeTemplate} />}
              {activeView === 'identity' && <IdentityAccessView />}
              {activeView === 'department' && activeTemplate && selectedPackage && (
                <DepartmentWorkspace 
                  template={activeTemplate} 
                  deptId={selectedPackage} 
                  onNavigateToPackage={(pkgId) => {
                    if (installedPackages.includes(pkgId)) {
                      setLocalPackageId(pkgId);
                      canonicalNavigate('package', { packageId: pkgId });
                    } else {
                      if (window.confirm(`This module requires the '${pkgId}' capability. Would you like to install it now?`)) {
                        handleInstallCapability(pkgId).then(() => {
                          setLocalPackageId(pkgId);
                          canonicalNavigate('package', { packageId: pkgId });
                        });
                      }
                    }
                  }}
                />
              )}
              {activeView === 'package' && selectedPackage && installedManifests.find(m => m.id === selectedPackage) && (
                <CapabilityWorkspaceView 
                  sdk={SDK_REGISTRY[selectedPackage]}
                  manifest={installedManifests.find(m => m.id === selectedPackage)} 
                  onUninstall={handleUninstallCapability}
                />
              )}
            </div>
          </div>
        </div>
      </KernelProvider>
    );
  }
}
