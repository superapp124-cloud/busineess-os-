import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
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
    const { conversationId, duration = 300 } = await req.json();
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get recent messages from conversation
    const cutoffTime = new Date(Date.now() - duration * 1000);
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        content,
        created_at,
        sender:profiles!sender_id(username)
      `)
      .eq('conversation_id', conversationId)
      .gte('created_at', cutoffTime.toISOString())
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ summary: "No messages to summarize in this time period." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format messages for AI
    const formattedMessages = messages
      .map((m: any) => {
        const senderName = Array.isArray(m.sender) ? m.sender[0]?.username : m.sender?.username;
        return `${senderName || 'Unknown'}: ${m.content}`;
      })
      .join('\n');

    // Call direct AI Provider
    const response = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes conversations. Provide concise, bullet-point summaries highlighting key topics, decisions, and action items."
        },
        {
          role: "user",
          content: `Summarize this conversation:\n\n${formattedMessages}`
        }
      ],
      temperature: 0.3,
      maxTokens: 500,
    });

    const summary = response.content || "Failed to generate summary";

    return new Response(
      JSON.stringify({ 
        summary,
        messageCount: messages.length,
        timeRange: `Last ${duration / 60} minutes`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Summarization error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
