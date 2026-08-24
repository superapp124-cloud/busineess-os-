import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, ArrowUpRight, CheckCircle2, AlertCircle, Clock, Link as LinkIcon, ShieldCheck, FileCheck, Layers } from 'lucide-react';
import type { FinJournalEntry, FinJournalLine, FinEvent } from '../types';
import { formatCurrency } from '../types';

interface JournalEntryViewerProps {
  finOrganizationId: string;
  legalEntityId: string;
  periodId?: string;
}

export function JournalEntryViewer({ finOrganizationId, legalEntityId, periodId }: JournalEntryViewerProps) {
  const [entries, setEntries] = useState<FinJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Drilldown dialog state
  const [selectedEntry, setSelectedEntry] = useState<FinJournalEntry | null>(null);
  const [entryLines, setEntryLines] = useState<FinJournalLine[]>([]);
  const [sourceEvent, setSourceEvent] = useState<FinEvent | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('fin_journal_entries')
      .select('*')
      .eq('fin_organization_id', finOrganizationId)
      .eq('legal_entity_id', legalEntityId)
      .order('posting_date', { ascending: false });

    if (periodId) {
      query = query.eq('period_id', periodId);
    }

    if (statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to load journal entries:', error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  }, [finOrganizationId, legalEntityId, periodId, statusFilter]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  async function openEntryDetails(entry: FinJournalEntry) {
    setSelectedEntry(entry);
    setLoadingDetails(true);
    try {
      // 1. Fetch lines with joined account information
      const { data: linesData } = await supabase
        .from('fin_journal_lines')
        .select('*, account:fin_accounts(*)')
        .eq('journal_entry_id', entry.id)
        .order('line_number');

      setEntryLines(linesData || []);

      // 2. Fetch source event if present (traceability)
      if (entry.source_event_id) {
        const { data: eventData } = await supabase
          .from('fin_events')
          .select('*')
          .eq('id', entry.source_event_id)
          .maybeSingle();

        setSourceEvent(eventData || null);
      } else {
        setSourceEvent(null);
      }
    } catch (err: any) {
      console.error('Failed to load entry details:', err);
    } finally {
      setLoadingDetails(false);
    }
  }

  const filtered = entries.filter(e => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      e.entry_number.toLowerCase().includes(s) ||
      (e.memo && e.memo.toLowerCase().includes(s)) ||
      e.source_type.toLowerCase().includes(s) ||
      (e.source_id && e.source_id.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-xs w-64"
              placeholder="Search entry #, memo, source..."
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
              <SelectItem value="POSTED">Posted</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              <SelectItem value="REVERSED">Reversed</SelectItem>
              <SelectItem value="VOID">Void</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="sm" onClick={loadEntries}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Journal Table */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {filtered.length} journal entries</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Entry #</th>
                  <th className="text-left py-2 px-3 font-medium">Posting Date</th>
                  <th className="text-left py-2 px-3 font-medium">Source Event / Type</th>
                  <th className="text-left py-2 px-3 font-medium">Memo</th>
                  <th className="text-center py-2 px-3 font-medium">Standard</th>
                  <th className="text-center py-2 px-3 font-medium">Status</th>
                  <th className="text-right py-2 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map(je => (
                  <tr key={je.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                      {je.entry_number}
                      {je.ai_proposed && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-1.5 bg-blue-50 text-blue-700">
                          AI
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {je.posting_date}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {je.source_type}
                        </Badge>
                        {je.source_event_id && (
                          <span title="Direct business event provenance">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-foreground">
                      {je.memo || <span className="text-muted-foreground italic">No memo</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {je.accounting_standard}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={
                          je.status === 'POSTED' ? 'default' :
                          je.status === 'PENDING_APPROVAL' ? 'secondary' :
                          je.status === 'REVERSED' ? 'destructive' : 'outline'
                        }
                        className="text-[10px] px-1.5 py-0 capitalize"
                      >
                        {je.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2 gap-1 text-primary"
                        onClick={() => openEntryDetails(je)}
                      >
                        Details
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No journal entries found matching current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Drill-down / Lineage Inspection Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={open => !open && setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <DialogTitle className="text-base flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-500" />
                Journal Entry: {selectedEntry?.entry_number}
              </DialogTitle>
              <Badge variant={selectedEntry?.status === 'POSTED' ? 'default' : 'secondary'} className="capitalize">
                {selectedEntry?.status.toLowerCase().replace('_', ' ')}
              </Badge>
            </div>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-4 py-2 text-xs">
              {/* Header meta */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border">
                <div>
                  <span className="text-muted-foreground block">Posting Date</span>
                  <strong className="text-foreground">{selectedEntry.posting_date}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Currencies</span>
                  <strong className="text-foreground">
                    {selectedEntry.transaction_currency} → {selectedEntry.functional_currency}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Standard</span>
                  <strong className="text-foreground">{selectedEntry.accounting_standard}</strong>
                </div>
                <div className="col-span-3 pt-2 border-t mt-1">
                  <span className="text-muted-foreground block">Memo / Reference</span>
                  <p className="text-foreground">{selectedEntry.memo || 'None'}</p>
                </div>
              </div>

              {/* Source Lineage Block — THE core differentiator */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 font-medium text-amber-900">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Source Lineage & Provenance
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-amber-900/80">
                  <div>
                    <span className="text-amber-700 block">Source Subsystem</span>
                    <code>{selectedEntry.source_type}</code>
                  </div>
                  <div>
                    <span className="text-amber-700 block">Source Object ID</span>
                    <code>{selectedEntry.source_id || 'N/A'}</code>
                  </div>
                </div>

                {sourceEvent ? (
                  <div className="pt-2 border-t border-amber-200/60 text-[11px]">
                    <div className="flex items-center justify-between text-amber-800">
                      <span>Event Type: <strong>{sourceEvent.event_type}</strong></span>
                      <span className="font-mono text-[10px]">Idempotency: {sourceEvent.idempotency_key.substring(0, 16)}...</span>
                    </div>
                    {sourceEvent.payload && (
                      <pre className="mt-1.5 p-2 bg-amber-100/50 rounded font-mono text-[10px] overflow-x-auto max-h-24">
                        {JSON.stringify(sourceEvent.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-700/80 italic">
                    {selectedEntry.source_event_id ? 'Loading source event metadata...' : 'Manual or direct system entry.'}
                  </p>
                )}
              </div>

              {/* Debit / Credit Lines Table */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Double-Entry Lines</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left p-2 font-medium">Account</th>
                        <th className="text-left p-2 font-medium">Memo</th>
                        <th className="text-right p-2 font-medium w-28">Debit ({selectedEntry.functional_currency})</th>
                        <th className="text-right p-2 font-medium w-28">Credit ({selectedEntry.functional_currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {entryLines.map(line => (
                        <tr key={line.id}>
                          <td className="p-2">
                            <span className="font-mono font-medium mr-1">
                              {(line as any).account?.code || '---'}
                            </span>
                            {(line as any).account?.name || line.account_id}
                          </td>
                          <td className="p-2 text-muted-foreground">{line.memo || '-'}</td>
                          <td className="p-2 text-right font-mono font-medium">
                            {line.functional_debit > 0 ? formatCurrency(line.functional_debit, selectedEntry.functional_currency) : '-'}
                          </td>
                          <td className="p-2 text-right font-mono font-medium">
                            {line.functional_credit > 0 ? formatCurrency(line.functional_credit, selectedEntry.functional_currency) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/30 border-t font-semibold">
                      <tr>
                        <td colSpan={2} className="p-2 text-right">Totals:</td>
                        <td className="p-2 text-right font-mono">
                          {formatCurrency(
                            entryLines.reduce((s, l) => s + Number(l.functional_debit), 0),
                            selectedEntry.functional_currency
                          )}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {formatCurrency(
                            entryLines.reduce((s, l) => s + Number(l.functional_credit), 0),
                            selectedEntry.functional_currency
                          )}
                        </td>
                      </tr>
                    </tfoot>
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
