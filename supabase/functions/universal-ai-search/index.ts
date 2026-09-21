// Universal AI search intent detection using CHATR AI Router
import { completeChat } from "../_core/aiProvider.ts";
import { PlatformError } from "../_core/errors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsedIntent;
    try {
      const chatResult = await completeChat({
        messages: [
          {
            role: 'system',
            content: `You are an AI search assistant for Chatr.chat - a universal search platform.
Analyze the user's search query and extract:
1. Intent: What is the user looking for?
2. Category: Main category
3. Keywords: Important search terms
4. Location intent: If location mentioned or implied
5. Suggestions: 3-5 related search suggestions

Respond in JSON format:
{
  "intent": "brief intent description",
  "category": "main category",
  "keywords": ["keyword1", "keyword2"],
  "location": "location if mentioned or null",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`
          },
          {
            role: 'user',
            content: `Analyze this search query: "${query}"`
          }
        ],
        temperature: 0.3,
      });

      const aiMessage = chatResult.content || '{}';
      const cleaned = aiMessage.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedIntent = JSON.parse(cleaned);
    } catch (aiErr) {
      console.warn('AI search intent parsing fallback:', aiErr);
      parsedIntent = {
        intent: 'general search',
        category: 'general',
        keywords: [query],
        location: null,
        suggestions: [`Find ${query}`, `Best ${query}`, `${query} near me`]
      };
    }

    return new Response(
      JSON.stringify(parsedIntent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Universal AI Search error:', error);
    const status = error instanceof PlatformError ? error.status : 500;
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
