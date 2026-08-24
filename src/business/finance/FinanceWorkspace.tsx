import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Landmark, 
  BookOpen, 
  List, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw,
  Sparkles,
  Bot,
  UploadCloud,
  ShieldCheck,
  Award,
  Layers,
  Activity,
  ChevronDown
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { FinOrganization, FinLegalEntity, FinPeriod } from './types';
import { GeneralLedger } from './gl/GeneralLedger';
import { ChartOfAccounts } from './coa/ChartOfAccounts';
import { JournalEntryViewer } from './journal/JournalEntryViewer';
import { InvoicesView } from './ar/InvoicesView';
import { BillsView } from './ap/BillsView';
import { IntegrityDashboard } from './integrity/IntegrityDashboard';
import { ContractsView } from './revenue/ContractsView';
import { RevenueSchedulesView } from './revenue/RevenueSchedulesView';
import { BankAccountsView } from './banking/BankAccountsView';
import { ReconciliationView } from './banking/ReconciliationView';
import { CashForecastView } from './banking/CashForecastView';
import { MonthEndCloseView } from './close/MonthEndCloseView';
import { FinancialStatementsView } from './reporting/FinancialStatementsView';
import { CFOBriefingView } from './reporting/CFOBriefingView';
import { FinanceAgentWorkspace } from './ai/FinanceAgentWorkspace';
import { StrategicScenarioView } from './simulation/StrategicScenarioView';
import { CFOCommandCenter } from './command/CFOCommandCenter';
import { ParallelPilotDashboard } from './pilot/ParallelPilotDashboard';
import { ScenarioComparisonMatrixView } from './simulation/ScenarioComparisonMatrixView';
import { FinancialTruthReconcilerView } from './certification/FinancialTruthReconcilerView';
import { ShadowPilotCertificationView } from './pilot_certification/ShadowPilotCertificationView';
import { FinancialImportWizard } from './importer/FinancialImportWizard';
import { FinanceHealthDashboard } from './observability/FinanceHealthDashboard';

const DEFAULT_FIN_ORG: FinOrganization = {
  id: 'fin-org-default-001',
  sys_organization_id: 'sys-org-001',
  legal_name: 'TalentXcel Services Private Limited',
  timezone: 'Asia/Kolkata',
  fiscal_year_start_month: 4,
  fiscal_year_start_day: 1,
  base_currency: 'INR',
  reporting_currency: 'INR',
  multi_currency_enabled: true,
  accounting_standard: 'IFRS',
  approval_threshold_amount: 100000,
  approval_threshold_currency: 'INR',
  mandatory_hitl_operations: [
    'payment_initiation',
    'bank_account_change',
    'accounting_policy_change',
    'closed_period_posting',
    'revenue_recognition_override',
    'tax_adjustment',
    'write_off'
  ],
  settings: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const DEFAULT_ENTITIES: FinLegalEntity[] = [
  {
    id: 'ent-hq-001',
    fin_organization_id: 'fin-org-default-001',
    legal_name: 'TalentXcel Services Pvt Ltd (HQ India)',
    entity_code: 'TXCEL-HQ',
    jurisdiction: 'IN',
    registration_number: 'U72900KA2024PTC189000',
    functional_currency: 'INR',
    accounting_standard: 'IFRS',
    is_consolidating: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ent-us-002',
    fin_organization_id: 'fin-org-default-001',
    legal_name: 'TalentXcel Inc (US Entity)',
    entity_code: 'TXCEL-US',
    jurisdiction: 'US',
    registration_number: 'DE-7890123',
    functional_currency: 'USD',
    accounting_standard: 'US_GAAP',
    is_consolidating: false,
    parent_entity_id: 'ent-hq-001',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_PERIODS: FinPeriod[] = [
  {
    id: 'period-2026-08',
    fin_organization_id: 'fin-org-default-001',
    legal_entity_id: 'ent-hq-001',
    period_name: 'August 2026 (FY26-Q2)',
    period_type: 'MONTH',
    start_date: '2026-08-01',
    end_date: '2026-08-31',
    status: 'OPEN',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'period-2026-07',
    fin_organization_id: 'fin-org-default-001',
    legal_entity_id: 'ent-hq-001',
    period_name: 'July 2026 (FY26-Q2)',
    period_type: 'MONTH',
    start_date: '2026-07-01',
    end_date: '2026-07-31',
    status: 'CLOSED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function FinanceWorkspace() {
  const [finOrg, setFinOrg] = useState<FinOrganization>(DEFAULT_FIN_ORG);
  const [entities, setEntities] = useState<FinLegalEntity[]>(DEFAULT_ENTITIES);
  const [periods, setPeriods] = useState<FinPeriod[]>(DEFAULT_PERIODS);
  const [selectedEntity, setSelectedEntity] = useState<string>(DEFAULT_ENTITIES[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(DEFAULT_PERIODS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('cmd');

  useEffect(() => {
    loadFinanceContext();
  }, []);

  async function loadFinanceContext() {
    try {
      setLoading(true);
      setError(null);

      // Load fin_organization for current user's org if available
      const { data: orgData, error: orgErr } = await supabase
        .from('fin_organizations')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (orgData) {
        setFinOrg(orgData);

        // Load legal entities
        const { data: entityData } = await supabase
          .from('fin_legal_entities')
          .select('*')
          .eq('fin_organization_id', orgData.id)
          .eq('is_active', true)
          .order('entity_code');
        if (entityData && entityData.length > 0) {
          setEntities(entityData);
          setSelectedEntity(entityData[0].id);
        }

        // Load open periods
        const { data: periodData } = await supabase
          .from('fin_periods')
          .select('*')
          .eq('fin_organization_id', orgData.id)
          .in('status', ['OPEN', 'SOFT_CLOSED'])
          .order('start_date', { ascending: false })
          .limit(24);
        if (periodData && periodData.length > 0) {
          setPeriods(periodData);
          setSelectedPeriod(periodData[0].id);
        }
      } else {
        // Use default enterprise configuration
        setFinOrg(DEFAULT_FIN_ORG);
        setEntities(DEFAULT_ENTITIES);
        setPeriods(DEFAULT_PERIODS);
        setSelectedEntity(DEFAULT_ENTITIES[0].id);
        setSelectedPeriod(DEFAULT_PERIODS[0].id);
      }
    } catch (err: any) {
      console.warn('Finance context loading notice:', err.message);
      // Seamlessly fall back to default enterprise configuration
      setFinOrg(DEFAULT_FIN_ORG);
      setEntities(DEFAULT_ENTITIES);
      setPeriods(DEFAULT_PERIODS);
      setSelectedEntity(DEFAULT_ENTITIES[0].id);
      setSelectedPeriod(DEFAULT_PERIODS[0].id);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !finOrg) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mr-2" />
        <span className="text-muted-foreground">Loading financial data...</span>
      </div>
    );
  }

  const currentPeriod = periods.find(p => p.id === selectedPeriod);
  const currentEntity = entities.find(e => e.id === selectedEntity);

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <Landmark className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2 tracking-tight">
              {finOrg?.legal_name} <span className="text-amber-400 font-semibold">— FinanceOS</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {finOrg?.accounting_standard} · {finOrg?.base_currency} Base · {finOrg?.multi_currency_enabled ? 'Multi-Currency Enabled' : 'Single Currency'} · Multi-Entity Consolidating
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Entity selector */}
          {entities.length > 1 && (
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-56 h-8 text-xs bg-slate-900 border-slate-700 text-slate-100 font-medium">
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                {entities.map(e => (
                  <SelectItem key={e.id} value={e.id} className="hover:bg-slate-800 focus:bg-slate-800">
                    <span className="font-mono text-xs text-amber-400 mr-1.5 font-bold">{e.entity_code}</span> {e.legal_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Period selector */}
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48 h-8 text-xs bg-slate-900 border-slate-700 text-slate-100 font-medium">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
              {periods.map(p => (
                <SelectItem key={p.id} value={p.id} className="hover:bg-slate-800 focus:bg-slate-800">
                  <span className="flex items-center gap-1.5">
                    {p.period_name}
                    <Badge variant={p.status === 'OPEN' ? 'default' : 'secondary'} className={`text-[10px] px-1.5 py-0 ml-1 ${p.status === 'OPEN' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-700 text-slate-300'}`}>
                      {p.status}
                    </Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadFinanceContext} className="h-8 border-slate-700 hover:bg-slate-800 text-slate-200">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Period status warning */}
      {currentPeriod?.status === 'SOFT_CLOSED' && (
        <div className="px-4 py-2 bg-yellow-950/40 border-b border-yellow-800/60 text-yellow-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
          Period <strong>{currentPeriod.period_name}</strong> is SOFT-CLOSED. Only adjustment entries allowed.
        </div>
      )}

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Compact Grouped Navigation Bar */}
          <div className="mx-3.5 mt-2.5 pb-2 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              {/* 1. EXECUTIVE */}
              <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-1 rounded-lg border border-slate-800 shadow-sm">
                <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider px-1">Executive</span>
                <TabsList className="bg-transparent h-6 p-0 gap-0.5">
                  <TabsTrigger value="cmd" className="text-xs h-6 px-2 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><Sparkles className="w-3 h-3 text-amber-400 data-[state=active]:text-slate-950" />Command Center</TabsTrigger>
                  <TabsTrigger value="copilot" className="text-xs h-6 px-2 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><Bot className="w-3 h-3 text-sky-400 data-[state=active]:text-slate-950" />AI Copilot</TabsTrigger>
                  <TabsTrigger value="simulator" className="text-xs h-6 px-2 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><TrendingUp className="w-3 h-3 text-emerald-400 data-[state=active]:text-slate-950" />Simulator</TabsTrigger>
                  <TabsTrigger value="matrix" className="text-xs h-6 px-2 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><Layers className="w-3 h-3 text-purple-400 data-[state=active]:text-slate-950" />Matrix</TabsTrigger>
                </TabsList>
              </div>

              {/* 2. ACCOUNTING */}
              <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-1 rounded-lg border border-slate-800 shadow-sm">
                <span className="text-[9px] font-extrabold text-sky-400 uppercase tracking-wider px-1">Accounting</span>
                <TabsList className="bg-transparent h-6 p-0 gap-0.5">
                  <TabsTrigger value="gl" className="text-xs h-6 px-1.5 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-sky-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><BookOpen className="w-3 h-3 text-sky-400 data-[state=active]:text-slate-950" />GL</TabsTrigger>
                  <TabsTrigger value="coa" className="text-xs h-6 px-1.5 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-sky-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><List className="w-3 h-3 text-sky-400 data-[state=active]:text-slate-950" />COA</TabsTrigger>
                  <TabsTrigger value="journal" className="text-xs h-6 px-1.5 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-sky-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><FileText className="w-3 h-3 text-sky-400 data-[state=active]:text-slate-950" />Journal</TabsTrigger>
                  <TabsTrigger value="ar" className="text-xs h-6 px-1.5 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-sky-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><FileText className="w-3 h-3 text-sky-400 data-[state=active]:text-slate-950" />Invoices</TabsTrigger>
                  <TabsTrigger value="ap" className="text-xs h-6 px-1.5 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-sky-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><FileText className="w-3 h-3 text-sky-400 data-[state=active]:text-slate-950" />Bills</TabsTrigger>
                  <TabsTrigger value="contracts" className="text-xs h-6 px-1.5 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-sky-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><FileText className="w-3 h-3 text-sky-400 data-[state=active]:text-slate-950" />Contracts</TabsTrigger>
                  <TabsTrigger value="schedules" className="text-xs h-6 px-1.5 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-sky-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><TrendingUp className="w-3 h-3 text-sky-400 data-[state=active]:text-slate-950" />Recognition</TabsTrigger>
                </TabsList>
              </div>

              {/* 3. CASH & BANKING */}
              <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-1 rounded-lg border border-slate-800 shadow-sm">
                <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider px-1">Cash & Banking</span>
                <TabsList className="bg-transparent h-6 p-0 gap-0.5">
                  <TabsTrigger value="banking" className="text-xs h-6 px-2 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><Landmark className="w-3 h-3 text-emerald-400 data-[state=active]:text-slate-950" />Banking</TabsTrigger>
                  <TabsTrigger value="reconciliation" className="text-xs h-6 px-2 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><Sparkles className="w-3 h-3 text-emerald-400 data-[state=active]:text-slate-950" />Reconciliation</TabsTrigger>
                  <TabsTrigger value="forecast" className="text-xs h-6 px-2 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><TrendingUp className="w-3 h-3 text-emerald-400 data-[state=active]:text-slate-950" />Forecast</TabsTrigger>
                </TabsList>
              </div>

              {/* 4. CLOSE & REPORTING */}
              <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-1 rounded-lg border border-slate-800 shadow-sm">
                <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-wider px-1">Close & Reporting</span>
                <TabsList className="bg-transparent h-6 p-0 gap-0.5">
                  <TabsTrigger value="close" className="text-xs h-6 px-2 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-purple-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><ShieldCheck className="w-3 h-3 text-purple-400 data-[state=active]:text-slate-950" />Close</TabsTrigger>
                  <TabsTrigger value="statements" className="text-xs h-6 px-2 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-purple-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><FileText className="w-3 h-3 text-purple-400 data-[state=active]:text-slate-950" />Statements</TabsTrigger>
                  <TabsTrigger value="cfo" className="text-xs h-6 px-2 gap-1 font-medium text-slate-300 hover:text-white data-[state=active]:bg-purple-500 data-[state=active]:text-slate-950 data-[state=active]:font-bold transition-all"><Sparkles className="w-3 h-3 text-purple-400 data-[state=active]:text-slate-950" />CFO Briefing</TabsTrigger>
                </TabsList>
              </div>

              {/* 5. TRUST & CONTROL ▾ */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-7 text-xs px-2.5 gap-1.5 border-slate-800 bg-slate-900/90 font-medium ${
                      ['integrity', 'reconciler', 'pilot', 'cert', 'health'].includes(activeTab)
                        ? 'bg-indigo-600 text-white font-bold border-indigo-500'
                        : 'text-indigo-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    Trust &amp; Control
                    <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-700 text-slate-100 text-xs shadow-lg">
                  <DropdownMenuItem onClick={() => setActiveTab('integrity')} className="gap-2 cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                    <Landmark className="w-3.5 h-3.5 text-indigo-400" /> Control Center
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('reconciler')} className="gap-2 cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> Truth Reconciler
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('pilot')} className="gap-2 cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Parallel Pilot
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('cert')} className="gap-2 cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                    <Award className="w-3.5 h-3.5 text-indigo-400" /> Pilot Certification
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('health')} className="gap-2 cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" /> System Health
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 6. PRODUCTION ▾ */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-7 text-xs px-2.5 gap-1.5 border-slate-800 bg-slate-900/90 font-medium ${
                      activeTab === 'wizard'
                        ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                        : 'text-emerald-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                    Production
                    <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-700 text-slate-100 text-xs shadow-lg">
                  <DropdownMenuItem onClick={() => setActiveTab('wizard')} className="gap-2 cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-400" /> Import Wizard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="cmd" className="mt-0">
              <CFOCommandCenter />
            </TabsContent>
            <TabsContent value="wizard" className="mt-0">
              <FinancialImportWizard />
            </TabsContent>
            <TabsContent value="health" className="mt-0">
              <FinanceHealthDashboard />
            </TabsContent>
            <TabsContent value="cert" className="mt-0">
              <ShadowPilotCertificationView />
            </TabsContent>
            <TabsContent value="reconciler" className="mt-0">
              <FinancialTruthReconcilerView />
            </TabsContent>
            <TabsContent value="pilot" className="mt-0">
              <ParallelPilotDashboard />
            </TabsContent>
            <TabsContent value="matrix" className="mt-0">
              <ScenarioComparisonMatrixView />
            </TabsContent>
            <TabsContent value="overview" className="mt-0">
              <FinanceOverview finOrg={finOrg} entities={entities} periods={periods} />
            </TabsContent>
            <TabsContent value="gl" className="mt-0 h-full">
              {selectedEntity && selectedPeriod ? (
                <GeneralLedger
                  finOrganizationId={finOrg!.id}
                  legalEntityId={selectedEntity}
                  periodId={selectedPeriod}
                  reportingCurrency={finOrg!.reporting_currency}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">Select an entity and period to view the ledger.</div>
              )}
            </TabsContent>
            <TabsContent value="coa" className="mt-0">
              {finOrg && (
                <ChartOfAccounts
                  finOrganizationId={finOrg.id}
                  accountingStandard={finOrg.accounting_standard}
                />
              )}
            </TabsContent>
            <TabsContent value="journal" className="mt-0">
              {finOrg && selectedEntity && (
                <JournalEntryViewer
                  finOrganizationId={finOrg.id}
                  legalEntityId={selectedEntity}
                  periodId={selectedPeriod}
                />
              )}
            </TabsContent>
            <TabsContent value="ar" className="mt-0">
              {finOrg && selectedEntity && (
                <InvoicesView
                  finOrganizationId={finOrg.id}
                  legalEntityId={selectedEntity}
                />
              )}
            </TabsContent>
            <TabsContent value="ap" className="mt-0">
              {finOrg && selectedEntity && (
                <BillsView
                  finOrganizationId={finOrg.id}
                  legalEntityId={selectedEntity}
                />
              )}
            </TabsContent>
            <TabsContent value="contracts" className="mt-0">
              {finOrg && selectedEntity && (
                <ContractsView
                  finOrganizationId={finOrg.id}
                  legalEntityId={selectedEntity}
                />
              )}
            </TabsContent>
            <TabsContent value="schedules" className="mt-0">
              {finOrg && (
                <RevenueSchedulesView
                  finOrganizationId={finOrg.id}
                />
              )}
            </TabsContent>
            <TabsContent value="banking" className="mt-0">
              {finOrg && selectedEntity && (
                <BankAccountsView
                  finOrganizationId={finOrg.id}
                  legalEntityId={selectedEntity}
                />
              )}
            </TabsContent>
            <TabsContent value="reconciliation" className="mt-0">
              {finOrg && (
                <ReconciliationView
                  finOrganizationId={finOrg.id}
                />
              )}
            </TabsContent>
            <TabsContent value="forecast" className="mt-0">
              {finOrg && (
                <CashForecastView
                  finOrganizationId={finOrg.id}
                />
              )}
            </TabsContent>
            <TabsContent value="close" className="mt-0">
              {finOrg && selectedEntity && selectedPeriod && (
                <MonthEndCloseView
                  finOrganizationId={finOrg.id}
                  legalEntityId={selectedEntity}
                  periodId={selectedPeriod}
                />
              )}
            </TabsContent>
            <TabsContent value="statements" className="mt-0">
              {finOrg && selectedEntity && selectedPeriod && (
                <FinancialStatementsView
                  finOrganizationId={finOrg.id}
                  legalEntityId={selectedEntity}
                  periodId={selectedPeriod}
                />
              )}
            </TabsContent>
            <TabsContent value="cfo" className="mt-0">
              <CFOBriefingView />
            </TabsContent>
            <TabsContent value="copilot" className="mt-0">
              <FinanceAgentWorkspace />
            </TabsContent>
            <TabsContent value="simulator" className="mt-0">
              <StrategicScenarioView />
            </TabsContent>
            <TabsContent value="integrity" className="mt-0">
              {finOrg && (
                <IntegrityDashboard
                  finOrganizationId={finOrg.id}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// ── Overview summary cards ──────────────────────────────────

function FinanceOverview({ finOrg, entities, periods }: {
  finOrg: FinOrganization | null;
  entities: FinLegalEntity[];
  periods: FinPeriod[];
}) {
  const openPeriods = periods.filter(p => p.status === 'OPEN').length;
  const softClosedPeriods = periods.filter(p => p.status === 'SOFT_CLOSED').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Legal Entities</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{entities.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Open Periods</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{openPeriods}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Soft-Closed Periods</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-yellow-600">{softClosedPeriods}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Accounting Standard</CardTitle></CardHeader>
          <CardContent><Badge variant="outline" className="text-sm font-bold">{finOrg?.accounting_standard}</Badge></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Legal Entities</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entities.map(e => (
              <div key={e.id} className="flex items-center justify-between p-2 rounded border text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">{e.entity_code}</Badge>
                  <span>{e.legal_name}</span>
                  {e.is_consolidating && <Badge className="text-xs bg-purple-100 text-purple-700">Consolidating</Badge>}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{e.functional_currency}</span>
                  <span>·</span>
                  <span>{e.jurisdiction}</span>
                  <span>·</span>
                  <span>{e.accounting_standard}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Approval Configuration</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <p>Threshold: <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: finOrg?.approval_threshold_currency ?? 'INR' }).format(finOrg?.approval_threshold_amount ?? 100000)}</strong></p>
            <p className="text-xs text-muted-foreground mt-2">Always requires human approval:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(finOrg?.mandatory_hitl_operations ?? []).map(op => (
                <Badge key={op} variant="secondary" className="text-xs">{op.replace(/_/g, ' ')}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FinanceWorkspace;
