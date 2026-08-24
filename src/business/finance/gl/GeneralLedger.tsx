import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { FinLedgerBalance, AccountType } from '../types';
import { formatCurrency, accountTypeColor } from '../types';

interface GeneralLedgerProps {
  finOrganizationId: string;
  legalEntityId: string;
  periodId: string;
  reportingCurrency: string;
}

const ACCOUNT_TYPE_ORDER: AccountType[] = ['ASSET','CONTRA_ASSET','LIABILITY','CONTRA_LIABILITY','EQUITY','REVENUE','CONTRA_REVENUE','EXPENSE','CONTRA_EXPENSE'];

export function GeneralLedger({ finOrganizationId, legalEntityId, periodId, reportingCurrency }: GeneralLedgerProps) {
  const [balances, setBalances] = useState<FinLedgerBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('fin_ledger_balances')
      .select('*')
      .eq('fin_organization_id', finOrganizationId)
      .eq('legal_entity_id', legalEntityId)
      .eq('period_id', periodId)
      .order('account_code');
    setBalances(data || []);
    setLoading(false);
  }, [finOrganizationId, legalEntityId, periodId]);

  useEffect(() => { load(); }, [load]);

  const filtered = balances.filter(b =>
    !search || b.account_code.toLowerCase().includes(search.toLowerCase()) || b.account_name.toLowerCase().includes(search.toLowerCase())
  );

  const byType = ACCOUNT_TYPE_ORDER.reduce<Record<string, FinLedgerBalance[]>>((acc, t) => {
    acc[t] = filtered.filter(b => b.account_type === t);
    return acc;
  }, {} as Record<string, FinLedgerBalance[]>);

  const totalsByType: Record<string, number> = {};
  ACCOUNT_TYPE_ORDER.forEach(t => {
    totalsByType[t] = byType[t].reduce((s, b) => s + b.reporting_net_balance, 0);
  });

  const totalAssets = (totalsByType['ASSET'] ?? 0) - (totalsByType['CONTRA_ASSET'] ?? 0);
  const totalLiabilities = (totalsByType['LIABILITY'] ?? 0) - (totalsByType['CONTRA_LIABILITY'] ?? 0);
  const totalEquity = totalsByType['EQUITY'] ?? 0;
  const totalRevenue = (totalsByType['REVENUE'] ?? 0) - (totalsByType['CONTRA_REVENUE'] ?? 0);
  const totalExpenses = (totalsByType['EXPENSE'] ?? 0) - (totalsByType['CONTRA_EXPENSE'] ?? 0);
  const netIncome = totalRevenue - totalExpenses;

  function toggleSection(type: string) {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function NetBadge({ amount, normalBalance }: { amount: number; normalBalance: string }) {
    const isNormal = normalBalance === 'DEBIT' ? amount >= 0 : amount <= 0;
    const display = Math.abs(amount);
    return (
      <span className={`flex items-center gap-1 text-xs font-mono ${isNormal ? 'text-foreground' : 'text-destructive'}`}>
        {amount > 0 ? <TrendingUp className="w-3 h-3" /> : amount < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
        {formatCurrency(display, reportingCurrency)}
        {!isNormal && <Badge variant="destructive" className="text-[9px] px-1 py-0">abnormal</Badge>}
      </span>
    );
  }

  if (loading) return <div className="flex justify-center py-8"><RefreshCw className="animate-spin w-5 h-5 text-amber-500" /></div>;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Assets', value: totalAssets, color: 'blue' },
          { label: 'Total Liabilities', value: totalLiabilities, color: 'red' },
          { label: 'Total Equity', value: totalEquity, color: 'purple' },
          { label: 'Revenue', value: totalRevenue, color: 'green' },
          { label: 'Net Income', value: netIncome, color: netIncome >= 0 ? 'green' : 'red' },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-sm font-bold font-mono mt-1 ${s.value < 0 ? 'text-destructive' : ''}`}>
              {formatCurrency(Math.abs(s.value), reportingCurrency)}
              {s.value < 0 && <span className="text-[10px] font-normal ml-1">(Dr)</span>}
            </p>
          </Card>
        ))}
      </div>

      {/* Ledger table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Account Balances</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1.5 w-3 h-3 text-muted-foreground" />
                <Input className="pl-7 h-7 text-xs w-48" placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Button variant="ghost" size="sm" onClick={load}><RefreshCw className="w-3 h-3" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-medium">Account</th>
                  <th className="text-right p-2 font-medium">Debits</th>
                  <th className="text-right p-2 font-medium">Credits</th>
                  <th className="text-right p-2 font-medium">Net Balance</th>
                  <th className="text-right p-2 font-medium">Entries</th>
                </tr>
              </thead>
              <tbody>
                {ACCOUNT_TYPE_ORDER.filter(t => byType[t].length > 0).map(type => (
                  <React.Fragment key={type}>
                    {/* Section header */}
                    <tr className="bg-muted/30 cursor-pointer hover:bg-muted/50" onClick={() => toggleSection(type)}>
                      <td colSpan={5} className="p-2 font-semibold">
                        <div className="flex items-center gap-1">
                          {collapsed.has(type) ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          <Badge className={`text-[10px] px-1.5 py-0 bg-${accountTypeColor(type as AccountType)}-100 text-${accountTypeColor(type as AccountType)}-700`}>{type}</Badge>
                          <span className="ml-1 text-muted-foreground font-normal text-[10px]">({byType[type].length} accounts)</span>
                          <span className="ml-auto font-mono text-xs">{formatCurrency(Math.abs(totalsByType[type]), reportingCurrency)}</span>
                        </div>
                      </td>
                    </tr>
                    {!collapsed.has(type) && byType[type].map(b => (
                      <tr key={`${b.account_id}-${b.currency}`} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                        <td className="p-2">
                          <span className="font-mono text-[10px] text-muted-foreground mr-1">{b.account_code}</span>
                          {b.account_name}
                          {b.currency !== reportingCurrency && <Badge variant="outline" className="text-[9px] ml-1 px-1 py-0">{b.currency}</Badge>}
                        </td>
                        <td className="p-2 text-right font-mono">{formatCurrency(b.reporting_total_debit, reportingCurrency)}</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(b.reporting_total_credit, reportingCurrency)}</td>
                        <td className="p-2 text-right"><NetBadge amount={b.reporting_net_balance} normalBalance={b.normal_balance} /></td>
                        <td className="p-2 text-right text-muted-foreground">{b.entry_count}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No posted entries for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
