import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, FileText, Sparkles, Layers, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../types';

interface ContractsViewProps {
  finOrganizationId: string;
  legalEntityId: string;
}

export function ContractsView({ finOrganizationId, legalEntityId }: ContractsViewProps) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [obligations, setObligations] = useState<any[]>([]);

  const loadContracts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('fin_contracts')
      .select('*, customer:fin_customers(name, customer_code)')
      .eq('fin_organization_id', finOrganizationId)
      .eq('legal_entity_id', legalEntityId)
      .order('start_date', { ascending: false });

    setContracts(data || []);
    setLoading(false);
  }, [finOrganizationId, legalEntityId]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  async function openContractDetails(contract: any) {
    setSelectedContract(contract);
    const { data } = await supabase
      .from('fin_performance_obligations')
      .select('*, revenue_account:fin_accounts!revenue_account_id(code, name)')
      .eq('contract_id', contract.id)
      .order('obligation_number');

    setObligations(data || []);
  }

  // KPI Calculations
  const totalContractValue = contracts.reduce((s, c) => s + (Number(c.transaction_price) || 0), 0);
  const totalRecognized = contracts.reduce((s, c) => s + (Number(c.recognized_revenue) || 0), 0);
  const totalDeferred = contracts.reduce((s, c) => s + (Number(c.deferred_revenue) || 0), 0);

  const filtered = contracts.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.contract_number.toLowerCase().includes(s) ||
      c.title.toLowerCase().includes(s) ||
      (c.customer?.name && c.customer.name.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 bg-purple-50/50 border-purple-200">
          <p className="text-[11px] text-purple-900 font-medium">Total Contracted Value</p>
          <p className="text-sm font-bold font-mono text-purple-950 mt-1">
            {formatCurrency(totalContractValue, 'INR')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">Recognized Revenue (MTD/YTD)</p>
          <p className="text-sm font-bold font-mono text-green-700 mt-1">
            {formatCurrency(totalRecognized, 'INR')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">Deferred Revenue Liability</p>
          <p className="text-sm font-bold font-mono text-amber-700 mt-1">
            {formatCurrency(totalDeferred, 'INR')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">Active ASC 606 Contracts</p>
          <p className="text-sm font-bold font-mono text-foreground mt-1">
            {contracts.filter(c => c.status === 'ACTIVE').length} contracts
          </p>
        </Card>
      </div>

      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-xs w-64"
              placeholder="Search contract #, customer, title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={loadContracts}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {filtered.length} revenue contracts</span>
            <span>Standard: <strong>ASC 606 / IFRS 15</strong></span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Contract #</th>
                  <th className="text-left py-2 px-3 font-medium">Title & Customer</th>
                  <th className="text-left py-2 px-3 font-medium">Term</th>
                  <th className="text-right py-2 px-3 font-medium">Total Value</th>
                  <th className="text-right py-2 px-3 font-medium">Recognized</th>
                  <th className="text-right py-2 px-3 font-medium">Deferred</th>
                  <th className="text-center py-2 px-3 font-medium">Status</th>
                  <th className="text-right py-2 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map(ctr => (
                  <tr key={ctr.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                      {ctr.contract_number}
                      {ctr.ai_interpreted && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-1.5 bg-purple-50 text-purple-700">
                          AI
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground">{ctr.title}</div>
                      <div className="text-[11px] text-muted-foreground">{ctr.customer?.name || 'Customer'}</div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {ctr.start_date} → {ctr.end_date}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {formatCurrency(ctr.transaction_price, ctr.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-green-700">
                      {formatCurrency(ctr.recognized_revenue, ctr.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-amber-700">
                      {formatCurrency(ctr.deferred_revenue, ctr.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={
                          ctr.status === 'ACTIVE' ? 'default' :
                          ctr.status === 'COMPLETED' ? 'secondary' : 'outline'
                        }
                        className="text-[10px] px-1.5 py-0 capitalize"
                      >
                        {ctr.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2 gap-1 text-primary"
                        onClick={() => openContractDetails(ctr)}
                      >
                        Obligations
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No revenue contracts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Contract & Obligations Detail Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={open => !open && setSelectedContract(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Contract: {selectedContract?.contract_number} — {selectedContract?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border">
                <div>
                  <span className="text-muted-foreground block">Transaction Price</span>
                  <strong className="text-foreground">{formatCurrency(selectedContract.transaction_price, selectedContract.currency)}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Recognized to Date</span>
                  <strong className="text-green-700">{formatCurrency(selectedContract.recognized_revenue, selectedContract.currency)}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Deferred Liability</span>
                  <strong className="text-amber-700">{formatCurrency(selectedContract.deferred_revenue, selectedContract.currency)}</strong>
                </div>
              </div>

              {/* Performance Obligations */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">ASC 606 Performance Obligations ({obligations.length})</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left p-2 font-medium">Obligation</th>
                        <th className="text-left p-2 font-medium">Method</th>
                        <th className="text-right p-2 font-medium">Allocated Price</th>
                        <th className="text-center p-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {obligations.map(ob => (
                        <tr key={ob.id}>
                          <td className="p-2">
                            <div className="font-medium text-foreground">{ob.title}</div>
                            <div className="text-[10px] text-muted-foreground">{ob.revenue_account?.name}</div>
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className="text-[9px] px-1 py-0">
                              {ob.recognition_method.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-2 text-right font-mono font-medium">
                            {formatCurrency(ob.allocated_price, selectedContract.currency)}
                          </td>
                          <td className="p-2 text-center">
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">
                              {ob.satisfaction_status.toLowerCase().replace('_', ' ')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
