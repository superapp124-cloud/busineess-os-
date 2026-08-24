import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../types';
import { useAuth } from '@/contexts/AuthContext';

interface RevenueSchedulesViewProps {
  finOrganizationId: string;
}

export function RevenueSchedulesView({ finOrganizationId }: RevenueSchedulesViewProps) {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recognizingId, setRecognizingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('fin_revenue_schedules')
      .select('*, contract:fin_contracts(contract_number, title), obligation:fin_performance_obligations(title)')
      .order('scheduled_date', { ascending: true });

    if (statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    setSchedules(data || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  async function handleRecognize(scheduleId: string) {
    if (!user) return;
    setRecognizingId(scheduleId);
    try {
      const { data, error } = await supabase.rpc('fin_recognize_schedule_item', {
        p_schedule_id: scheduleId,
        p_user_id: user.id
      });
      if (error) throw error;
      await loadSchedules();
    } catch (err: any) {
      alert(`Recognition failed: ${err.message}`);
    } finally {
      setRecognizingId(null);
    }
  }

  const pendingSchedules = schedules.filter(s => s.status === 'SCHEDULED');
  const totalScheduled = pendingSchedules.reduce((sum, s) => sum + (Number(s.scheduled_amount) || 0), 0);

  return (
    <div className="space-y-4">
      {/* KPI Top Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-3 bg-blue-50/50 border-blue-200">
          <p className="text-[11px] text-blue-900 font-medium">Scheduled Revenue to Recognize</p>
          <p className="text-sm font-bold font-mono text-blue-950 mt-1">
            {formatCurrency(totalScheduled, 'INR')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">Upcoming Monthly Releases</p>
          <p className="text-sm font-bold font-mono text-foreground mt-1">
            {pendingSchedules.length} schedule periods
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted-foreground">Deterministic ASC 606 Engine</p>
          <div className="flex items-center gap-1 mt-1 text-green-700 font-medium text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active & Policy-Guarded</span>
          </div>
        </Card>
      </div>

      {/* Filter and Action Header */}
      <div className="flex items-center justify-between gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="All Schedules" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Schedules</SelectItem>
            <SelectItem value="SCHEDULED">Pending Recognition</SelectItem>
            <SelectItem value="RECOGNIZED">Recognized</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" onClick={loadSchedules}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {schedules.length} recognition schedule periods</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Scheduled Date</th>
                  <th className="text-left py-2 px-3 font-medium">Contract & Obligation</th>
                  <th className="text-right py-2 px-3 font-medium">Scheduled Amount</th>
                  <th className="text-center py-2 px-3 font-medium">Status</th>
                  <th className="text-right py-2 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {schedules.map(sched => (
                  <tr key={sched.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-muted-foreground whitespace-nowrap">
                      {sched.scheduled_date}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground">{sched.contract?.contract_number} — {sched.contract?.title}</div>
                      <div className="text-[10px] text-muted-foreground">{sched.obligation?.title}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                      {formatCurrency(sched.scheduled_amount, sched.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={sched.status === 'RECOGNIZED' ? 'default' : 'secondary'}
                        className="text-[10px] px-1.5 py-0 capitalize"
                      >
                        {sched.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {sched.status === 'SCHEDULED' ? (
                        <Button
                          size="sm"
                          className="h-6 text-xs px-2.5 gap-1 bg-green-700 hover:bg-green-800 text-white"
                          disabled={recognizingId === sched.id}
                          onClick={() => handleRecognize(sched.id)}
                        >
                          {recognizingId === sched.id ? 'Posting...' : 'Recognize to GL'}
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      ) : (
                        <span className="text-[11px] text-green-700 font-mono flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Posted
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {schedules.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No revenue recognition schedules found.
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
