// supabase/functions/ai-chat/index.ts
// Multi-provider resilient AI chat endpoint powered by CHATR AI Router.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { completeChat } from '../_core/aiProvider.ts';
import { PlatformError } from '../_core/errors.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const chatResult = await completeChat({
      messages,
      model: model || undefined,
      maxTokens: 1000,
    });

    const content: string = chatResult.content ?? '';

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('ai-chat error:', err);
    const status = err instanceof PlatformError ? err.status : 500;
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
