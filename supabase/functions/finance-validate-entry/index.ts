import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

interface Line { account_id: string; debit_amount: number; credit_amount: number; currency: string; functional_debit: number; functional_credit: number; }
interface ValidationReq { fin_organization_id: string; legal_entity_id: string; period_id: string; posting_date: string; transaction_currency: string; functional_currency: string; accounting_standard: string; entry_type: string; lines: Line[]; }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  try {
    const body: ValidationReq = await req.json();
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Minimum 2 lines
    if (!body.lines || body.lines.length < 2) errors.push('At least 2 lines required.');

    // 2. Double-entry balance in functional currency (tolerance 0.01)
    const totalDr = (body.lines || []).reduce((s, l) => s + (l.functional_debit || 0), 0);
    const totalCr = (body.lines || []).reduce((s, l) => s + (l.functional_credit || 0), 0);
    const diff = Math.abs(totalDr - totalCr);
    if (diff > 0.01) errors.push(`Balance violated. Functional Dr=${totalDr.toFixed(4)} Cr=${totalCr.toFixed(4)} Diff=${diff.toFixed(4)}`);

    // 3. Each line: exactly one of debit/credit non-zero, no negatives, valid 3-char currency
    (body.lines || []).forEach((l, i) => {
      if (l.debit_amount > 0 && l.credit_amount > 0) errors.push(`Line ${i+1}: cannot have both debit and credit non-zero.`);
      if (l.debit_amount === 0 && l.credit_amount === 0) errors.push(`Line ${i+1}: both debit and credit are zero.`);
      if (l.debit_amount < 0 || l.credit_amount < 0) errors.push(`Line ${i+1}: negative amounts not allowed.`);
      if (!l.currency || l.currency.length !== 3) errors.push(`Line ${i+1}: invalid currency '${l.currency}'.`);
    });

    // 4. Period status check
    const { data: period } = await supabase.from('fin_periods').select('status').eq('id', body.period_id).maybeSingle();
    if (!period) {
      errors.push(`Period ${body.period_id} not found.`);
    } else if (period.status === 'CLOSED') {
      errors.push('Period is CLOSED. Reopen via workflow approval before posting.');
    } else if (period.status === 'SOFT_CLOSED' && !['ADJUSTMENT','CORRECTING','CLOSING','RESTATEMENT'].includes(body.entry_type)) {
      errors.push('Period is SOFT_CLOSED. Only ADJUSTMENT/CORRECTING/CLOSING/RESTATEMENT allowed.');
    } else if (period.status === 'SOFT_CLOSED') {
      warnings.push('Period is SOFT_CLOSED. Entry posted as adjustment.');
    }

    // 5. Account validity
    const accountIds = [...new Set((body.lines || []).map(l => l.account_id))];
    const { data: accounts } = await supabase.from('fin_accounts').select('id, code, name, is_active, allow_direct_posting').in('id', accountIds).eq('fin_organization_id', body.fin_organization_id);
    const foundIds = new Set((accounts || []).map(a => a.id));
    accountIds.forEach(id => { if (!foundIds.has(id)) errors.push(`Account ${id} not found in this organization.`); });
    (accounts || []).forEach(acc => {
      if (!acc.is_active) errors.push(`Account ${acc.code} (${acc.name}) is inactive.`);
      if (!acc.allow_direct_posting) errors.push(`Account ${acc.code} (${acc.name}) is a header account (no direct posting).`);
    });

    // 6. Functional currency matches entity
    const { data: entity } = await supabase.from('fin_legal_entities').select('functional_currency').eq('id', body.legal_entity_id).maybeSingle();
    if (entity && entity.functional_currency !== body.functional_currency) {
      warnings.push(`Functional currency mismatch: entry=${body.functional_currency}, entity=${entity.functional_currency}.`);
    }

    const valid = errors.length === 0;
    return new Response(JSON.stringify({ valid, errors, warnings, summary: { line_count: (body.lines||[]).length, total_functional_debit: totalDr, total_functional_credit: totalCr, balance_diff: diff } }), {
      status: valid ? 200 : 422, headers: { ...cors, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, errors: [String(err)] }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
