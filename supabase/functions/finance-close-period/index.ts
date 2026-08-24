import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });

  try {
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });

    const { period_id, action, reason }: { period_id: string; action: string; reason?: string } = await req.json();
    if (!period_id || !action) return new Response(JSON.stringify({ error: 'period_id and action required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });

    const { data: period } = await supabase.from('fin_periods').select('*').eq('id', period_id).maybeSingle();
    if (!period) return new Response(JSON.stringify({ error: 'Period not found' }), { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } });

    const now = new Date().toISOString();
    let newStatus: string;
    let updateData: Record<string, unknown>;

    if (action === 'soft_close') {
      if (!['OPEN','REOPENED'].includes(period.status)) return new Response(JSON.stringify({ error: `Cannot soft-close from ${period.status}` }), { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } });
      newStatus = 'SOFT_CLOSED';
      updateData = { status: newStatus, soft_closed_at: now, soft_closed_by: user.id };
    } else if (action === 'close') {
      if (!['OPEN','SOFT_CLOSED','REOPENED'].includes(period.status)) return new Response(JSON.stringify({ error: `Cannot close from ${period.status}` }), { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } });
      const { count } = await supabase.from('fin_journal_entries').select('id', { count: 'exact', head: true }).eq('period_id', period_id).in('status', ['DRAFT','PENDING_APPROVAL']);
      if (count && count > 0) return new Response(JSON.stringify({ error: `${count} unposted entries exist. Post or void before closing.`, unposted_count: count }), { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } });
      newStatus = 'CLOSED';
      updateData = { status: newStatus, closed_at: now, closed_by: user.id };
    } else if (action === 'reopen') {
      if (period.status !== 'CLOSED') return new Response(JSON.stringify({ error: `Can only reopen CLOSED periods. Status: ${period.status}` }), { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } });
      // Mandatory HITL for period reopen
      const { data: approval } = await supabase.from('workflow_approvals').insert({ run_id: '00000000-0000-0000-0000-000000000000', node_id: 'fin_period_reopen', correlation_id: `period_reopen:${period_id}`, tenant_id: period.fin_organization_id, routing_type: 'role_based', status: 'pending', assigned_to: ['admin'], override_reason: reason || 'Period reopen requested' }).select('id').maybeSingle();
      newStatus = 'REOPENED';
      updateData = { status: newStatus, reopened_at: now, reopened_by: user.id, reopen_approval_id: approval?.id ?? null, reopen_reason: reason ?? null };
    } else {
      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    await supabase.from('fin_periods').update(updateData).eq('id', period_id);
    await supabase.from('os_events').insert({ event_type: `finance.period.${action}d`, level: 'info', source_subsystem: 'finance-close-period', payload: { period_id, period_name: period.period_name, action, new_status: newStatus, actor: user.id, reason: reason ?? null } });

    return new Response(JSON.stringify({ success: true, period_id, action, new_status: newStatus }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
