import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { completeChat } from "../_core/aiProvider.ts";
import { PlatformError } from "../_core/errors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, model } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chatResult = await completeChat({
      messages: [
        {
          role: "system",
          content: "You are Prechu AI, a helpful and friendly AI assistant for CHATR. You help users with their tasks, answer questions, and provide assistance. Be concise, helpful, and warm in your responses.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: model || undefined,
      temperature: 0.7,
      maxTokens: 1024,
    });

    const aiResponse = chatResult.content || "I'm here to help! Ask me anything.";

    return new Response(
      JSON.stringify({ success: true, response: aiResponse }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: unknown) {
    console.error("AI assistant error:", error);
    const status = error instanceof PlatformError ? error.status : 500;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
