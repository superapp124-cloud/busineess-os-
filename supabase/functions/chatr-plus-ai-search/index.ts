import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    const response = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
      model: "gemini-2.5-flash",
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for Chatr+, a superapp for local services in India. 
When users search for something, analyze their intent and suggest relevant service categories and keywords.

Available categories:
- Food & Dining: restaurants, home food, chai, biryani, cafes
- Home Services: plumbers, electricians, cleaners, carpenters, repairs
- Healthcare: doctors, dentists, clinics, labs, consultations
- Beauty & Wellness: salons, spas, massage, beauty treatments
- Local Jobs: hire helpers, drivers, maids, gig workers
- Education: tutors, coaching, skill training
- Business Tools: mini-apps, listings, dashboards

Return a JSON object with:
{
  "category": "most relevant category",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "intent": "brief description of what user wants",
  "suggestions": ["service suggestion 1", "service suggestion 2"]
}`
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.7,
      maxTokens: 300
    });

    const aiContent = response.content;

    let parsedResult;
    try {
      parsedResult = JSON.parse(aiContent);
    } catch {
      const match = aiContent.match(/\{[\s\S]*\}/);
      if (match) {
        parsedResult = JSON.parse(match[0]);
      } else {
        parsedResult = {
          category: "general",
          keywords: [query],
          intent: query,
          suggestions: []
        };
      }
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in chatr-plus-ai-search:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        suggestions: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
