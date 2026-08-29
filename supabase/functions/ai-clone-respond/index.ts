import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, sender_id, target_handle, conversation_id } = await req.json();

    if (!message || !target_handle) {
      return new Response(JSON.stringify({ error: "message and target_handle required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve the target identity
    const { data: identity, error: idError } = await supabase
      .from("user_identities")
      .select("*, profiles!inner(username, avatar_url)")
      .eq("full_handle", target_handle)
      .eq("is_active", true)
      .eq("ai_clone_enabled", true)
      .single();

    if (idError || !identity) {
      return new Response(JSON.stringify({ error: "AI clone not found or not active" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the user's message history for tone learning
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("content, sender_id")
      .eq("sender_id", identity.user_id)
      .order("created_at", { ascending: false })
      .limit(20);

    const userTone = recentMessages?.map(m => m.content).join("\n") || "";

    // Build the AI prompt
    const personality = identity.ai_clone_personality || "friendly and helpful";
    const boundaries = identity.ai_clone_boundaries || {};
    const ownerName = identity.profiles?.username || identity.handle;

    const systemPrompt = `You are the AI clone of ${ownerName} on CHATR messaging platform.

PERSONALITY: ${personality}

BOUNDARIES:
- Allow job inquiries: ${boundaries.allow_job_inquiries ?? true}
- Allow business chats: ${boundaries.allow_business ?? true}
- Allow networking: ${boundaries.allow_networking ?? true}
- Max reply length: ${boundaries.max_reply_length ?? 500} characters

TONE REFERENCE (based on ${ownerName}'s actual messages):
${userTone.slice(0, 1000)}

RULES:
1. Reply as if you ARE ${ownerName}, not an AI
2. Keep the tone natural and conversational
3. If asked something outside boundaries, politely say "${ownerName} will get back to you personally"
4. Never reveal sensitive info (phone, address, passwords)
5. Be helpful but concise
6. If the topic requires the real person, say "I'll let ${ownerName} know about this"`;

    const response = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["openrouter", "groq"],
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      maxTokens: boundaries.max_reply_length || 500,
    });

    const reply = response.content || "I'll get back to you soon.";

    return new Response(JSON.stringify({
      reply,
      clone_handle: target_handle,
      owner_name: ownerName,
      is_ai_response: true,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("AI clone error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
