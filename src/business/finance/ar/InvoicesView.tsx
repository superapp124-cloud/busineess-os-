import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, ArrowUpRight, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../types';
import { ARSubledger } from '../subledgers/ARSubledger';

interface InvoicesViewProps {
  finOrganizationId: string;
  legalEntityId: string;
}

export function InvoicesView({ finOrganizationId, legalEntityId }: InvoicesViewProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('fin_invoices')
      .select('*, customer:fin_customers(name, customer_code)')
      .eq('fin_organization_id', finOrganizationId)
      .eq('legal_entity_id', legalEntityId)
      .order('issue_date', { ascending: false });

    if (statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    setInvoices(data || []);
    setLoading(false);
  }, [finOrganizationId, legalEntityId, statusFilter]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Compute Aging Summary
  const agingSummary = {
    current: 0,
    oneToThirty: 0,
    thirtyOneToSixty: 0,
    sixtyOneToNinety: 0,
    ninetyPlus: 0,
    totalOutstanding: 0,
  };

  invoices.forEach(inv => {
    if (['ISSUED', 'PARTIALLY_PAID'].includes(inv.status)) {
      const due = Number(inv.amount_due) || 0;
      agingSummary.totalOutstanding += due;
      const bucket = ARSubledger.getAgingBucket(inv.due_date);
      if (bucket === 'CURRENT') agingSummary.current += due;
      else if (bucket === '1_30') agingSummary.oneToThirty += due;
      else if (bucket === '31_60') agingSummary.thirtyOneToSixty += due;
      else if (bucket === '61_90') agingSummary.sixtyOneToNinety += due;
      else agingSummary.ninetyPlus += due;
    }
  });

  const filtered = invoices.filter(inv => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      inv.invoice_number.toLowerCase().includes(s) ||
      (inv.customer?.name && inv.customer.name.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-4">
      {/* Aging KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="p-3 bg-amber-50/50 border-amber-200">
          <p className="text-[11px] text-amber-800 font-medium">Total AR Outstanding</p>
          <p className="text-sm font-bold font-mono text-amber-900 mt-1">
            {formatCurrency(agingSummary.totalOutstanding, 'INR')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">Current (Not Due)</p>
          <p className="text-sm font-bold font-mono text-green-700 mt-1">
            {formatCurrency(agingSummary.current, 'INR')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">1-30 Days</p>
          <p className="text-sm font-bold font-mono text-yellow-700 mt-1">
            {formatCurrency(agingSummary.oneToThirty, 'INR')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">31-60 Days</p>
          <p className="text-sm font-bold font-mono text-orange-700 mt-1">
            {formatCurrency(agingSummary.thirtyOneToSixty, 'INR')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">61-90 Days</p>
          <p className="text-sm font-bold font-mono text-red-600 mt-1">
            {formatCurrency(agingSummary.sixtyOneToNinety, 'INR')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">90+ Days (High Risk)</p>
          <p className="text-sm font-bold font-mono text-destructive mt-1">
            {formatCurrency(agingSummary.ninetyPlus, 'INR')}
          </p>
        </Card>
      </div>

      {/* Filter and Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-xs w-64"
              placeholder="Search invoice # or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ISSUED">Issued (Unpaid)</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
              <SelectItem value="PAID">Fully Paid</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="VOID">Void</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="sm" onClick={loadInvoices}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Invoices List Table */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {filtered.length} invoices</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Invoice #</th>
                  <th className="text-left py-2 px-3 font-medium">Customer</th>
                  <th className="text-left py-2 px-3 font-medium">Issue Date</th>
                  <th className="text-left py-2 px-3 font-medium">Due Date</th>
                  <th className="text-right py-2 px-3 font-medium">Total</th>
                  <th className="text-right py-2 px-3 font-medium">Amount Due</th>
                  <th className="text-center py-2 px-3 font-medium">Aging</th>
                  <th className="text-center py-2 px-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map(inv => {
                  const aging = ARSubledger.getAgingBucket(inv.due_date);
                  const isOverdue = aging !== 'CURRENT' && ['ISSUED', 'PARTIALLY_PAID'].includes(inv.status);

                  return (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                        {inv.invoice_number}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-foreground">{inv.customer?.name || 'Customer'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {inv.issue_date}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                          {inv.due_date}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">
                        {formatCurrency(inv.total, inv.currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                        {formatCurrency(inv.amount_due, inv.currency)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1 py-0 ${
                            aging === 'CURRENT' ? 'text-green-700 bg-green-50' :
                            aging === '1_30' ? 'text-yellow-700 bg-yellow-50' :
                            aging === '31_60' ? 'text-orange-700 bg-orange-50' :
                            'text-destructive bg-red-50'
                          }`}
                        >
                          {aging.replace('_', '-')}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge
                          variant={
                            inv.status === 'PAID' ? 'default' :
                            inv.status === 'PARTIALLY_PAID' ? 'secondary' :
                            inv.status === 'ISSUED' ? 'outline' : 'secondary'
                          }
                          className="text-[10px] px-1.5 py-0 capitalize"
                        >
                          {inv.status.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No invoices found in AR subledger.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
