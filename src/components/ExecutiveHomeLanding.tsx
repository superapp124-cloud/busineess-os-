import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, TrendingUp, Users, DollarSign, Brain, ArrowUpRight, Sparkles, ChevronRight, 
  HeartPulse, BarChart3, Layers, Activity, AlertTriangle, Clock, Cpu, Info
} from 'lucide-react';
import { CommandCenterExecutionSurface } from './CommandCenterExecutionSurface';
import { UASGraphEngine, EnterpriseStateSummary } from '../services/UASGraphEngine';
import { MetricDrilldownModal, MetricDrilldownData } from './MetricDrilldownModal';
import { MissionControlLandingSurface } from './MissionControlLandingSurface';
import { EnterpriseOperatingCenter } from './EnterpriseOperatingCenter';
import { DecisionHistoryInspectorModal } from './DecisionHistoryInspectorModal';
import { AdaptiveEnterpriseLenses } from './universal/AdaptiveEnterpriseLenses';
import { QuestionBasedOperatingCenter } from './universal/QuestionBasedOperatingCenter';
import { CommitmentsDueWidget } from './universal/CommitmentsDueWidget';
import { DeveloperSDKInspectorModal } from './sdk/DeveloperSDKInspectorModal';
import { MaturityMatrixModal } from './kernel/MaturityMatrixModal';
import { ProofCertificationModal } from './proofs/ProofCertificationModal';
import { ProductionHardeningModal } from './kernel/ProductionHardeningModal';
import { LensDetailsModal } from './universal/LensDetailsModal';
import { EnterpriseLensType } from '../services/universal/UniversalAdaptiveSubstrate';

export interface PerspectiveCard {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  metrics: string;
  color: string;
}

export const ExecutiveHomeLanding: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<EnterpriseStateSummary>(() =>
    UASGraphEngine.getInstance().getEnterpriseStateSummary()
  );

  const [drilldownData, setDrilldownData] = useState<MetricDrilldownData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState<boolean>(false);
  const [isSdkModalOpen, setIsSdkModalOpen] = useState<boolean>(false);
  const [isMaturityModalOpen, setIsMaturityModalOpen] = useState<boolean>(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState<boolean>(false);
  const [isHardeningModalOpen, setIsHardeningModalOpen] = useState<boolean>(false);
  const [selectedLens, setSelectedLens] = useState<EnterpriseLensType | null>(null);

  useEffect(() => {
    const unsubscribe = UASGraphEngine.getInstance().subscribe((newSummary) => {
      setSummary(newSummary);
    });
    return () => unsubscribe();
  }, []);


  const openDrilldown = (metricName: string, currentValue: string, formula: string, capability: string, service: string) => {
    setDrilldownData({
      metricName,
      currentValue,
      formula,
      sourceOfTruth: {
        capability,
        service,
        repository: 'Enterprise Operations Repository',
        tables: ['enterprise_records', 'timeline_events', 'performance_metrics'],
        refreshStrategy: 'Real-Time Business Synchronization (<0.1ms)'
      },
      inputNodes: [
        { nodeId: 'tcs-org-001', name: 'TCS Organization Account', domain: 'Organizations', forceContribution: '+$124.5k Cash • 0.98 Retention Index' },
        { nodeId: 'contract-8891', name: 'Client Contract #CTR-8891', domain: 'Commerce', forceContribution: '+$480k Portfolio Value • -0.15 Risk Index' },
        { nodeId: 'candidate-arjun-01', name: 'Consultant Deployment Team Apollo', domain: 'People', forceContribution: '+0.35 Capacity Index • -$45k Capital' }
      ],
      evidenceTrace: [
        { eventId: 'evt-001', timestamp: new Date(Date.now() - 3600000).toISOString(), causalityAction: 'CONTRACT_EXECUTED' },
        { eventId: 'evt-004', timestamp: new Date(Date.now() - 1800000).toISOString(), causalityAction: 'INVOICE_SETTLED' },
        { eventId: 'evt-006', timestamp: new Date().toISOString(), causalityAction: 'OPERATIONAL_UPDATE_COMMITTED' }
      ],
      predictionHistory: [
        { horizon: 'Next 30 Days', projectedDelta: '+$45,000 Cash Flow • -0.05 Risk Index', confidence: 0.94 },
        { horizon: 'Next 60 Days', projectedDelta: '+$95,000 Cash Flow • +0.12 Retention Index', confidence: 0.91 },
        { horizon: 'Next 90 Days', projectedDelta: '+$155,000 Net Portfolio Buffer', confidence: 0.88 }
      ]
    });
    setIsModalOpen(true);
  };


  const perspectives: PerspectiveCard[] = [
    {
      id: 'executive',
      name: 'Executive Perspective',
      badge: '👑 C-Suite',
      description: 'Enterprise state overview, strategic objectives, risk boundaries, and executive priorities.',
      icon: <Shield className="w-6 h-6 text-indigo-500" />,
      route: '/desktop/home',
      metrics: summary.perspectiveMetrics.executive,
      color: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20',
    },
    {
      id: 'growth',
      name: 'Growth Perspective',
      badge: '📣 Marketing',
      description: 'Lead generation, campaign performance, SEO optimization, and audience expansion.',
      icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
      route: '/desktop/growth-os',
      metrics: summary.perspectiveMetrics.growth,
      color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    },
    {
      id: 'revenue',
      name: 'Revenue Perspective',
      badge: '📈 Sales',
      description: 'Opportunity pipelines, quotation forecasting, AI proposal generator, and deal velocity.',
      icon: <DollarSign className="w-6 h-6 text-amber-500" />,
      route: '/desktop/revenue',
      metrics: summary.perspectiveMetrics.revenue,
      color: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
    },
    {
      id: 'recruitment',
      name: 'Personnel & Capacity Perspective',
      badge: '🎯 Personnel Substrate',
      description: 'Personnel capacity, work allocation, AI match scoring, and entity 360 lifecycles.',
      icon: <Users className="w-6 h-6 text-blue-500" />,
      route: '/desktop/recruitment',
      metrics: summary.perspectiveMetrics.recruitment,
      color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    },
    {
      id: 'operations',
      name: 'Operations & SLA Perspective',
      badge: '🚚 SLA Delivery',
      description: 'Resource deployments, SLA compliance, work item sign-offs, and service delivery health.',
      icon: <HeartPulse className="w-6 h-6 text-indigo-400" />,
      route: '/desktop/customer-success',
      metrics: summary.perspectiveMetrics.operations,
      color: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20',
    },
    {
      id: 'finance',
      name: 'Finance Perspective',
      badge: '💡 Cashflow',
      description: 'Cashflow forecasting, margin tracking, invoice ageing, and CFO executive summaries.',
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
      route: '/desktop/business-intelligence',
      metrics: summary.perspectiveMetrics.finance,
      color: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    },
    {
      id: 'knowledge',
      name: 'Knowledge Perspective',
      badge: '🧠 Enterprise Memory',
      description: 'Enterprise semantic search across resumes, proposals, emails, chats, and calls.',
      icon: <Brain className="w-6 h-6 text-purple-500" />,
      route: '/desktop/knowledge',
      metrics: summary.perspectiveMetrics.knowledge,
      color: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    },
    {
      id: 'platform_workspace',
      name: 'Platform Workspace',
      badge: '⚙️ Control Plane',
      description: 'Platform Admin control plane, kernel runtimes, capability registry, and telemetry.',
      icon: <Layers className="w-6 h-6 text-cyan-500" />,
      route: '/desktop/business-os',
      metrics: summary.perspectiveMetrics.platform,
      color: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20',
    },
  ];

  const domains = [
    { name: 'People', count: `${summary.domainCounts.People.toLocaleString()} Entities` },
    { name: 'Organizations', count: `${summary.domainCounts.Organizations} Clients` },
    { name: 'Work', count: `${summary.domainCounts.Work} Active Projects` },
    { name: 'Commerce', count: '$480k Pipeline' },
    { name: 'Finance', count: '$124.5k MRR' },
    { name: 'Knowledge', count: `${summary.domainCounts.Knowledge}k Items` },
    { name: 'Operations', count: '94% SLA Health' },
    { name: 'Governance', count: '100% Policy Pass' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Lens Details Modal */}
      <LensDetailsModal
        lensType={selectedLens}
        onClose={() => setSelectedLens(null)}
        onOpenDrilldown={openDrilldown}
      />

      {/* Production Hardening Modal */}
      <ProductionHardeningModal
        isOpen={isHardeningModalOpen}
        onClose={() => setIsHardeningModalOpen(false)}
      />

      {/* Proof Certification Modal */}
      <ProofCertificationModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
      />

      {/* Maturity Matrix Modal */}
      <MaturityMatrixModal
        isOpen={isMaturityModalOpen}
        onClose={() => setIsMaturityModalOpen(false)}
      />

      {/* Developer SDK Inspector Modal */}
      <DeveloperSDKInspectorModal
        isOpen={isSdkModalOpen}
        onClose={() => setIsSdkModalOpen(false)}
      />

      {/* Decision History Audit Modal */}
      <DecisionHistoryInspectorModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
      />

      {/* Metric Drilldown Modal */}
      <MetricDrilldownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={drilldownData}
      />

      {/* Question-Based Operating Center (Level 3 Surface) */}
      <QuestionBasedOperatingCenter
        onOpenDrilldown={openDrilldown}
        onExecuteDecision={(verb) => {
          UASGraphEngine.getInstance().executeInlineTask(`verb-${Date.now()}`, 'APPROVE_BUDGET');
        }}
      />

      {/* Enterprise Operating Center Landing */}
      <EnterpriseOperatingCenter
        onOpenHardeningModal={() => setIsHardeningModalOpen(true)}
        onOpenProofCertifications={() => setIsProofModalOpen(true)}
        onOpenMaturityMatrix={() => setIsMaturityModalOpen(true)}
        onOpenDeveloperSDK={() => setIsSdkModalOpen(true)}
        onOpenDecisionHistory={() => setIsDecisionModalOpen(true)}
        onExecuteRecommendation={(title, actionType) => {
          UASGraphEngine.getInstance().executeInlineTask(`rec-${Date.now()}`, actionType);
        }}
      />


      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden space-y-6">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHATR Universal Adaptive System (UAS)</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">The Operating System for Adaptive Organizations</h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            One unified enterprise graph. Multiple role perspectives. Continuous real-time execution.
          </p>
        </div>

        {/* Enterprise State Banner (Drillable Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div 
            onClick={() => openDrilldown(
              'Enterprise Health Metric', 
              `${summary.enterpriseHealth}%`, 
              'f(F, ve) = 100 - (Risk * 40) + (Trust * 10)', 
              'EnterpriseHealthCapability', 
              'DecisionCalculusEngine'
            )}
            className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 cursor-pointer transition-all group"
          >
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center">
                <Activity className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                Enterprise Health
              </span>
              <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {summary.enterpriseHealth}% <span className="text-xs text-emerald-400 font-normal">{summary.healthStatus}</span>
            </div>
          </div>

          <div 
            onClick={() => openDrilldown(
              'Decisions Pending Queue', 
              `${summary.pendingDecisionsCount} Actions`, 
              'QueueLength = Count(UnresolvedDecisionNodes)', 
              'DecisionCalculusEngine.getPendingQueue', 
              'DecisionEngine'
            )}
            className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:border-amber-500/50 cursor-pointer transition-all group"
          >
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                Decisions Pending
              </span>
              <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity" />
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {summary.pendingDecisionsCount} <span className="text-xs text-amber-400 font-normal">Actions</span>
            </div>
          </div>

          <div 
            onClick={() => openDrilldown(
              'Active Automations Substrate', 
              `${summary.activeAutomationsCount} Running`, 
              'AutomationsCount = Count(ActiveSubstrateRuntimes)', 
              'SubstrateExecutionCapability', 
              'ExecutionEngine'
            )}
            className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 cursor-pointer transition-all group"
          >
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
                Active Automations
              </span>
              <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {summary.activeAutomationsCount} <span className="text-xs text-indigo-400 font-normal">Running</span>
            </div>
          </div>

          <div 
            onClick={() => openDrilldown(
              'Guarded Critical Risks', 
              `${summary.criticalRisksCount} Guarded`, 
              'RisksGuarded = Count(EnforcedPolicyGuardrails)', 
              'PolicyEngine.evaluateGuardrails', 
              'PolicyEngine'
            )}
            className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 hover:border-rose-500/50 cursor-pointer transition-all group"
          >
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mr-1.5" />
                Critical Risks
              </span>
              <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 text-rose-400 transition-opacity" />
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {summary.criticalRisksCount} <span className="text-xs text-rose-400 font-normal">Guarded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Control Command Center Surface */}
      <MissionControlLandingSurface onOpenDrilldown={openDrilldown} />

      {/* Adaptive Enterprise Lenses (Layer 3 Substrate) */}
      <AdaptiveEnterpriseLenses onSelectLens={(lens) => setSelectedLens(lens)} />

      {/* Universal Commitments Due Widget */}
      <CommitmentsDueWidget />

      {/* Outcome Command Center Execution Surface */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Outcome Command Center</h2>
        <CommandCenterExecutionSurface />
      </div>

      {/* Universal Domains Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Universal Graph Domains</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {domains.map((domain, idx) => (
            <div 
              key={idx} 
              onClick={() => openDrilldown(
                `${domain.name} Domain Substrate`, 
                domain.count, 
                `Count(AdaptiveNode.domain === '${domain.name}')`, 
                `OperatingGraphCapability.getDomainNodes`, 
                'OperatingGraph'
              )}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between group"
            >
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-500 transition-colors">{domain.name}</span>
              <span className="text-xs text-slate-500 font-mono">{domain.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
