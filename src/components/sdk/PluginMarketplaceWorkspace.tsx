import React, { useState, useEffect } from 'react';
import { PluginLifecycleManager, InstalledPluginStatus } from '../../sdk/PluginLifecycleManager';
import { BaseChatrPluginProvider, IChatrPluginModule } from '../../sdk/PluginSDK';
import { PluginManifest } from '../../sdk/PluginManifest';
import { IntentKernel } from '../../kernel/IntentKernel';
import { UniversalSearchModal } from '../search/UniversalSearchModal';
import logo from '@/assets/chatr-icon-logo.png';
import { Store, ShieldCheck, Download, CheckCircle2, Trash2, Cpu, Search, Sparkles, Code2, Globe, Shield, RefreshCw } from 'lucide-react';

export const PluginMarketplaceWorkspace: React.FC = () => {
  const [installed, setInstalled] = useState<InstalledPluginStatus[]>([]);
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('marketplace');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    IntentKernel.boot().then(() => {
      setInstalled(PluginLifecycleManager.listInstalledPlugins());
    });
  }, []);

  const handleInstallSamplePlugin = async (sampleId: string, name: string) => {
    const sampleManifest: PluginManifest = {
      id: sampleId,
      name,
      version: '1.0.0',
      description: `Third-party developer plugin for ${name}`,
      author: 'Acme Developer Systems',
      license: 'MIT',
      compatibleKernelVersion: '^3.0',
      requestedPermissions: ['file_system', 'browser'],
      providers: [
        {
          id: `${sampleId}-provider`,
          name: `${name} Provider`,
          category: 'document',
          capabilities: ['custom-plugin', 'external-sync'],
          privacyLevel: 'local-only',
          supportsOffline: true,
        },
      ],
      entryPoint: 'index.js',
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    class SamplePluginProvider extends BaseChatrPluginProvider<any, any> {
      public id = `${sampleId}-provider`;
      public name = `${name} Provider`;
      public manifest = {
        id: this.id,
        name: this.name,
        category: 'document' as const,
        capabilities: ['custom-plugin', 'external-sync'],
        requirements: { supportsOffline: true },
        priority: 110,
        costPerOp: 0,
        privacyLevel: 'local-only' as const,
        avgLatencyMs: 50,
        providerVersion: '1.0.0',
      };

      public async initialize(): Promise<void> {}
      public async execute(input: any) {
        return this.createSuccessResult({ synced: true });
      }
    }

    const sampleModule: IChatrPluginModule = {
      manifest: sampleManifest,
      providers: [new SamplePluginProvider()],
    };

    const status = await PluginLifecycleManager.installPlugin(sampleModule);
    setInstalled(PluginLifecycleManager.listInstalledPlugins());
    setFeedback(`Plugin '${name}' installed & activated cleanly under Kernel v3.0!`);
  };

  const handleUninstall = async (pluginId: string) => {
    await PluginLifecycleManager.uninstallPlugin(pluginId);
    setInstalled(PluginLifecycleManager.listInstalledPlugins());
    setFeedback(`Plugin '${pluginId}' uninstalled.`);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="CHATR" className="w-7 h-7 object-contain rounded" />
          <div>
            <h1 className="font-bold text-sm text-white flex items-center gap-2">
              Plugin Marketplace & Developer SDK
              <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono rounded border border-cyan-500/30">
                SDK v1.0.0
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-all font-sans font-medium text-xs shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Universal Search</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded font-mono text-slate-400 border border-slate-700">Ctrl + K</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PermissionEngine Authorized</span>
          </div>
        </div>
      </header>

      {/* Feedback Alert Banner */}
      {feedback && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-2 text-xs text-emerald-300 font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-800 bg-slate-900/40 px-6 flex items-center gap-6 text-xs font-medium">
          {[
            { id: 'marketplace', label: 'Developer Marketplace', icon: Store },
            { id: 'installed', label: `Installed Plugins (${installed.length})`, icon: Shield },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-300 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab View Contents */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
          {activeTab === 'marketplace' && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Developer Plugin SDK Marketplace</h2>
                  <p className="text-xs text-slate-400">Discover and install third-party provider plugins without modifying kernel source code.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'plugin-notion-sync', name: 'Notion Sync Engine', author: 'Notion Labs', desc: 'Bidirectional sync of workspace documents with Notion databases.' },
                  { id: 'plugin-slack-connector', name: 'Slack Team Messaging Adapter', author: 'Slack Core', desc: 'Sync Slack channels into CHATR Universal Search memory.' },
                  { id: 'plugin-epic-ehr-medical', name: 'Epic EHR Medical Records', author: 'HealthTech AI', desc: 'HIPAA-compliant EHR lab parsing and ICD-10 medical extraction.' },
                ].map(item => {
                  const isAlreadyInstalled = installed.some(p => p.manifest.id === item.id);
                  return (
                    <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                            SDK v1.0.0
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.author}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{item.name}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>

                      <button
                        onClick={() => handleInstallSamplePlugin(item.id, item.name)}
                        disabled={isAlreadyInstalled}
                        className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                          isAlreadyInstalled
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white'
                        }`}
                      >
                        {isAlreadyInstalled ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Installed & Active
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Install & Activate
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'installed' && (
            <div className="max-w-5xl mx-auto space-y-4">
              <h2 className="text-lg font-bold text-white">Installed Third-Party Plugins ({installed.length})</h2>
              {installed.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
                  No third-party developer plugins installed yet. Visit the Marketplace tab to install sample plugins.
                </div>
              ) : (
                <div className="space-y-3">
                  {installed.map(item => (
                    <div key={item.manifest.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{item.manifest.name}</h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">ID: {item.manifest.id} • Author: {item.manifest.author} • Version: {item.manifest.version}</p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 pt-1">
                          <span>Permissions: {item.manifest.requestedPermissions.join(', ')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUninstall(item.manifest.id)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-lg border border-rose-500/30 flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        Uninstall
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <UniversalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
