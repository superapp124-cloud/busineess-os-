import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, messageText, system_prompt, action, messages } = body;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured in Supabase secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the user text from whatever was sent
    let userText = prompt || messageText || "";
    if (!userText && messages && Array.isArray(messages)) {
      userText = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
    }

    if (!userText) {
      return new Response(
        JSON.stringify({ error: "No prompt or messageText provided." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemInstruction = system_prompt || "You are CHATR AI — a helpful, intelligent, and concise executive assistant. Provide professional, action-oriented responses.";

    // Try Gemini models in order
    const models = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash-lite", "gemini-1.5-pro-latest"];

    for (const model of models) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: userText }] }],
          }),
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return new Response(
            JSON.stringify({ success: true, response: text, summary: text, model }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else if (geminiRes.status === 404) {
        continue; // try next model
      } else {
        const errBody = await geminiRes.text();
        console.error(`[ai-chat-assistant] Gemini ${model} error ${geminiRes.status}:`, errBody);
        break;
      }
    }

    return new Response(
      JSON.stringify({ error: "All Gemini models failed. Check GEMINI_API_KEY in Supabase secrets." }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[ai-chat-assistant] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
