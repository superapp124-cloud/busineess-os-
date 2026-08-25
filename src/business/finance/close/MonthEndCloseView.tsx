import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, RefreshCw, Lock, ShieldCheck, Sparkles, AlertCircle, XCircle, Loader2 } from 'lucide-react';

interface MonthEndCloseViewProps {
  finOrganizationId: string;
  legalEntityId: string;
  periodId: string;
}

export function MonthEndCloseView({ finOrganizationId, legalEntityId, periodId }: MonthEndCloseViewProps) {
  const [checklist, setChecklist] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [closeSuccess, setCloseSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmSignOff, setConfirmSignOff] = useState(false);

  const loadChecklist = useCallback(async () => {
    if (!periodId) return;
    setLoading(true);
    setCloseError(null);
    setActionError(null);

    const { data: chkId, error: initErr } = await supabase.rpc('fin_initialize_close_checklist', {
      p_period_id: periodId,
      p_entity_id: legalEntityId
    });

    if (initErr) {
      console.error('[MonthEndCloseView] init checklist error:', initErr.message);
    }

    if (chkId) {
      const { data: chk } = await supabase
        .from('fin_close_checklists')
        .select('*')
        .eq('id', chkId)
        .single();
      setChecklist(chk);

      const { data: tList } = await supabase
        .from('fin_close_tasks')
        .select('*')
        .eq('checklist_id', chkId)
        .order('sequence_order', { ascending: true });
      setTasks(tList || []);
    }
    setLoading(false);
  }, [periodId, legalEntityId]);

  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

  async function handleToggleTask(taskId: string, currentStatus: string) {
    setActionError(null);

    // Role check: minimum FINANCE_MANAGER required to toggle close tasks
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      setActionError('You must be signed in to update close tasks.');
      return;
    }

    const { data: roleData, error: roleErr } = await supabase
      .from('sys_tenant_users')
      .select('role')
      .eq('user_id', authData.user.id)
      .single();

    const allowedRoles = ['OWNER', 'CFO', 'FINANCE_MANAGER'];
    if (roleErr || !roleData || !allowedRoles.includes(roleData.role)) {
      setActionError(`Access denied: Only Finance Managers and above can update close tasks. Your role: ${roleData?.role || 'unknown'}.`);
      return;
    }

    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const { error: updateErr } = await supabase.from('fin_close_tasks').update({
      status: nextStatus,
      completed_at: nextStatus === 'COMPLETED' ? new Date().toISOString() : null,
      completed_by: nextStatus === 'COMPLETED' ? authData.user.id : null,
    }).eq('id', taskId);

    if (updateErr) {
      setActionError(`Failed to update task: ${updateErr.message}`);
      return;
    }

    await loadChecklist();
  }

  async function handleSignOff() {
    setConfirmSignOff(false);
    setClosing(true);
    setCloseError(null);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      setCloseError('Authentication required to close period.');
      setClosing(false);
      return;
    }

    // Try the fin_close_period RPC
    const { error: closeErr } = await supabase.rpc('fin_close_period', {
      p_period_id: periodId,
      p_entity_id: legalEntityId,
      p_user_id: authData.user.id,
    });

    if (closeErr) {
      // Distinguish RPC-not-found from authorization error
      if (closeErr.message.includes('function') && closeErr.message.includes('does not exist')) {
        setCloseError('Period close requires database function fin_close_period — contact your system administrator to deploy it.');
      } else if (closeErr.code === '42501' || closeErr.message.toLowerCase().includes('permission')) {
        setCloseError('You do not have permission to close this period. CFO or Owner role required.');
      } else {
        setCloseError(`Period close failed: ${closeErr.message}`);
      }
    } else {
      setCloseSuccess(true);
      await loadChecklist();
    }

    setClosing(false);
  }

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const isReadyForClose = progressPct === 100 && tasks.length > 0 && !closeSuccess;
  return (
    <div className="space-y-4">
      {/* Action Error */}
      {actionError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs">
          <XCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Close Error */}
      {closeError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs">
          <XCircle className="w-4 h-4 shrink-0" />
          {closeError}
        </div>
      )}

      {/* Close Success */}
      {closeSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-700 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Period successfully closed. Audit trail recorded.
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmSignOff && (
        <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-700 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
            <AlertCircle className="w-4 h-4" />
            Confirm Period Close — This action is irreversible
          </div>
          <p className="text-xs text-slate-300">
            Closing this period will lock all accounting entries. No journal entries may be posted after close without explicit reopening by a CFO. This action will be recorded in the audit trail.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setConfirmSignOff(false)}>
              Cancel
            </Button>
            <Button size="sm" className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white" onClick={handleSignOff}>
              {closing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              Confirm Close Period
            </Button>
          </div>
        </div>
      )}

      {/* Top Banner: Progress Bar */}
      <Card className="p-4 bg-gradient-to-r from-purple-500/10 via-background to-background">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              {checklist?.title || 'Month-End Close Checklist'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {tasks.length} close stages completed ({progressPct}%)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadChecklist} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {isReadyForClose && !confirmSignOff && (
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 bg-green-700 hover:bg-green-800 text-white"
                disabled={closing}
                onClick={() => setConfirmSignOff(true)}
              >
                {closing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Sign-Off & Close Period
              </Button>
            )}
            {progressPct < 100 && tasks.length > 0 && (
              <span className="text-[10px] text-slate-400 font-medium">
                {100 - progressPct}% remaining to unlock sign-off
              </span>
            )}
          </div>
        </div>

        <div className="mt-3">
          <Progress value={progressPct} className="h-2" />
        </div>
      </Card>

      {/* Task Sequence List */}
      <Card>
        <CardHeader className="py-2.5 px-4 border-b">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Ordered Close Sequence</span>
            <span>Policy: <strong>Deterministic Invariants</strong></span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {tasks.length === 0 && !loading && (
              <div className="p-6 text-center text-xs text-muted-foreground">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                No close tasks loaded. Period may not be initialized or RPC is unavailable.
              </div>
            )}
            {tasks.map(task => (
              <div
                key={task.id}
                className="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground w-5 text-center">{task.sequence_order}</span>
                  <div>
                    <span className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.task_name}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <Badge variant="outline" className="text-[9px] px-1 py-0">{task.category.replace(/_/g, ' ')}</Badge>
                      {task.is_automated && <span className="text-purple-600 font-medium">Automated</span>}
                    </div>
                  </div>
                </div>

                <Button
                  variant={task.status === 'COMPLETED' ? 'secondary' : 'outline'}
                  size="sm"
                  className={`h-7 text-xs px-2.5 gap-1.5 ${task.status === 'COMPLETED' ? 'text-green-700 bg-green-50 border-green-200' : ''}`}
                  onClick={() => handleToggleTask(task.id, task.status)}
                  disabled={closeSuccess}
                >
                  {task.status === 'COMPLETED' ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Completed</>
                  ) : (
                    <><Clock className="w-3.5 h-3.5 text-muted-foreground" /> Mark Done</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
