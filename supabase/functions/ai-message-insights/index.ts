import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, analysisType } = await req.json();
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided');
    }

    const conversationText = messages
      .map((m: any) => `${m.sender_name}: ${m.content}`)
      .join('\n');

    let systemPrompt = '';
    if (analysisType === 'sentiment') {
      systemPrompt = `Analyze the overall sentiment of this conversation. Return a JSON object with:
      - sentiment: "positive", "neutral", or "negative"
      - confidence: 0-100
      - summary: Brief explanation
      - mood_indicators: Array of detected emotions`;
    } else if (analysisType === 'topics') {
      systemPrompt = `Extract and list the main topics discussed in this conversation. Return a JSON object with:
      - topics: Array of main topics
      - keywords: Array of key terms
      - category: General category (work, personal, planning, etc.)`;
    } else if (analysisType === 'urgency') {
      systemPrompt = `Analyze the urgency and importance of this conversation. Return a JSON object with:
      - urgency: "low", "medium", or "high"
      - requires_action: boolean
      - deadline_mentioned: boolean
      - priority_score: 0-100`;
    } else if (analysisType === 'language') {
      systemPrompt = `Detect the languages used in this conversation. Return a JSON object with:
      - languages: Array of detected languages (ISO codes)
      - primary_language: Most used language
      - mixed_language: boolean`;
    } else {
      systemPrompt = `Analyze this conversation. Return a JSON object with: summary, sentiment, and key topics.`;
    }

    console.log('Analyzing messages:', analysisType);

    const response = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
      model: "gemini-2.5-flash-lite",
      responseFormat: { type: "json_object" },
      messages: [
        { 
          role: 'system', 
          content: systemPrompt + '\n\nReturn ONLY valid JSON, no markdown or explanations.' 
        },
        { role: 'user', content: conversationText }
      ],
      temperature: 0.2,
      maxTokens: 500,
    });

    let insights = response.content || '{}';
    insights = insights.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsedInsights = JSON.parse(insights);
      console.log('Insights generated successfully');
      
      return new Response(
        JSON.stringify({ insights: parsedInsights }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      console.error('Failed to parse insights JSON:', insights);
      return new Response(
        JSON.stringify({ insights: { error: 'Failed to parse AI response', raw: insights } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in ai-message-insights:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
