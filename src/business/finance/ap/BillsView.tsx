import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { formatCurrency } from '../types';

interface BillsViewProps {
  finOrganizationId: string;
  legalEntityId: string;
}

export function BillsView({ finOrganizationId, legalEntityId }: BillsViewProps) {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadBills = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('fin_bills')
      .select('*, vendor:fin_vendors(name, vendor_code)')
      .eq('fin_organization_id', finOrganizationId)
      .eq('legal_entity_id', legalEntityId)
      .order('bill_date', { ascending: false });

    if (statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    setBills(data || []);
    setLoading(false);
  }, [finOrganizationId, legalEntityId, statusFilter]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // Compute AP totals
  const totalAP = bills
    .filter(b => ['APPROVED', 'PARTIALLY_PAID', 'PENDING_APPROVAL'].includes(b.status))
    .reduce((s, b) => s + (Number(b.amount_due) || 0), 0);

  const pendingApprovalCount = bills.filter(b => b.status === 'PENDING_APPROVAL').length;

  const filtered = bills.filter(b => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      b.bill_number.toLowerCase().includes(s) ||
      (b.vendor?.name && b.vendor.name.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-4">
      {/* KPI Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 bg-red-50/40 border-red-200">
          <p className="text-[11px] text-red-800 font-medium">Total AP Outstanding</p>
          <p className="text-sm font-bold font-mono text-red-950 mt-1">
            {formatCurrency(totalAP, 'INR')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">Pending Approval (HITL)</p>
          <p className="text-sm font-bold font-mono text-amber-600 mt-1">
            {pendingApprovalCount} bills
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">Active Vendors</p>
          <p className="text-sm font-bold font-mono text-foreground mt-1">
            {new Set(bills.map(b => b.vendor_id)).size}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">Duplicate Detection</p>
          <div className="flex items-center gap-1 mt-1 text-green-700 font-medium text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active & Guarded</span>
          </div>
        </Card>
      </div>

      {/* Filter and Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-xs w-64"
              placeholder="Search bill # or vendor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              <SelectItem value="APPROVED">Approved (Unpaid)</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
              <SelectItem value="PAID">Fully Paid</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="sm" onClick={loadBills}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Bills List Table */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {filtered.length} vendor bills</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Bill #</th>
                  <th className="text-left py-2 px-3 font-medium">Vendor</th>
                  <th className="text-left py-2 px-3 font-medium">Bill Date</th>
                  <th className="text-left py-2 px-3 font-medium">Due Date</th>
                  <th className="text-right py-2 px-3 font-medium">Total</th>
                  <th className="text-right py-2 px-3 font-medium">Amount Due</th>
                  <th className="text-center py-2 px-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map(bill => (
                  <tr key={bill.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                      {bill.bill_number}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-foreground">{bill.vendor?.name || 'Vendor'}</span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {bill.bill_date}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {bill.due_date}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {formatCurrency(bill.total, bill.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                      {formatCurrency(bill.amount_due, bill.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={
                          bill.status === 'PAID' ? 'default' :
                          bill.status === 'APPROVED' ? 'secondary' :
                          bill.status === 'PENDING_APPROVAL' ? 'outline' :
                          bill.status === 'REJECTED' ? 'destructive' : 'outline'
                        }
                        className={`text-[10px] px-1.5 py-0 capitalize ${
                          bill.status === 'PENDING_APPROVAL' ? 'border-amber-400 text-amber-700 bg-amber-50' : ''
                        }`}
                      >
                        {bill.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No vendor bills found in AP subledger.
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
