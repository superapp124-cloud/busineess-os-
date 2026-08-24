import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Landmark, RefreshCw, Upload, CheckCircle2, ArrowDownLeft, ArrowUpRight, FileSpreadsheet } from 'lucide-react';
import { formatCurrency } from '../types';
import { BankStatementNormalizer } from './BankStatementNormalizer';

interface BankAccountsViewProps {
  finOrganizationId: string;
  legalEntityId: string;
}

export function BankAccountsView({ finOrganizationId, legalEntityId }: BankAccountsViewProps) {
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importing, setImporting] = useState(false);

  const loadBankData = useCallback(async () => {
    setLoading(true);
    const { data: accounts } = await supabase
      .from('fin_bank_accounts')
      .select('*, gl_account:fin_accounts!gl_account_id(code, name)')
      .eq('fin_organization_id', finOrganizationId)
      .eq('legal_entity_id', legalEntityId);

    setBankAccounts(accounts || []);

    if (accounts && accounts.length > 0) {
      const activeId = selectedAccountId || accounts[0].id;
      setSelectedAccountId(activeId);

      const { data: txs } = await supabase
        .from('fin_bank_transactions')
        .select('*')
        .eq('bank_account_id', activeId)
        .order('transaction_date', { ascending: false })
        .limit(50);

      setTransactions(txs || []);
    }
    setLoading(false);
  }, [finOrganizationId, legalEntityId, selectedAccountId]);

  useEffect(() => {
    loadBankData();
  }, [loadBankData]);

  async function handleImportCSV(e: React.FormEvent) {
    e.preventDefault();
    if (!csvContent || !selectedAccountId) return;
    setImporting(true);
    try {
      const parsed = BankStatementNormalizer.parseCSV(csvContent);
      if (parsed.length === 0) {
        alert('No valid transactions found in CSV. Expected: Date, Description, Debit, Credit');
        return;
      }

      // Insert transactions into fin_bank_transactions
      const insertRows = parsed.map(tx => ({
        bank_account_id: selectedAccountId,
        transaction_date: tx.transaction_date,
        amount: tx.amount,
        transaction_type: tx.transaction_type,
        currency: tx.currency,
        description: tx.description,
        reference_number: tx.reference_number || null,
        payee_payer: tx.payee_payer || null,
        running_balance: tx.running_balance || null,
        match_status: 'UNMATCHED',
      }));

      const { error } = await supabase.from('fin_bank_transactions').insert(insertRows);
      if (error) throw error;

      // Trigger auto-matching stored procedure
      await supabase.rpc('fin_match_bank_transactions', {
        p_bank_account_id: selectedAccountId
      });

      setUploadOpen(false);
      setCsvContent('');
      await loadBankData();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  }

  const activeAccount = bankAccounts.find(a => a.id === selectedAccountId);

  return (
    <div className="space-y-4">
      {/* Account Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {bankAccounts.map(acc => (
          <Card
            key={acc.id}
            className={`p-3.5 cursor-pointer transition-all border ${
              acc.id === selectedAccountId ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-border/80'
            }`}
            onClick={() => setSelectedAccountId(acc.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-xs text-foreground">{acc.bank_name}</span>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono">
                {acc.account_number_mask}
              </Badge>
            </div>
            <div className="mt-2.5">
              <span className="text-[10px] text-muted-foreground block">Statement Balance</span>
              <p className="text-sm font-bold font-mono text-foreground">
                {formatCurrency(acc.current_statement_balance || 0, acc.currency)}
              </p>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
              <span>GL Account: {acc.gl_account?.code || '1113'}</span>
              <span>{acc.currency}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Showing transactions for <strong className="text-foreground">{activeAccount?.bank_name || 'Bank'} ({activeAccount?.account_number_mask})</strong>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setUploadOpen(true)}>
              <Upload className="w-3.5 h-3.5" />
              Upload Bank CSV
            </Button>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                  Import Bank Statement CSV
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleImportCSV} className="space-y-3 py-2 text-xs">
                <div>
                  <Label className="text-xs">Paste CSV Data (Date, Description, Ref, Debit, Credit)</Label>
                  <textarea
                    className="w-full h-36 font-mono text-[11px] p-2 rounded border bg-background"
                    placeholder={`Date,Description,Reference,Debit,Credit\n2026-08-15,NEFT CR BY ACME CORP,UTR8839201,,118000\n2026-08-18,PAYMENT TO AWS CLOUD,TXN448102,45000,`}
                    value={csvContent}
                    onChange={e => setCsvContent(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setUploadOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={importing}>
                    {importing ? 'Normalizing & Matching...' : 'Import & Auto-Match'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="sm" onClick={loadBankData}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Transaction Feed */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Bank Feed Transactions ({transactions.length})</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Date</th>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                  <th className="text-left py-2 px-3 font-medium">Reference</th>
                  <th className="text-right py-2 px-3 font-medium">Inflow (Cr)</th>
                  <th className="text-right py-2 px-3 font-medium">Outflow (Dr)</th>
                  <th className="text-center py-2 px-3 font-medium">Match Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-muted-foreground whitespace-nowrap">
                      {tx.transaction_date}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {tx.description}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">
                      {tx.reference_number || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-green-700">
                      {tx.transaction_type === 'CREDIT' ? formatCurrency(tx.amount, tx.currency) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-red-600">
                      {tx.transaction_type === 'DEBIT' ? formatCurrency(tx.amount, tx.currency) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={
                          tx.match_status === 'AUTO_MATCHED' ? 'default' :
                          tx.match_status === 'AI_PROPOSED' ? 'secondary' : 'outline'
                        }
                        className={`text-[9px] px-1 py-0 ${
                          tx.match_status === 'AUTO_MATCHED' ? 'bg-green-100 text-green-800' :
                          tx.match_status === 'UNMATCHED' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : ''
                        }`}
                      >
                        {tx.match_status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}

                {transactions.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No bank feed transactions found. Upload a statement CSV to begin.
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
