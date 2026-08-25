import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, FileText, CheckCircle2, DollarSign, TrendingUp, Landmark } from 'lucide-react';
import { formatCurrency } from '../types';

interface FinancialStatementsViewProps {
  finOrganizationId: string;
  legalEntityId: string;
  periodId: string;
}

export function FinancialStatementsView({ finOrganizationId, legalEntityId, periodId }: FinancialStatementsViewProps) {
  const [statements, setStatements] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStatements = useCallback(async () => {
    if (!periodId) return;
    setLoading(true);
    const { data } = await supabase.rpc('fin_generate_financial_statements', {
      p_org_id: finOrganizationId,
      p_entity_id: legalEntityId,
      p_period_id: periodId
    });
    setStatements(data);
    setLoading(false);
  }, [finOrganizationId, legalEntityId, periodId]);

  useEffect(() => {
    loadStatements();
  }, [loadStatements]);

  const totalAssets = Number(bs.total_assets || 0);
  const totalLiabilities = Number(bs.total_liabilities || 0);
  const totalEquity = Number(bs.total_equity || 0);
  const totalLiabAndEquity = totalLiabilities + totalEquity;
  const balanceDiff = Math.abs(totalAssets - totalLiabAndEquity);
  const isBalanced = balanceDiff < 0.01;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Management Financial Statements</h2>
          <p className="text-xs text-muted-foreground">IFRS / US GAAP compliant P&L and Balance Sheet</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadStatements} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Tabs defaultValue="pnl" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="pnl" className="text-xs">Income Statement (P&L)</TabsTrigger>
          <TabsTrigger value="bs" className="text-xs">Balance Sheet</TabsTrigger>
        </TabsList>

        {/* P&L Statement */}
        <TabsContent value="pnl" className="mt-3 space-y-3">
          <Card className="p-4">
            <h3 className="text-xs font-bold text-foreground border-b pb-2 mb-3">Profit & Loss Statement</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="font-semibold">Gross Revenue</span>
                <span className="font-mono font-bold text-green-700">{formatCurrency(pnl.total_revenue || 0, 'INR')}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground pl-4">Operating Expenses</span>
                <span className="font-mono text-red-600">({formatCurrency(pnl.operating_expenses || 0, 'INR')})</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 font-bold text-sm bg-muted/20 px-2 rounded">
                <span>Net Income</span>
                <span className="font-mono text-primary">{formatCurrency(pnl.net_income || 0, 'INR')}</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Balance Sheet */}
        <TabsContent value="bs" className="mt-3 space-y-3">
          <Card className="p-4">
            <h3 className="text-xs font-bold text-foreground border-b pb-2 mb-3">Statement of Financial Position (Balance Sheet)</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="font-semibold">Total Assets</span>
                <span className="font-mono font-bold text-foreground">{formatCurrency(totalAssets, 'INR')}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground pl-4">Total Liabilities</span>
                <span className="font-mono text-foreground">{formatCurrency(totalLiabilities, 'INR')}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground pl-4">Total Shareholders' Equity</span>
                <span className="font-mono text-foreground">{formatCurrency(totalEquity, 'INR')}</span>
              </div>
              <div className={`flex justify-between py-2 border-t-2 font-bold text-sm px-2 rounded ${isBalanced ? 'bg-emerald-50/50 text-emerald-800' : 'bg-red-50/50 text-red-800'}`}>
                <span className="flex items-center gap-1.5">
                  {isBalanced ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                  Assets = Liabilities + Equity
                </span>
                <span className="font-mono">
                  {isBalanced ? 'Balanced (Exact match)' : `Imbalance: ₹${balanceDiff.toFixed(2)}`}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

