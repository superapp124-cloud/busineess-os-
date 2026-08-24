import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  try {
    const { journal_entry_id, posted_by, skip_approval_check } = await req.json();
    if (!journal_entry_id || !posted_by) return new Response(JSON.stringify({ error: 'journal_entry_id and posted_by required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });

    // 1. Fetch the entry
    const { data: entry, error: fetchErr } = await supabase.from('fin_journal_entries').select('*').eq('id', journal_entry_id).maybeSingle();
    if (fetchErr || !entry) return new Response(JSON.stringify({ success: false, error: 'Journal entry not found' }), { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } });

    // 2. Status guard
    if (!['DRAFT','PENDING_APPROVAL'].includes(entry.status)) return new Response(JSON.stringify({ success: false, error: `Cannot post from status: ${entry.status}` }), { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } });

    // 3. Approval guard
    if (!skip_approval_check && entry.status === 'PENDING_APPROVAL' && !entry.approved_by) {
      return new Response(JSON.stringify({ success: false, error: 'Approval required before posting.', requires_approval: true }), { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // 4. Balance check (pre-flight before calling DB function)
    const { data: lines } = await supabase.from('fin_journal_lines').select('functional_debit, functional_credit').eq('journal_entry_id', journal_entry_id);
    if (!lines || lines.length < 2) return new Response(JSON.stringify({ success: false, error: 'At least 2 lines required' }), { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } });
    const totalDr = lines.reduce((s, l) => s + Number(l.functional_debit), 0);
    const totalCr = lines.reduce((s, l) => s + Number(l.functional_credit), 0);
    if (Math.abs(totalDr - totalCr) > 0.01) return new Response(JSON.stringify({ success: false, error: `Balance violation: Dr=${totalDr.toFixed(4)} Cr=${totalCr.toFixed(4)}` }), { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } });

    // 5. Atomic DB-level post (enforces period lock + immutability triggers + ledger refresh)
    const { data: result, error: postErr } = await supabase.rpc('fin_post_journal_entry', { p_entry_id: journal_entry_id, p_posted_by: posted_by });
    if (postErr) return new Response(JSON.stringify({ success: false, error: postErr.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });

    // 6. Update fin_event processing_status
    if (entry.source_event_id) {
      await supabase.from('fin_events').update({ processing_status: 'POSTED', processed_at: new Date().toISOString() }).eq('id', entry.source_event_id);
    }

    return new Response(JSON.stringify(result), { status: result.success ? 200 : 422, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
