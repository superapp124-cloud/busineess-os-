import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { completeChat } from "../_core/aiProvider.ts";
import { PlatformError } from "../_core/errors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoachingRequest {
  transcript: string;
  sentiment?: string;
  urgency?: string;
  context?: 'sales' | 'support' | 'general';
  agentName?: string;
}

interface CoachingResponse {
  suggestions: string[];
  talkingPoints: string[];
  warningFlags: string[];
  recommendedActions: string[];
  toneAdvice: string;
  nextBestAction: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, sentiment, urgency, context = 'support', agentName }: CoachingRequest = await req.json();

    console.log('[ai-coaching] Request:', { transcriptLength: transcript?.length, sentiment, urgency, context });

    if (!transcript || transcript.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Transcript required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: CoachingResponse = {
      suggestions: [],
      talkingPoints: [],
      warningFlags: [],
      recommendedActions: [],
      toneAdvice: 'Maintain a professional and helpful tone',
      nextBestAction: 'Continue listening actively',
    };

    const systemPrompt = context === 'sales' 
      ? 'You are a real-time sales coaching AI helping agents close deals effectively.'
      : context === 'support'
      ? 'You are a real-time customer support coaching AI helping agents resolve issues efficiently.'
      : 'You are a real-time call coaching AI helping agents communicate effectively.';

    const userPrompt = `Analyze this live call transcript and provide real-time coaching for the agent${agentName ? ` (${agentName})` : ''}.

Current sentiment: ${sentiment || 'unknown'}
Urgency level: ${urgency || 'unknown'}

Transcript:
"${transcript}"

Return a JSON object with:
- suggestions: array of 2-3 short, actionable suggestions for the agent right now
- talkingPoints: array of 2-3 key points the agent should mention
- warningFlags: array of any concerning phrases or issues to address
- recommendedActions: array of specific actions to take
- toneAdvice: one sentence about tone/approach to use
- nextBestAction: the single most important thing to do next

Keep all text very brief and actionable (under 20 words each). Return ONLY valid JSON.`;

    try {
      const chatResult = await completeChat({
        messages: [
          { role: 'system', content: `${systemPrompt}\n\nReturn ONLY a valid JSON object matching the requested schema. Do not include markdown code block formatting.` },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
        maxTokens: 1024,
        responseFormat: { type: "json_object" }
      });

      const responseText = chatResult.content || '';
      const jsonStr = responseText.replace(/^```json\s*|```$/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      result = { ...result, ...parsed };
      console.log('[ai-coaching] Generated coaching:', result.nextBestAction);
    } catch (routerError) {
      console.warn('[ai-coaching] Router fallback to rule-based coaching:', routerError);
      // Basic fallback coaching
      const lowerTranscript = transcript.toLowerCase();
      
      if (lowerTranscript.includes('angry') || lowerTranscript.includes('frustrated')) {
        result.suggestions = ['Acknowledge their frustration', 'Offer a solution or escalation'];
        result.warningFlags = ['Customer appears frustrated'];
        result.toneAdvice = 'Use a calm, empathetic tone';
      }
      
      if (lowerTranscript.includes('cancel') || lowerTranscript.includes('refund')) {
        result.talkingPoints = ['Ask about their specific concerns', 'Offer alternatives before proceeding'];
        result.nextBestAction = 'Understand the root cause before processing';
      }
      
      if (urgency === 'high') {
        result.recommendedActions = ['Prioritize resolution', 'Offer immediate callback if needed'];
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        coaching: result,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[ai-coaching] Error:', error);
    const status = error instanceof PlatformError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
