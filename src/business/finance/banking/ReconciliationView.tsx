import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, Sparkles, AlertCircle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { formatCurrency } from '../types';
import { ReconciliationWorker } from './ReconciliationWorker';

interface ReconciliationViewProps {
  finOrganizationId: string;
}

export function ReconciliationView({ finOrganizationId }: ReconciliationViewProps) {
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openInvoices, setOpenInvoices] = useState<any[]>([]);

  const loadReconciliationData = useCallback(async () => {
    setLoading(true);
    // 1. Fetch Exceptions
    const { data: excs } = await supabase
      .from('fin_reconciliation_exceptions')
      .select('*, bank_transaction:fin_bank_transactions(*)')
      .eq('status', 'OPEN').eq('fin_organization_id', finOrganizationId /* needs migration */)
      .order('created_at', { ascending: false });

    setExceptions(excs || []);

    // 2. Fetch Recent Matches
    const { data: mData } = await supabase
      .from('fin_reconciliation_matches')
      .select('*, bank_transaction:fin_bank_transactions(*), payment:fin_payments(*)')
      .order('created_at', { ascending: false })
      .limit(20);

    setMatches(mData || []);

    // 3. Fetch Open Invoices for AI Worker Context
    const { data: invs } = await supabase
      .from('fin_invoices')
      .select('id, invoice_number, amount_due, customer:fin_customers(name)')
      .in('status', ['ISSUED', 'PARTIALLY_PAID']);

    setOpenInvoices(
      (invs || []).map(i => ({
        id: i.id,
        invoice_number: i.invoice_number,
        amount_due: Number(i.amount_due),
        customer_name: (i as any).customer?.name || '',
      }))
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    loadReconciliationData();
  }, [loadReconciliationData]);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border bg-gradient-to-r from-blue-500/10 via-background to-background flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/15 rounded-lg border border-blue-500/25">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              AI Reconciliation Worker (Proposal Mode)
            </h2>
            <p className="text-xs text-muted-foreground">
              Automated invoice matching, fee difference detection, and zero-loss ledger settlement proposals.
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={loadReconciliationData}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Exception Queue with AI Proposals */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Unmatched Exceptions Queue ({exceptions.length})
            </CardTitle>
            <span>Requires Human Sign-off</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {exceptions.map(exc => {
            const tx = exc.bank_transaction;
            if (!tx) return null;

            // Generate AI Resolution Proposal on the fly
            const proposal = ReconciliationWorker.proposeResolution(
              {
                id: tx.id,
                amount: Number(tx.amount),
                date: tx.transaction_date,
                description: tx.description,
                reference_number: tx.reference_number,
                transaction_type: tx.transaction_type,
              },
              openInvoices
            );

            return (
              <div key={exc.id} className="p-3 rounded-lg border bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[9px]">
                      {tx.transaction_date}
                    </Badge>
                    <span className="font-semibold text-foreground">{tx.description}</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                </div>

                {/* AI Proposal Card */}
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-md space-y-1.5">
                  <div className="flex items-center justify-between text-blue-900">
                    <span className="font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      AI Interpretation Proposal ({Math.round(proposal.ai_confidence * 100)}% Confidence)
                    </span>
                    <Badge className="text-[9px] bg-blue-100 text-blue-800 border-blue-200">
                      {proposal.proposed_action.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-blue-950/80">{proposal.ai_rationale}</p>
                  {proposal.deducted_fee_amount > 0 && (
                    <div className="text-[11px] text-blue-900 font-mono">
                      Proposed Processor Fee Expense: {formatCurrency(proposal.deducted_fee_amount, tx.currency)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {exceptions.length === 0 && !loading && (
            <div className="py-8 text-center text-muted-foreground space-y-1">
              <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
              <p className="font-medium text-foreground">Exception Queue Clear</p>
              <p className="text-[11px]">All bank movements are synchronized with subledgers.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
