import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SummaryRequest {
  callId: string;
  transcript?: string;
  duration?: number;
  participants?: string[];
}

interface CallSummary {
  summary: string;
  keyPoints: string[];
  actionItems: Array<{ task: string; assignee?: string; dueDate?: string }>;
  topics: string[];
  sentiment: string;
  followUpRequired: boolean;
  nextSteps: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { callId, transcript, duration, participants }: SummaryRequest = await req.json();

    console.log('[call-summary] Generating summary for call:', callId);

    if (!callId) {
      return new Response(
        JSON.stringify({ error: 'Call ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch call details if not provided
    let callTranscript = transcript;
    if (!callTranscript) {
      const { data: transcriptions } = await supabaseClient
        .from('call_transcriptions')
        .select('text')
        .eq('call_id', callId)
        .order('timestamp', { ascending: true });
      
      if (transcriptions && transcriptions.length > 0) {
        callTranscript = transcriptions.map(t => t.text).join(' ');
      }
    }

    let result: CallSummary = {
      summary: 'Call summary not available',
      keyPoints: [],
      actionItems: [],
      topics: [],
      sentiment: 'neutral',
      followUpRequired: false,
      nextSteps: [],
    };

    if (callTranscript) {
      const prompt = `Generate a comprehensive call summary for this conversation.

Call Duration: ${duration ? `${Math.floor(duration / 60)} minutes` : 'Unknown'}
Participants: ${participants?.join(', ') || 'Unknown'}

Transcript:
"${callTranscript}"

Return a JSON object with:
- summary: 2-3 sentence summary of the call
- keyPoints: array of 3-5 key discussion points
- actionItems: array of objects with {task: string, assignee?: string, dueDate?: string}
- topics: array of main topics discussed
- sentiment: overall call sentiment (positive/negative/neutral)
- followUpRequired: boolean if follow-up is needed
- nextSteps: array of recommended next steps

Return ONLY valid JSON, no markdown.`;

      try {
        const chatResult = await completeChat({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          maxTokens: 2048,
        });

        const responseText = chatResult.content || '';
        const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        result = {
          ...result,
          ...parsed,
        };
        console.log('[call-summary] Generated summary:', result.summary.substring(0, 50));
      } catch (parseError) {
        console.error('[call-summary] Parse or AI error:', parseError);
      }
    } else {
      result.summary = 'No transcript available for this call';
    }

    // Store summary in database
    await supabaseClient
      .from('calls')
      .update({ 
        quality_metrics: {
          ai_summary: result.summary,
          key_points: result.keyPoints,
          action_items: result.actionItems,
          topics: result.topics,
          follow_up_required: result.followUpRequired,
        }
      })
      .eq('id', callId);

    return new Response(
      JSON.stringify({
        success: true,
        callId,
        ...result,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[call-summary] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
