import React, { useState, useEffect } from 'react';
import { GlobalHeader } from './GlobalHeader';
import { EnterpriseNavigator } from './EnterpriseNavigator';
import { BottomDock } from './BottomDock';
import { EnterpriseCanvas } from '../enterprise-canvas/EnterpriseCanvas';
import { EnterpriseIntelligencePane } from '../enterprise-intelligence/EnterpriseIntelligencePane';
import { CommandPalette } from './CommandPalette';
import { RuntimeInspector } from './RuntimeInspector';
import { DigitalTwinExplorer } from '../enterprise-studio/DigitalTwinExplorer';
import { ProcessStudio } from '../enterprise-studio/ProcessStudio';
import { MarketplaceStudio } from '../enterprise-studio/MarketplaceStudio';
import { LiveExecutionMap } from '../enterprise-canvas/LiveExecutionMap';
import { MissionExecutionContext } from '../../core/types';
import { SidebarClose, SidebarOpen } from 'lucide-react';

import { EnterpriseHome } from '../enterprise-home/EnterpriseHome';
import { EnterpriseEvaluationDashboard } from '../enterprise-evaluation/EnterpriseEvaluationDashboard';
import { LiveActivityTicker } from './LiveActivityTicker';
import { DomainWorkspaceRouter } from './DomainWorkspaceRouter';

interface Props {
  missionContext: MissionExecutionContext | null;
  isProcessing?: boolean;
  items?: any[];
  activeItemId?: string | null;
  setActiveItemId?: (id: string) => void;
  onUploadClick?: () => void;
  onRemoveItem?: (e: React.MouseEvent, id: string) => void;
}

export const EnterpriseShell: React.FC<Props> = ({
  missionContext,
  isProcessing,
  items = [],
  activeItemId = null,
  setActiveItemId,
  onUploadClick,
  onRemoveItem,
}) => {
  const [activeDomain, setActiveDomain] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(true);
  const [canvasMode, setCanvasMode] = useState<'Review' | 'Decision' | 'Execution' | 'Audit'>('Decision');

  // ─── Studio & Overlay States ──────────────────────────────────────────────
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isRuntimeInspectorOpen, setIsRuntimeInspectorOpen] = useState(false);
  const [isDigitalTwinOpen, setIsDigitalTwinOpen] = useState(false);
  const [isProcessStudioOpen, setIsProcessStudioOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isLiveExecutionMapOpen, setIsLiveExecutionMapOpen] = useState(false);

  // ─── Global Keyboard Shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsRuntimeInspectorOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">

      {/* 1. Universal OS Header */}
      <GlobalHeader
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenRuntimeInspector={() => setIsRuntimeInspectorOpen(true)}
        onOpenMarketplace={() => setIsMarketplaceOpen(true)}
        onOpenExecutionMap={() => setIsLiveExecutionMapOpen(true)}
      />

      {/* 2. Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left 7-Tier Navigator (Collapsible) */}
        {isSidebarOpen && (
          <EnterpriseNavigator
            activeDomain={activeDomain}
            onDomainChange={(d) => setActiveDomain(d)}
            onSelectDomain={(d) => setActiveDomain(d)}
            items={items}
            activeItemId={activeItemId}
            setActiveItemId={setActiveItemId}
            onUploadClick={onUploadClick}
            onRemoveItem={onRemoveItem}
          />
        )}

        {/* Center Main Stage */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 border-r border-slate-800">

          {/* Sub-Header bar for Mode switching & Sidebar Toggle */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                title="Toggle Sidebar (Ctrl+B)"
              >
                {isSidebarOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
                <span className="text-[10px] font-mono text-slate-500">Ctrl+B</span>
              </button>
              <div className="h-3 w-px bg-slate-800" />
              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                <span className="text-slate-500">Domain:</span>
                <span className="text-indigo-400 font-bold uppercase">{activeDomain}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDigitalTwinOpen(true)}
                className="px-2 py-1 text-[10px] font-semibold text-indigo-400 bg-indigo-950/60 hover:bg-indigo-900/60 rounded border border-indigo-800/40 transition-colors"
                title="Inspect Digital Twin Entity Graph"
              >
                Twin Graph
              </button>

              <button
                onClick={() => setIsProcessStudioOpen(true)}
                className="px-2 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 rounded border border-emerald-800/40 transition-colors"
                title="Open Pre-Flight Simulation (Terraform Plan)"
              >
                Simulation
              </button>

              <button
                onClick={() => setIsRuntimeInspectorOpen(true)}
                className="px-2 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
                title="Open Runtime Inspector (Ctrl+Shift+I)"
              >
                <span>DEV</span>
                <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[9px]">Ctrl+⇧+I</kbd>
              </button>

              <button
                onClick={() => setIsIntelligenceOpen(!isIntelligenceOpen)}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Toggle Intelligence Pane"
              >
                {isIntelligenceOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {activeDomain === 'home' ? (
              <EnterpriseHome
                missionContext={missionContext}
                onNavigate={(d) => setActiveDomain(d)}
              />
            ) : (
              <DomainWorkspaceRouter
                activeDomain={activeDomain}
                missionContext={missionContext}
                canvasMode={canvasMode}
                isProcessing={isProcessing}
                onNavigate={(d) => setActiveDomain(d)}
              />
            )}
          </div>
        </div>

        {/* Right: Intelligence Panel */}
        <EnterpriseIntelligencePane
          missionContext={missionContext}
          isOpen={isIntelligenceOpen}
          onToggle={() => setIsIntelligenceOpen(!isIntelligenceOpen)}
        />
      </div>

      {/* 3. Global Capabilities & Commands */}
      <BottomDock />

      {/* 4. Live Activity Toast Ticker */}
      <LiveActivityTicker />

      {/* ─── Overlays & Studios ────────────────────────────────────────── */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        missionContext={missionContext}
        onOpenRuntimeInspector={() => {
          setIsCommandPaletteOpen(false);
          setIsRuntimeInspectorOpen(true);
        }}
      />

      <RuntimeInspector
        isOpen={isRuntimeInspectorOpen}
        onClose={() => setIsRuntimeInspectorOpen(false)}
      />

      <DigitalTwinExplorer
        missionContext={missionContext}
        isOpen={isDigitalTwinOpen}
        onClose={() => setIsDigitalTwinOpen(false)}
      />

      <ProcessStudio
        isOpen={isProcessStudioOpen}
        onClose={() => setIsProcessStudioOpen(false)}
      />

      <MarketplaceStudio
        isOpen={isMarketplaceOpen}
        onClose={() => setIsMarketplaceOpen(false)}
      />

      <LiveExecutionMap
        missionContext={missionContext}
        isOpen={isLiveExecutionMapOpen}
        onClose={() => setIsLiveExecutionMapOpen(false)}
      />
    </div>
  );
};
