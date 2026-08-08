import React, { useState, useEffect } from 'react';
import { MissionExecutionContext } from '../../core/types';
import { GlobalHeader } from './GlobalHeader';
import { EnterpriseNavigator } from './EnterpriseNavigator';
import { EnterpriseHome } from '../enterprise-home/EnterpriseHome';
import { DomainWorkspaceRouter } from './DomainWorkspaceRouter';
import { EnterpriseIntelligencePane } from '../enterprise-intelligence/EnterpriseIntelligencePane';
import { CommandPalette } from './CommandPalette';

interface Props {
  missionContext: MissionExecutionContext | null;
  isProcessing?: boolean;
  items?: any[];
  activeItemId?: string | null;
  setActiveItemId?: (id: string | null) => void;
  onUploadClick?: () => void;
  onRemoveItem?: (id: string) => void;
}

function getMissionForDocument(docTitle: string, defaultMc: MissionExecutionContext | null): MissionExecutionContext {
  const titleLower = docTitle.toLowerCase();

  if (titleLower.includes('loan') || titleLower.includes('interest') || titleLower.includes('j&k') || titleLower.includes('financial audit')) {
    return {
      id: 'doc-home-loan-interest',
      mission: 'Financial Audit — Home Loan interest.pdf',
      lifecycleState: 'READY_FOR_REVIEW',
      actionRequired: 'Verify housing loan interest certificate details',
      trigger: { payload: { sourceUri: 'Financial Audit — Home Loan interest.pdf' } },
      recommendations: [
        {
          action: 'Save Tax Proof Certificate',
          reason: 'Housing loan interest certificate issued by Jammu & Kashmir Bank (BU Budgam) for Mr. Arshid Hussain Wani (A/C #0078265500010575) for FY 2025-26.',
          confidence: 98,
          riskLevel: 'low',
        }
      ],
      auditTrail: [],
      businessOutcomes: { manualWorkEliminated: '100% Verified', decisionsAccelerated: 1, automationCompletionRate: '100%', slaImprovement: 'Instant', financialValueCreated: 'Tax Exempt' }
    } as any;
  }

  if (titleLower.includes('strong') || titleLower.includes('alignment')) {
    return {
      id: 'doc-strong-alignment',
      mission: 'Strong Alignment.docx',
      lifecycleState: 'READY_FOR_REVIEW',
      actionRequired: 'Verify data encryption & SLA compliance',
      trigger: { payload: { sourceUri: 'Strong Alignment.docx' } },
      recommendations: [
        {
          action: 'Approve & Sign Enterprise Data Policy',
          reason: 'Document complies 100% with enterprise security policies v3.2. Data encryption, access control, and SLA guarantees are fully aligned.',
          confidence: 96,
          riskLevel: 'low',
        }
      ],
      auditTrail: [],
      businessOutcomes: { manualWorkEliminated: '100% Automated', decisionsAccelerated: 1, automationCompletionRate: '100%', slaImprovement: '99.99%', financialValueCreated: 'Compliant' }
    } as any;
  }

  if (titleLower.includes('nps')) {
    return {
      id: 'doc-nps-2026',
      mission: 'NPS 2026.pdf',
      lifecycleState: 'REVIEW_NEEDED',
      actionRequired: 'Follow up on 2 enterprise response latency flags',
      trigger: { payload: { sourceUri: 'NPS 2026.pdf' } },
      recommendations: [
        {
          action: 'Schedule CSM Account Follow-Up',
          reason: 'Overall Net Promoter Score is +42 (Good), but 2 Enterprise accounts reported response latency issues requiring immediate CSM follow-up.',
          confidence: 78,
          riskLevel: 'medium',
        }
      ],
      auditTrail: [],
      businessOutcomes: { manualWorkEliminated: '2 Follow-ups Pending', decisionsAccelerated: 1, automationCompletionRate: '88%', slaImprovement: '92%', financialValueCreated: '+42 CSAT' }
    } as any;
  }

  return defaultMc || ({
    id: 'doc-charles-hopkins',
    mission: 'CHARLES HOPKINS.docx',
    lifecycleState: 'READY_FOR_REVIEW',
    actionRequired: 'Review candidate qualifications & shortlist',
    trigger: { payload: { sourceUri: 'CHARLES HOPKINS.docx' } },
    recommendations: [
      {
        action: 'Shortlist Candidate for L5 Role',
        reason: 'Candidate exceeds L5 hiring threshold. 8.3 years of multi-country logistics experience. All background & qualification checks passed cleanly.',
        confidence: 92,
        riskLevel: 'low',
      }
    ],
    auditTrail: [],
    businessOutcomes: { manualWorkEliminated: '1,000 hrs saved', decisionsAccelerated: 1, automationCompletionRate: '92%', slaImprovement: 'Instant', financialValueCreated: 'Strong Hire' }
  } as any);
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
  const [selectedDocTitle, setSelectedDocTitle] = useState<string>('CHARLES HOPKINS.docx');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(true);
  const [canvasMode, setCanvasMode] = useState<'Review' | 'Decision' | 'Execution' | 'Audit'>('Decision');

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isRuntimeInspectorOpen, setIsRuntimeInspectorOpen] = useState(false);

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

  const handleNavigate = (domain: string, docPayload?: string) => {
    setActiveDomain(domain);
    if (docPayload) {
      setSelectedDocTitle(docPayload);
    }
  };

  const activeMission = getMissionForDocument(selectedDocTitle, missionContext);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">

      {/* 1. Universal OS Header */}
      <GlobalHeader
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenRuntimeInspector={() => setIsRuntimeInspectorOpen(true)}
        onOpenMarketplace={() => {}}
        onOpenExecutionMap={() => {}}
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
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeDomain === 'home' ? (
              <EnterpriseHome
                missionContext={activeMission}
                onNavigate={handleNavigate}
                onUploadClick={onUploadClick}
              />
            ) : (
              <DomainWorkspaceRouter
                activeDomain={activeDomain}
                missionContext={activeMission}
                canvasMode={canvasMode}
                isProcessing={isProcessing}
                onNavigate={handleNavigate}
                onUploadClick={onUploadClick}
              />
            )}
          </div>
        </div>

        {/* Right: Intelligence Panel */}
        <EnterpriseIntelligencePane
          missionContext={activeMission}
          isOpen={isIntelligenceOpen}
          onToggle={() => setIsIntelligenceOpen(!isIntelligenceOpen)}
        />
      </div>

      {/* ─── Overlays & Studios ────────────────────────────────────────── */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        missionContext={activeMission}
        onOpenRuntimeInspector={() => {
          setIsCommandPaletteOpen(false);
          setIsRuntimeInspectorOpen(true);
        }}
      />
    </div>
  );
};
