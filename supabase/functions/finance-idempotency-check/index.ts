import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { idempotency_key } = await req.json();
    if (!idempotency_key) return new Response(JSON.stringify({ error: 'idempotency_key required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data, error } = await supabase.from('fin_events').select('id, processing_status, processed_at, error_detail').eq('idempotency_key', idempotency_key).maybeSingle();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });

    return new Response(JSON.stringify({
      exists: !!data,
      event_id: data?.id ?? null,
      processing_status: data?.processing_status ?? null,
      processed_at: data?.processed_at ?? null,
      error_detail: data?.error_detail ?? null,
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
