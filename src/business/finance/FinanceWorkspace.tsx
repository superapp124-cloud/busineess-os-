import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Landmark, BookOpen, List, FileText, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

export function FinanceWorkspace() {
  const { user } = useAuth();
  const [finOrg, setFinOrg] = useState<FinOrganization | null>(null);
  const [entities, setEntities] = useState<FinLegalEntity[]>([]);
  const [periods, setPeriods] = useState<FinPeriod[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadFinanceContext();
  }, []);

  async function loadFinanceContext() {
    try {
      setLoading(true);
      setError(null);

      // Load fin_organization for current user's org
      const { data: orgData } = await supabase
        .from('fin_organizations')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!orgData) {
        setError('No financial organization configured. Please run the FinanceOS setup.');
        return;
      }
      setFinOrg(orgData);

      // Load legal entities
      const { data: entityData } = await supabase
        .from('fin_legal_entities')
        .select('*')
        .eq('fin_organization_id', orgData.id)
        .eq('is_active', true)
        .order('entity_code');
      setEntities(entityData || []);
      if (entityData && entityData.length > 0) setSelectedEntity(entityData[0].id);

      // Load open periods
      const { data: periodData } = await supabase
        .from('fin_periods')
        .select('*')
        .eq('fin_organization_id', orgData.id)
        .in('status', ['OPEN', 'SOFT_CLOSED'])
        .order('start_date', { ascending: false })
        .limit(24);
      setPeriods(periodData || []);
      if (periodData && periodData.length > 0) setSelectedPeriod(periodData[0].id);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mr-2" />
        <span className="text-muted-foreground">Loading financial data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <p className="text-destructive text-sm max-w-md text-center">{error}</p>
        <Button variant="outline" onClick={loadFinanceContext}>Retry</Button>
      </div>
    );
  }

  const currentPeriod = periods.find(p => p.id === selectedPeriod);
  const currentEntity = entities.find(e => e.id === selectedEntity);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <Landmark className="w-6 h-6 text-amber-500" />
          <div>
            <h1 className="text-lg font-semibold">{finOrg?.legal_name} — FinanceOS</h1>
            <p className="text-xs text-muted-foreground">
              {finOrg?.accounting_standard} · {finOrg?.base_currency} base · {finOrg?.multi_currency_enabled ? 'Multi-currency' : 'Single currency'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Entity selector */}
          {entities.length > 1 && (
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-48 h-8 text-xs">
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map(e => (
                  <SelectItem key={e.id} value={e.id}>
                    <span className="font-mono text-xs mr-1">{e.entity_code}</span> {e.legal_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Period selector */}
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-1">
                    {p.period_name}
                    <Badge variant={p.status === 'OPEN' ? 'default' : 'secondary'} className="text-[10px] px-1 py-0 ml-1">
                      {p.status}
                    </Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={loadFinanceContext}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Period status warning */}
      {currentPeriod?.status === 'SOFT_CLOSED' && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-3 h-3" />
          Period <strong>{currentPeriod.period_name}</strong> is SOFT-CLOSED. Only adjustment entries allowed.
        </div>
      )}

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4 w-fit">
            <TabsTrigger value="overview" className="text-xs gap-1"><TrendingUp className="w-3 h-3" />Overview</TabsTrigger>
            <TabsTrigger value="gl" className="text-xs gap-1"><BookOpen className="w-3 h-3" />General Ledger</TabsTrigger>
            <TabsTrigger value="coa" className="text-xs gap-1"><List className="w-3 h-3" />Chart of Accounts</TabsTrigger>
            <TabsTrigger value="journal" className="text-xs gap-1"><FileText className="w-3 h-3" />Journal Entries</TabsTrigger>
            <TabsTrigger value="ar" className="text-xs gap-1"><FileText className="w-3 h-3" />Invoices (AR)</TabsTrigger>
            <TabsTrigger value="ap" className="text-xs gap-1"><FileText className="w-3 h-3" />Bills (AP)</TabsTrigger>
            <TabsTrigger value="contracts" className="text-xs gap-1"><FileText className="w-3 h-3" />Contracts (ASC 606)</TabsTrigger>
            <TabsTrigger value="schedules" className="text-xs gap-1"><TrendingUp className="w-3 h-3" />Recognition</TabsTrigger>
            <TabsTrigger value="banking" className="text-xs gap-1"><Landmark className="w-3 h-3" />Banking</TabsTrigger>
            <TabsTrigger value="reconciliation" className="text-xs gap-1"><Sparkles className="w-3 h-3" />Reconciliation</TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs gap-1"><TrendingUp className="w-3 h-3" />Cash Forecast</TabsTrigger>
            <TabsTrigger value="close" className="text-xs gap-1"><ShieldCheck className="w-3 h-3" />Month-End Close</TabsTrigger>
            <TabsTrigger value="statements" className="text-xs gap-1"><FileText className="w-3 h-3" />Statements</TabsTrigger>
            <TabsTrigger value="cfo" className="text-xs gap-1"><Sparkles className="w-3 h-3" />CFO Briefing</TabsTrigger>
            <TabsTrigger value="copilot" className="text-xs gap-1"><Bot className="w-3 h-3" />AI Copilot & Risks</TabsTrigger>
            <TabsTrigger value="simulator" className="text-xs gap-1"><TrendingUp className="w-3 h-3" />Strategic Simulator</TabsTrigger>
            <TabsTrigger value="integrity" className="text-xs gap-1"><Landmark className="w-3 h-3" />Control Center</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto p-4">
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
