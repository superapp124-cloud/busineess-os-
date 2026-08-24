import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, RefreshCw, Lock, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MonthEndCloseViewProps {
  finOrganizationId: string;
  legalEntityId: string;
  periodId: string;
}

export function MonthEndCloseView({ finOrganizationId, legalEntityId, periodId }: MonthEndCloseViewProps) {
  const { user } = useAuth();
  const [checklist, setChecklist] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  const loadChecklist = useCallback(async () => {
    if (!periodId) return;
    setLoading(true);

    // Initialize or fetch checklist
    const { data: chkId } = await supabase.rpc('fin_initialize_close_checklist', {
      p_period_id: periodId,
      p_entity_id: legalEntityId
    });

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
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    await supabase.from('fin_close_tasks').update({
      status: nextStatus,
      completed_at: nextStatus === 'COMPLETED' ? new Date().toISOString() : null,
      completed_by: nextStatus === 'COMPLETED' && user ? user.id : null,
    }).eq('id', taskId);

    await loadChecklist();
  }

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const isReadyForClose = progressPct === 100;

  return (
    <div className="space-y-4">
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
            <Button variant="ghost" size="sm" onClick={loadChecklist}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {isReadyForClose && (
              <Button size="sm" className="h-8 text-xs gap-1.5 bg-green-700 hover:bg-green-800 text-white">
                <Lock className="w-3.5 h-3.5" />
                Sign-Off & Close Period
              </Button>
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
                >
                  {task.status === 'COMPLETED' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      Mark Done
                    </>
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
